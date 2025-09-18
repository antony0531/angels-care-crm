import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Map common plan types to enum values
function mapInsuranceType(planType: string): string {
  const normalizedType = planType?.toUpperCase().replace(/[^A-Z]/g, '_');
  
  const typeMap: { [key: string]: string } = {
    'MEDICARE': 'MEDICARE_ADVANTAGE',
    'MEDICARE_ADVANTAGE': 'MEDICARE_ADVANTAGE',
    'ACA': 'ACA_PLANS',
    'ACA_PLANS': 'ACA_PLANS',
    'SUPPLEMENT': 'SUPPLEMENT',
    'PART_D': 'PART_D',
    'LIFE': 'LIFE_INSURANCE',
    'LIFE_INSURANCE': 'LIFE_INSURANCE',
    'AUTO': 'AUTO_INSURANCE',
    'AUTO_INSURANCE': 'AUTO_INSURANCE',
    'HOME': 'HOME_INSURANCE',
    'HOME_INSURANCE': 'HOME_INSURANCE',
  };
  
  return typeMap[normalizedType] || 'OTHER';
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Extract form data
    const {
      email,
      firstName,
      lastName,
      phone,
      dateOfBirth,
      zipCode,
      planType = 'MEDICARE_ADVANTAGE',
      source = 'WEBSITE',
      notes,
    } = data;

    // Validate required fields
    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'Email and firstName are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert lead directly into Supabase (bypassing Prisma)
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        email,
        firstName,
        lastName,
        phone,
        insuranceType: mapInsuranceType(planType),
        source: source,
        status: 'NEW',
        metadata: { notes },
        // Let Supabase auto-generate id, createdAt, updatedAt
      })
      .select()
      .single();

    if (leadError) {
      console.error('Lead creation error:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead', details: leadError.message },
        { status: 500 }
      );
    }

    // Log the webhook event
    const { error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        eventType: 'form_submission',
        payload: data,
        source: source,
        processed: true,
        createdAt: new Date().toISOString(),
      });

    if (eventError) {
      console.error('Event logging error:', eventError);
      // Don't fail the request if event logging fails
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Lead created successfully',
        leadId: lead.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}