import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
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

      // Get customer email
      const customerEmail = session.customer_email || session.customer_details?.email;

      if (!customerEmail) {
        console.error('No email found in checkout session');
        return NextResponse.json({ received: true }, { status: 200 });
      }

      // Update user status to 'pro' in users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ plan: 'pro' })
        .eq('email', customerEmail);

      if (updateError) {
        console.error('Error updating user plan:', updateError);
        // Still return 200 to acknowledge receipt
        return NextResponse.json({ received: true }, { status: 200 });
      }

      console.log(`User ${customerEmail} upgraded to pro`);
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

