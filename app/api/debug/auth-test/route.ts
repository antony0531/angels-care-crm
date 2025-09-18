import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Create Supabase client with service role key for testing
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test direct auth call
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return NextResponse.json({
      success: !error,
      error: error?.message,
      user_id: data?.user?.id,
      session_exists: !!data?.session,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}