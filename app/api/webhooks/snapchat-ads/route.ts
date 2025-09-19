import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Snapchat Lead Ads Webhook Handler
 * Processes lead forms submitted through Snapchat advertising campaigns
 * 
 * Documentation: https://developers.snapchat.com/api/docs/
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.snapchat;
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
        platform: 'snapchat'
      });

      if (!validation.isValid) {
        console.error('Snapchat webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Snapchat webhook received:', JSON.stringify(data, null, 2));

    // Process Snapchat lead data
    const results = [];
    
    // Handle different Snapchat webhook formats
    if (data.event_type === 'LEAD') {
      // Single lead format
      const result = await processSnapchatLead(data, request);
      results.push(result);
    } else if (data.leads) {
      // Batch leads format
      for (const leadData of data.leads) {
        const result = await processSnapchatLead(leadData, request);
        results.push(result);
      }
    } else if (data.conversions) {
      // Conversion events format
      for (const conversion of data.conversions) {
        if (conversion.event_type === 'LEAD') {
          const result = await processSnapchatLead(conversion, request);
          results.push(result);
        }
      }
    } else {
      console.warn('Unrecognized Snapchat webhook format:', data);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} Snapchat lead(s)`,
      results,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Snapchat webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('snapchat', error, request);
    
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
 * Process a single Snapchat lead
 */
async function processSnapchatLead(leadData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Map Snapchat lead data to universal format
    const universalData = PLATFORM_MAPPERS.snapchat(leadData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'snapchat',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate Snapchat lead detected: ${processedLead.email}`);
      
      // Update existing lead with new Snapchat campaign data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        snapchatCampaigns: [
          ...(existingMetadata.snapchatCampaigns || []),
          {
            campaignId: processedLead.utmCampaign,
            adSquadId: leadData.ad_squad_id,
            adId: leadData.ad_id,
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
        console.error('Error updating duplicate Snapchat lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        message: 'Lead already exists, Snapchat campaign data added'
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
        type: 'snapchat_lead',
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
        description: `Lead submitted via Snapchat Ad campaign`,
        metadata: {
          platform: 'snapchat',
          rawData: leadData,
          source: universalData.source,
          campaignId: leadData.campaign_id,
          adSquadId: leadData.ad_squad_id,
          adId: leadData.ad_id
        },
        createdAt: new Date().toISOString()
      });

    console.log(`Snapchat lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      campaign: processedLead.utmCampaign,
      adSquad: leadData.ad_squad_id,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing Snapchat lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'snapchat_lead',
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