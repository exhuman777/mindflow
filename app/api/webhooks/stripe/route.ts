import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = supabaseAdmin
  if (!supabase) {
    console.error('Supabase admin client not configured')
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription') {
          const customerId = session.customer as string
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.userId

          if (!userId) {
            console.error('No userId in session metadata')
            break
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)

          // Create/update subscription in database
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plan: subscription.items.data[0].price.lookup_key || 'monthly',
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          }, {
            onConflict: 'user_id'
          })

          // Update user profile to premium
          await supabase
            .from('profiles')
            .update({ tier: 'premium' })
            .eq('id', userId)

          console.log(`User ${userId} upgraded to premium`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user by stripe customer ID
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' :
                      subscription.status === 'past_due' ? 'past_due' : 'canceled',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('user_id', existingSub.user_id)

          // Update profile tier based on status
          await supabase
            .from('profiles')
            .update({
              tier: subscription.status === 'active' ? 'premium' : 'free'
            })
            .eq('id', existingSub.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Find user and downgrade
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('user_id', existingSub.user_id)

          await supabase
            .from('profiles')
            .update({ tier: 'free' })
            .eq('id', existingSub.user_id)

          console.log(`User ${existingSub.user_id} downgraded to free`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Mark subscription as past_due
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (existingSub) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('user_id', existingSub.user_id)

          // TODO: Send email notification about payment failure
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}
