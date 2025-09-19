import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Generic Webhook Handler
 * Processes lead data from various platforms and custom integrations
 * Provides flexibility for any external system to submit leads
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.generic;
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
        platform: 'generic'
      });

      if (!validation.isValid) {
        console.error('Generic webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Generic webhook received:', JSON.stringify(data, null, 2));

    // Determine the source platform from the data or headers
    const platformHint = data.platform || data.source_platform || request.headers.get('x-platform');
    
    // Process the lead data
    const result = await processGenericLead(data, request, platformHint);

    return NextResponse.json({
      success: true,
      message: 'Lead processed successfully',
      result,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Generic webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('generic', error, request);
    
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
 * Process a generic lead submission
 */
async function processGenericLead(leadData: any, request: NextRequest, platformHint?: string) {
  try {
    const supabase = await createClient();

    // Enhance lead data with request context
    const enhancedData = {
      ...leadData,
      // Extract additional context from request
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
      submitted_at: new Date().toISOString(),
      platform_hint: platformHint,
      // Ensure source is set
      source: leadData.source || platformHint || 'UNKNOWN',
    };

    // Map generic data to universal format
    const universalData = PLATFORM_MAPPERS.generic(enhancedData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'generic',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate generic lead detected: ${processedLead.email}`);
      
      // Update existing lead with new submission data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        genericSubmissions: [
          ...(existingMetadata.genericSubmissions || []),
          {
            platform: platformHint || 'unknown',
            submittedAt: new Date().toISOString(),
            rawData: enhancedData
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
        console.error('Error updating duplicate generic lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        platform: platformHint || 'unknown',
        message: 'Lead already exists, submission data added'
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
        type: 'generic_lead',
        payload: enhancedData,
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
        description: `Lead submitted via ${platformHint || 'generic webhook'}`,
        metadata: {
          platform: platformHint || 'unknown',
          rawData: enhancedData,
          source: universalData.source
        },
        createdAt: new Date().toISOString()
      });

    console.log(`Generic lead created: ${lead.firstName} ${lead.lastName} (${lead.email}) from ${platformHint || 'unknown'}`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      source: universalData.source,
      platform: platformHint || 'unknown',
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing generic lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'generic_lead',
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
 * Extract client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  return request.ip || 'unknown';
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