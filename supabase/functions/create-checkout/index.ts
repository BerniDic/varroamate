import Stripe from 'npm:stripe@14.21.0'
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors })
  }

  const rawBody = await req.text()
  if (!rawBody) {
    return new Response(JSON.stringify({ error: 'Empty body' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  let price_id: string
  let trial: boolean = false
  try {
    const body = JSON.parse(rawBody)
    price_id = body.price_id
    trial = body.trial === true
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  if (!price_id) {
    return new Response(JSON.stringify({ error: 'Missing price_id' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'No auth header' }), {
      status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-04-10',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const sb = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await sb.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Checkout: user=${user.id} price=${price_id} trial=${trial}`)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: existing } = await admin
      .from('subscriptions')
      .select('stripe_customer_id, plan')
      .eq('user_id', user.id)
      .maybeSingle()

    // Block trial if user has already had any paid plan
    const hadPaidPlan = existing?.plan && existing.plan !== 'free'
    if (trial && hadPaidPlan) {
      trial = false
      console.log('Trial blocked — user already had a paid plan')
    }

    let customerId = existing?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      console.log('Created customer:', customerId)
    }

    const subscriptionData: any = {
      metadata: { supabase_user_id: user.id },
    }
    if (trial) {
      subscriptionData.trial_period_days = 7
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      success_url: 'https://varroamate.com/app/?checkout=success',
      cancel_url: 'https://varroamate.com/app/?checkout=cancelled',
      metadata: { supabase_user_id: user.id },
      subscription_data: subscriptionData,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    console.log('Session created:', session.id)

    await admin.from('checkouts').insert({
      stripe_id: session.id,
      user_id: user.id,
      price_id,
      status: 'pending',
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Error:', msg)
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }
})
