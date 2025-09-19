import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Pinterest Lead Ads Webhook Handler
 * Processes lead forms submitted through Pinterest advertising campaigns
 * 
 * Documentation: https://developers.pinterest.com/docs/conversions/conversion-management/
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.pinterest;
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
        platform: 'pinterest'
      });

      if (!validation.isValid) {
        console.error('Pinterest webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Pinterest webhook received:', JSON.stringify(data, null, 2));

    // Process Pinterest lead data
    const results = [];
    
    // Handle different Pinterest webhook formats
    if (data.event_type === 'lead') {
      // Single lead format
      const result = await processPinterestLead(data, request);
      results.push(result);
    } else if (data.events) {
      // Batch events format
      for (const event of data.events) {
        if (event.event_type === 'lead') {
          const result = await processPinterestLead(event, request);
          results.push(result);
        }
      }
    } else if (data.lead_data) {
      // Direct lead data format
      const result = await processPinterestLead(data, request);
      results.push(result);
    } else {
      console.warn('Unrecognized Pinterest webhook format:', data);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} Pinterest lead(s)`,
      results,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Pinterest webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('pinterest', error, request);
    
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
 * Process a single Pinterest lead
 */
async function processPinterestLead(leadData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Map Pinterest lead data to universal format
    const universalData = PLATFORM_MAPPERS.pinterest(leadData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'pinterest',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate Pinterest lead detected: ${processedLead.email}`);
      
      // Update existing lead with new Pinterest campaign data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        pinterestCampaigns: [
          ...(existingMetadata.pinterestCampaigns || []),
          {
            campaignId: processedLead.utmCampaign,
            adGroupId: leadData.ad_group_id,
            pinId: leadData.pin_id,
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
        console.error('Error updating duplicate Pinterest lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        message: 'Lead already exists, Pinterest campaign data added'
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
        type: 'pinterest_lead',
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
        description: `Lead submitted via Pinterest Ad campaign`,
        metadata: {
          platform: 'pinterest',
          rawData: leadData,
          source: universalData.source,
          campaignId: leadData.campaign_id,
          adGroupId: leadData.ad_group_id,
          pinId: leadData.pin_id
        },
        createdAt: new Date().toISOString()
      });

    console.log(`Pinterest lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      campaign: processedLead.utmCampaign,
      pin: leadData.pin_id,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing Pinterest lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'pinterest_lead',
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