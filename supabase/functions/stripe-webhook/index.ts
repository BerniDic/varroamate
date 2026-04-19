import Stripe from 'npm:stripe@17.7.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const PRICE_TO_PLAN: Record<string, string> = {
  [Deno.env.get('PRICE_FREEAI_MONTHLY') ?? '']:    'free_ai',
  [Deno.env.get('PRICE_FREEAI_ANNUAL') ?? '']:     'free_ai',
  [Deno.env.get('PRICE_HOBBYIST_MONTHLY') ?? '']:  'hobbyist',
  [Deno.env.get('PRICE_HOBBYIST_ANNUAL') ?? '']:   'hobbyist',
  [Deno.env.get('PRICE_BEEKEEPER_MONTHLY') ?? '']: 'beekeeper',
  [Deno.env.get('PRICE_BEEKEEPER_ANNUAL') ?? '']:  'beekeeper',
}

// Statuses that grant full plan access (trialing = full access during free trial)
function isActiveStatus(status: string): boolean {
  return status === 'active' || status === 'trialing'
}

function safeDate(ts: number | null | undefined): string | null {
  if (!ts) return null
  try { return new Date(ts * 1000).toISOString() } catch { return null }
}

async function getUserIdFromCustomer(
  stripe: Stripe,
  sb: ReturnType<typeof createClient>,
  customerId: string
): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (!('deleted' in customer) && customer.metadata?.supabase_user_id) {
      return customer.metadata.supabase_user_id
    }
    const { data } = await sb.from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    return data?.user_id ?? null
  } catch (e) {
    console.error('getUserIdFromCustomer error:', e)
    return null
  }
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()
    console.log('Webhook received, signature present:', !!signature)

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-01-27.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    let event: Stripe.Event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body, signature!, Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      )
    } catch (err) {
      console.error('Webhook signature failed:', err)
      return new Response('Signature verification failed', { status: 400 })
    }

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    console.log('Webhook event:', event.type)

    // ── checkout.session.completed ──────────────────────────────────────────
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.supabase_user_id
      console.log('Session completed, userId:', userId, 'sub:', session.subscription)

      if (userId && session.subscription) {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan = PRICE_TO_PLAN[priceId] ?? 'free_ai'
        // Grant full access during trial
        const effectivePlan = isActiveStatus(sub.status) ? plan : 'free'
        console.log(`Updating: user=${userId} plan=${effectivePlan} status=${sub.status}`)

        const { error } = await sb.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_sub_id: sub.id,
          plan: effectivePlan,
          status: sub.status,
          current_period_end: safeDate(sub.current_period_end),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        if (error) console.error('Upsert error:', error)
        else console.log('Subscription updated successfully')
      }
      await sb.from('checkouts').update({ status: 'completed' }).eq('stripe_id', session.id)
    }

    // ── customer.subscription.updated ──────────────────────────────────────
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.supabase_user_id
      if (!userId) userId = await getUserIdFromCustomer(stripe, sb, sub.customer as string)
      console.log('Subscription updated, userId:', userId, 'status:', sub.status)

      if (userId) {
        const priceId = sub.items.data[0]?.price.id ?? ''
        const plan = PRICE_TO_PLAN[priceId] ?? 'free_ai'
        // Grant full access during trial
        const effectivePlan = isActiveStatus(sub.status) ? plan : 'free'

        const { error } = await sb.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: sub.customer as string,
          stripe_sub_id: sub.id,
          plan: effectivePlan,
          status: sub.status,
          current_period_end: safeDate(sub.current_period_end),
          cancel_at_period_end: sub.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        if (error) console.error('Upsert error:', error)
        else console.log(`Updated: user=${userId} plan=${effectivePlan} status=${sub.status}`)
      }
    }

    // ── customer.subscription.trial_will_end ───────────────────────────────
    // Fired 3 days before trial ends — log it for future email reminders
    if (event.type === 'customer.subscription.trial_will_end') {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.supabase_user_id
      if (!userId) userId = await getUserIdFromCustomer(stripe, sb, sub.customer as string)
      console.log(`Trial ending soon: user=${userId} trial_end=${safeDate(sub.trial_end)}`)
      // Future: trigger reminder email here
    }

    // ── customer.subscription.deleted ──────────────────────────────────────
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription
      let userId = sub.metadata?.supabase_user_id
      if (!userId) userId = await getUserIdFromCustomer(stripe, sb, sub.customer as string)

      if (userId) {
        await sb.from('subscriptions').update({
          status: 'canceled', plan: 'free', updated_at: new Date().toISOString(),
        }).eq('user_id', userId)
        console.log(`Subscription ended: user=${userId}`)
      }
    }

    // ── invoice.payment_failed ──────────────────────────────────────────────
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        await sb.from('subscriptions').update({
          status: 'past_due', updated_at: new Date().toISOString(),
        }).eq('stripe_sub_id', invoice.subscription as string)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unhandled webhook error:', err)
    return new Response(JSON.stringify({ received: true, error: String(err) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
