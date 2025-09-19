import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Google Ads Lead Forms Webhook Handler
 * Processes lead forms submitted through Google Ads campaigns
 * 
 * Documentation: https://developers.google.com/google-ads/api/docs/lead-form-extensions
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.google;
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
        platform: 'google'
      });

      if (!validation.isValid) {
        console.error('Google Ads webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Google Ads webhook received:', JSON.stringify(data, null, 2));

    // Process Google Ads lead data
    const results = [];
    
    // Handle different Google Ads webhook formats
    if (data.lead_form_data) {
      // Single lead format
      const result = await processGoogleLead(data, request);
      results.push(result);
    } else if (data.leads) {
      // Batch leads format
      for (const leadData of data.leads) {
        const result = await processGoogleLead(leadData, request);
        results.push(result);
      }
    } else if (data.user_column_data) {
      // Direct lead data format
      const result = await processGoogleLead(data, request);
      results.push(result);
    } else {
      console.warn('Unrecognized Google Ads webhook format:', data);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} lead(s)`,
      results,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Google Ads webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('google_ads', error, request);
    
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
 * Process a single Google Ads lead
 */
async function processGoogleLead(leadData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Map Google Ads lead data to universal format
    const universalData = PLATFORM_MAPPERS.google(leadData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'google',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate Google Ads lead detected: ${processedLead.email}`);
      
      // Update existing lead with new campaign data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        googleCampaigns: [
          ...(existingMetadata.googleCampaigns || []),
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
        console.error('Error updating duplicate Google lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        message: 'Lead already exists, campaign data added'
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
        type: 'google_ads_lead',
        payload: leadData,
        status: 'SUCCESS',
        attempts: 1,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

    console.log(`Google Ads lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      campaign: processedLead.utmCampaign,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing Google Ads lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'google_ads_lead',
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