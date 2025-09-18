import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { assignLead } from '@/lib/services/lead-assignment';
import { calculateLeadScore } from '@/lib/services/lead-scoring';
import { notifyLeadEvent } from '@/lib/services/notification-service';
import { prisma } from '@/lib/prisma';

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

    // Prepare lead data
    const leadData = {
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
    };

    // Create new lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (leadError) {
      console.error('Lead creation error:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Get assignment and scoring rules from database
    const assignmentRules = await prisma.assignmentRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' }
    });

    const scoringRules = await prisma.leadScoringRule.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    // Convert lead to FrontendLead format for processing
    const frontendLead = {
      id: lead.id,
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone || '',
      insuranceType: lead.insuranceType,
      status: lead.status,
      source: lead.source,
      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,
      landingPage: lead.landingPage || '/',
      sessionDuration: lead.sessionDuration || 0,
      pagesViewed: lead.pagesViewed || 1,
      formCompletionTime: lead.formCompletionTime || 0,
      createdAt: lead.createdAt,
      contactedAt: lead.contactedAt,
      convertedAt: lead.convertedAt,
      assignedAgent: null,
      estimatedValue: lead.estimatedValue || 0,
    };

    let assignmentResult;

    // Try to auto-assign the lead using assignment rules
    try {

      if (assignmentRules.length > 0) {

        // Calculate lead score if scoring rules exist
        let leadScore;
        if (scoringRules.length > 0) {
          leadScore = calculateLeadScore(frontendLead, scoringRules);
        }

        // Mock agent availability (in production, this would come from a real agent system)
        const mockAgents = [
          {
            agentId: 'agent-1',
            agentName: 'Senior Agent',
            currentLeadCount: 5,
            maxLeadCapacity: 20,
            specializations: ['MEDICARE_ADVANTAGE', 'LIFE_INSURANCE'],
            isOnline: true,
            isActive: true
          },
          {
            agentId: 'agent-2', 
            agentName: 'Junior Agent',
            currentLeadCount: 3,
            maxLeadCapacity: 15,
            specializations: ['ACA_PLANS', 'SUPPLEMENT'],
            isOnline: true,
            isActive: true
          }
        ];

        // Attempt assignment
        const assignmentResult = await assignLead(frontendLead, assignmentRules, mockAgents, leadScore);
        
        if (assignmentResult.success && assignmentResult.assignedTo) {
          // Update lead with assignment
          const { error: updateError } = await supabase
            .from('leads')
            .update({ 
              assignedToId: assignmentResult.assignedTo,
              updatedAt: new Date().toISOString()
            })
            .eq('id', lead.id);

          if (updateError) {
            console.error('Lead assignment update error:', updateError);
          } else {
            console.log(`Lead ${lead.id} auto-assigned: ${assignmentResult.reason}`);
          }
        } else {
          console.log(`Lead ${lead.id} not assigned: ${assignmentResult.reason}`);
        }
      }
    } catch (assignmentError) {
      console.error('Auto-assignment error:', assignmentError);
      // Don't fail the request if assignment fails, just log the error
    }

    // Send notifications based on CRM settings
    try {
      // Get CRM settings for notifications
      const crmSettings = await prisma.crmSettings.findUnique({
        where: { id: 'default' }
      });

      if (crmSettings) {
        // Calculate lead score for notifications if rules exist
        let leadScore;
        if (scoringRules && scoringRules.length > 0) {
          leadScore = calculateLeadScore(frontendLead, scoringRules);
        }

        // Send lead created notification
        await notifyLeadEvent('lead_created', frontendLead, crmSettings, {
          leadScore,
          metadata: { source: 'api_creation' }
        });

        // Send high score alert if applicable
        if (leadScore && leadScore.percentage >= 70) {
          await notifyLeadEvent('high_score_lead', frontendLead, crmSettings, {
            leadScore,
            metadata: { threshold: 70 }
          });
        }

        // Send assignment notification if lead was assigned
        if (assignmentResult && assignmentResult.success) {
          await notifyLeadEvent('lead_assigned', frontendLead, crmSettings, {
            assignmentResult,
            leadScore,
            metadata: { auto_assigned: true }
          });
        }
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the request if notifications fail, just log the error
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