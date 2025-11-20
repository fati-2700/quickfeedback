import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple Supabase client for reading (no auth needed)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error fetching feedback: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Error fetching feedback' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, siteUrl } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Insert feedback into Supabase
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          name,
          email,
          message,
          site_url: siteUrl || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Error saving feedback: ' + error.message },
        {
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // Send email notifications
    try {
      await resend.emails.send({
        from: 'QuickFeedback <onboarding@resend.dev>',
        to: email,
        subject: 'Thanks for your feedback!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Thank you for your feedback, ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              We've received your message and appreciate you taking the time to share your thoughts with us.
            </p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1f2937; margin: 0;"><strong>Your message:</strong></p>
              <p style="color: #4b5563; margin: 8px 0 0 0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Best regards,<br>
              The QuickFeedback Team
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    try {
      await resend.emails.send({
        from: 'QuickFeedback <onboarding@resend.dev>',
        to: 'fatitalo84@gmail.com',
        subject: 'New Feedback Received!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">New Feedback Received</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #1f2937; margin: 8px 0;"><strong>Name:</strong> ${name}</p>
              <p style="color: #1f2937; margin: 8px 0;"><strong>Email:</strong> ${email}</p>
              <p style="color: #1f2937; margin: 8px 0;"><strong>Site URL:</strong> ${siteUrl || 'Not provided'}</p>
              <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #d1d5db;">
                <p style="color: #1f2937; margin: 0 0 8px 0;"><strong>Message:</strong></p>
                <p style="color: #4b5563; margin: 0; white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
    }

    return NextResponse.json(
      { success: true, message: 'Feedback submitted successfully', data },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing feedback' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
