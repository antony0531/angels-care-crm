import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Instagram Lead Ads Webhook Handler
 * Processes lead forms submitted through Instagram advertising campaigns
 * Uses Meta's webhook infrastructure (same as Facebook)
 * 
 * Documentation: https://developers.facebook.com/docs/marketing-api/guides/lead-ads/
 */

// GET method for Instagram webhook verification (same as Facebook)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Instagram webhook verification (uses same token as Facebook)
  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log('Instagram webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// POST method for receiving Instagram lead data
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.instagram;
    const secret = process.env[config.secretEnvVar];
    
    if (!secret) {
      console.error(`Missing environment variable: ${config.secretEnvVar}`);
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Validate webhook security if enabled
    const enableValidation = process.env.WEBHOOK_ENABLE_SIGNATURE_VALIDATION === 'true';
    if (enableValidation) {
      const validation = await validateWebhookRequest(request, secret, {
        signatureHeader: config.signatureHeader,
        timestampHeader: config.timestampHeader,
        checkSignature: true,
        checkTimestamp: true,
        checkRateLimit: process.env.WEBHOOK_ENABLE_RATE_LIMITING === 'true',
        platform: 'instagram'
      });

      if (!validation.isValid) {
        console.error('Instagram webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Instagram webhook received:', JSON.stringify(data, null, 2));

    // Handle Instagram webhook structure (same as Facebook)
    if (data.object === 'page') {
      const results = [];
      
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const leadData = change.value;
            const result = await processInstagramLead(leadData, request);
            results.push(result);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${results.length} Instagram lead(s)`,
        results,
        processingTime: Date.now() - startTime
      });
    }

    // If not a recognized Instagram webhook format, log and return success
    console.warn('Unrecognized Instagram webhook format:', data);
    return NextResponse.json({
      success: true,
      message: 'Webhook received but no leads processed'
    });

  } catch (error) {
    console.error('Instagram webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('instagram', error, request);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        processingTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

/**
 * Process a single Instagram lead
 */
async function processInstagramLead(leadData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Map Instagram lead data to universal format
    const universalData = PLATFORM_MAPPERS.instagram(leadData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'instagram',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate Instagram lead detected: ${processedLead.email}`);
      
      // Update existing lead with new Instagram campaign data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        instagramCampaigns: [
          ...(existingMetadata.instagramCampaigns || []),
          {
            campaignId: processedLead.utmCampaign,
            submittedAt: new Date().toISOString(),
            leadData: processedLead.metadata?.rawPayload
          }
        ],
        duplicateSubmissions: (existingMetadata.duplicateSubmissions || 0) + 1,
        lastDuplicateAt: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('leads')
        .update({
          metadata: updatedMetadata,
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Error updating duplicate Instagram lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        message: 'Lead already exists, Instagram campaign data added'
      };
    }

    // Insert new lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert(processedLead)
      .select()
      .single();

    if (leadError) {
      throw leadError;
    }

    // Log the webhook event
    await supabase
      .from('webhook_events')
      .insert({
        type: 'instagram_lead',
        payload: leadData,
        status: 'SUCCESS',
        attempts: 1,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

    // Create lead activity record
    await supabase
      .from('lead_activities')
      .insert({
        leadId: lead.id,
        type: 'FORM_SUBMISSION',
        description: `Lead submitted via Instagram Ad campaign`,
        metadata: {
          platform: 'instagram',
          rawData: leadData,
          source: universalData.source
        },
        createdAt: new Date().toISOString()
      });

    console.log(`Instagram lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      campaign: processedLead.utmCampaign,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing Instagram lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'instagram_lead',
        payload: leadData,
        status: 'FAILED',
        attempts: 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString()
      });

    throw error;
  }
}

/**
 * Log webhook errors for monitoring
 */
async function logWebhookError(platform: string, error: any, request: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: `${platform}_error`,
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url: request.url,
          headers: Object.fromEntries(request.headers.entries()),
          timestamp: new Date().toISOString()
        },
        status: 'FAILED',
        attempts: 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        createdAt: new Date().toISOString()
      });
  } catch (logError) {
    console.error('Failed to log webhook error:', logError);
  }
}