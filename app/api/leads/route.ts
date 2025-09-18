import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/leads - Fetch leads with filtering and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (search) {
      query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Order by createdAt desc
    query = query.order('createdAt', { ascending: false });

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('Leads fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      page,
      limit,
    });

  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      zipCode,
      planType = 'Medicare',
      source = 'Manual Entry',
      notes,
      status = 'NEW',
      priority = 'MEDIUM',
    } = data;

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and firstName are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', email)
      .single();

    if (existingLead) {
      return NextResponse.json(
        { error: 'Lead with this email already exists' },
        { status: 409 }
      );
    }

    // Create new lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        email,
        firstName,
        lastName,
        phone,
        insuranceType: planType,
        source,
        status,
        metadata: { notes },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (leadError) {
      console.error('Lead creation error:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Lead created successfully', 
        lead 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}