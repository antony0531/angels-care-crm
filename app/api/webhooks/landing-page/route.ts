import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Landing Page Form Webhook Handler
 * Processes form submissions from various landing pages
 * Supports multiple form builders and custom implementations
 */

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.landing_page;
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
        platform: 'landing_page'
      });

      if (!validation.isValid) {
        console.error('Landing page webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Landing page webhook received:', JSON.stringify(data, null, 2));

    // Process landing page lead data
    const result = await processLandingPageLead(data, request);

    return NextResponse.json({
      success: true,
      message: 'Lead processed successfully',
      result,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Landing page webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('landing_page', error, request);
    
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
 * Process a landing page lead submission
 */
async function processLandingPageLead(formData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Enhance form data with request context
    const enhancedData = {
      ...formData,
      // Extract additional context from request
      ip_address: getClientIP(request),
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
      submitted_at: new Date().toISOString(),
      // Extract UTM parameters if not already present
      utm_source: formData.utm_source || extractUtmFromReferrer(request.headers.get('referer'), 'utm_source'),
      utm_medium: formData.utm_medium || extractUtmFromReferrer(request.headers.get('referer'), 'utm_medium'),
      utm_campaign: formData.utm_campaign || extractUtmFromReferrer(request.headers.get('referer'), 'utm_campaign'),
      utm_content: formData.utm_content || extractUtmFromReferrer(request.headers.get('referer'), 'utm_content'),
      utm_term: formData.utm_term || extractUtmFromReferrer(request.headers.get('referer'), 'utm_term'),
    };

    // Map landing page data to universal format
    const universalData = PLATFORM_MAPPERS.landing_page(enhancedData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'landing_page',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email, metadata')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate landing page lead detected: ${processedLead.email}`);
      
      // Update existing lead with new submission data
      const existingMetadata = (existingLead as any).metadata || {};
      const updatedMetadata = {
        ...existingMetadata,
        landingPageSubmissions: [
          ...(existingMetadata.landingPageSubmissions || []),
          {
            page: universalData.landingPage,
            submittedAt: new Date().toISOString(),
            formData: enhancedData,
            utmData: {
              source: universalData.utmSource,
              medium: universalData.utmMedium,
              campaign: universalData.utmCampaign,
              content: universalData.utmContent,
              term: universalData.utmTerm
            }
          }
        ],
        duplicateSubmissions: (existingMetadata.duplicateSubmissions || 0) + 1,
        lastDuplicateAt: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('leads')
        .update({
          metadata: updatedMetadata,
          // Update score if this submission indicates higher engagement
          score: Math.max((existingLead as any).score || 0, processedLead.score),
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Error updating duplicate landing page lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        score: Math.max((existingLead as any).score || 0, processedLead.score),
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
        type: 'landing_page_submission',
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
        description: `Form submitted from ${universalData.landingPage || 'landing page'}`,
        metadata: {
          formData: enhancedData,
          source: universalData.source,
          utmData: {
            source: universalData.utmSource,
            medium: universalData.utmMedium,
            campaign: universalData.utmCampaign
          }
        },
        createdAt: new Date().toISOString()
      });

    console.log(`Landing page lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      source: universalData.source,
      landingPage: universalData.landingPage,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing landing page lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'landing_page_submission',
        payload: formData,
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
 * Extract UTM parameters from referrer URL
 */
function extractUtmFromReferrer(referrer: string | null, param: string): string | undefined {
  if (!referrer) return undefined;
  
  try {
    const url = new URL(referrer);
    return url.searchParams.get(param) || undefined;
  } catch {
    return undefined;
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