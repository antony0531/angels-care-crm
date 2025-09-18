import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Temporarily disabled while fixing Prisma serverless issues  
export async function GET() {
  return NextResponse.json({ error: 'Leads API temporarily disabled' }, { status: 503 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Leads API temporarily disabled' }, { status: 503 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Leads API temporarily disabled' }, { status: 503 });
}