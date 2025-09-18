import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Public signup is disabled for business CRM
  return NextResponse.json(
    { error: 'Public account registration is disabled. Contact your administrator for access.' },
    { status: 403 }
  );
}