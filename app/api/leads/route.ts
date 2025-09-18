import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Temporarily disabled while fixing Prisma serverless issues
export async function GET(request: Request) {
  return NextResponse.json({ error: 'Leads API temporarily disabled' }, { status: 503 });
}

export async function POST(request: Request) {
  return NextResponse.json({ error: 'Leads API temporarily disabled' }, { status: 503 });
}