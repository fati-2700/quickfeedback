import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-11-17.clover',
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get userId from metadata (preferred) or fallback to email
      const userId = session.metadata?.userId;
      const customerEmail = session.customer_email || session.customer_details?.email;

      if (!userId && !customerEmail) {
        console.error('No userId or email found in checkout session');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Determine target plan
      const planFromMetadata = session.metadata?.planType;
      let nextPlan: 'pro' | 'lifetime' = 'pro';
      if (planFromMetadata === 'lifetime') {
        nextPlan = 'lifetime';
      } else if (planFromMetadata === 'pro') {
        nextPlan = 'pro';
      } else if (session.mode === 'payment') {
        // Payment-mode sessions correspond to the lifetime deal
        nextPlan = 'lifetime';
      }

      // Update user status in users table
      const supabase = createServerClient();
      let updateError;

      if (userId) {
        // Use userId if available (more reliable)
        const { error } = await supabase
          .from('users')
          .update({ plan: nextPlan })
          .eq('id', userId);
        updateError = error;
        
        if (updateError) {
          console.error('Error updating user plan by userId:', updateError);
        } else {
          console.log(`User ${userId} upgraded to ${nextPlan}`);
        }
      } else if (customerEmail) {
        // Fallback to email if userId not available
        const { error } = await supabase
          .from('users')
          .update({ plan: nextPlan })
          .eq('email', customerEmail);
        updateError = error;
        
        if (updateError) {
          console.error('Error updating user plan by email:', updateError);
        } else {
          console.log(`User ${customerEmail} upgraded to ${nextPlan}`);
        }
      }

      // Still return 200 to acknowledge receipt even if update fails
      // (Stripe will retry if we return an error)
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Handle subscription updates (in case of cancellations, etc.)
    if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === 'string' 
        ? subscription.customer 
        : subscription.customer?.id;

      if (!customerId) {
        console.error('No customer ID found in subscription');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      try {
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = typeof customer === 'object' && !customer.deleted 
          ? customer.email 
          : null;

        if (customerEmail) {
          const supabase = createServerClient();
          // If subscription is cancelled or past_due, downgrade to free
          const shouldDowngrade = subscription.status === 'canceled' || 
                                  subscription.status === 'unpaid' ||
                                  subscription.status === 'past_due';
          
          if (shouldDowngrade) {
            const { error } = await supabase
              .from('users')
              .update({ plan: 'free' })
              .eq('email', customerEmail);
            
            if (error) {
              console.error('Error downgrading user plan:', error);
            } else {
              console.log(`User ${customerEmail} downgraded to free`);
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving customer from Stripe:', error);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

