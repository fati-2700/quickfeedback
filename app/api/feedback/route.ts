import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Force dynamic route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase client for reading feedback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

const readKey = serviceRoleKey || anonKey;
const supabaseRead = supabaseUrl && readKey
  ? createClient(supabaseUrl, readKey)
  : null;

const supabaseWrite = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CORS headers helper
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function GET(request: NextRequest) {
  try {
    if (!supabaseRead) {
      console.error('Supabase client not initialized. Check SUPABASE_SERVICE_ROLE_KEY env var.');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Get userId from query params (for filtering by user)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabaseRead.from('feedback').select('*');
    
    // Filter by user_id if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Error fetching feedback: ' + error.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    return NextResponse.json(data || [], { headers: corsHeaders() });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Error fetching feedback: ' + errorMessage },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, siteUrl, projectId } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Validate projectId
    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Missing project ID' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get user email from Supabase to send notification
    let userEmail = 'fatitalo84@gmail.com'; // fallback
    if (supabaseRead) {
      const { data: userData } = await supabaseRead
        .from('users')
        .select('email')
        .eq('id', projectId)
        .single();
      
      if (userData?.email) {
        userEmail = userData.email;
      }
    }

    // Insert feedback into Supabase with user_id
    const { data, error } = await supabaseWrite
      .from('feedback')
      .insert([
        {
          name,
          email,
          message,
          site_url: siteUrl || null,
          user_id: projectId, // Save the project owner's ID
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Error saving feedback: ' + error.message },
        { status: 500, headers: corsHeaders() }
      );
    }

    // Send confirmation email to feedback submitter
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

    // Send notification email to project owner
    try {
      await resend.emails.send({
        from: 'QuickFeedback <onboarding@resend.dev>',
        to: userEmail,
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
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { success: false, message: 'Error processing feedback' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}