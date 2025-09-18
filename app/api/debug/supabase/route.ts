import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    database_url_exists: !!process.env.DATABASE_URL,
    anon_key_preview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  });
}