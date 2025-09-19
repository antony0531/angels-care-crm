import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { validateWebhookRequest, WEBHOOK_CONFIGS } from '@/lib/webhook-security';
import { processLeadData, validateLeadData, PLATFORM_MAPPERS } from '@/lib/lead-mapping';

export const dynamic = 'force-dynamic';

/**
 * Facebook Lead Ads Webhook Handler
 * Processes lead forms submitted through Facebook advertising campaigns
 * 
 * Documentation: https://developers.facebook.com/docs/marketing-api/guides/lead-ads/
 */

// GET method for Facebook webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Facebook webhook verification
  if (mode === 'subscribe' && token === process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN) {
    console.log('Facebook webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// POST method for receiving Facebook lead data
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get webhook configuration
    const config = WEBHOOK_CONFIGS.facebook;
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
        platform: 'facebook'
      });

      if (!validation.isValid) {
        console.error('Facebook webhook validation failed:', validation.error);
        return NextResponse.json(
          { error: validation.error },
          { status: validation.rateLimited ? 429 : 401 }
        );
      }
    }

    // Parse request body
    const requestText = await request.text();
    const data = JSON.parse(requestText);

    console.log('Facebook webhook received:', JSON.stringify(data, null, 2));

    // Handle Facebook webhook structure
    if (data.object === 'page') {
      const results = [];
      
      for (const entry of data.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const leadData = change.value;
            const result = await processFacebookLead(leadData, request);
            results.push(result);
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${results.length} lead(s)`,
        results,
        processingTime: Date.now() - startTime
      });
    }

    // If not a recognized Facebook webhook format, log and return success
    console.warn('Unrecognized Facebook webhook format:', data);
    return NextResponse.json({
      success: true,
      message: 'Webhook received but no leads processed'
    });

  } catch (error) {
    console.error('Facebook webhook error:', error);
    
    // Log the error for monitoring
    await logWebhookError('facebook', error, request);
    
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
 * Process a single Facebook lead
 */
async function processFacebookLead(leadData: any, request: NextRequest) {
  try {
    const supabase = await createClient();

    // Map Facebook lead data to universal format
    const universalData = PLATFORM_MAPPERS.facebook(leadData);
    
    // Validate lead data
    const validation = validateLeadData(universalData);
    if (!validation.isValid) {
      throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
    }

    // Process into database format
    const processedLead = processLeadData(universalData, {
      platform: 'facebook',
      defaultStatus: 'NEW'
    });

    // Check for duplicate leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, email')
      .eq('email', processedLead.email)
      .single();

    if (existingLead) {
      console.log(`Duplicate Facebook lead detected: ${processedLead.email}`);
      
      // Update existing lead with new data
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          metadata: {
            ...processedLead.metadata,
            duplicateSubmissions: (existingLead as any).metadata?.duplicateSubmissions || 0 + 1,
            lastDuplicateAt: new Date().toISOString()
          },
          updatedAt: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Error updating duplicate lead:', updateError);
      }

      return {
        leadId: existingLead.id,
        email: processedLead.email,
        status: 'duplicate',
        message: 'Lead already exists, metadata updated'
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
        type: 'facebook_lead',
        payload: leadData,
        status: 'SUCCESS',
        attempts: 1,
        processedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

    console.log(`Facebook lead created: ${lead.firstName} ${lead.lastName} (${lead.email})`);

    return {
      leadId: lead.id,
      email: lead.email,
      status: 'created',
      score: lead.score,
      message: 'Lead created successfully'
    };

  } catch (error) {
    console.error('Error processing Facebook lead:', error);
    
    // Log failed webhook event
    const supabase = await createClient();
    await supabase
      .from('webhook_events')
      .insert({
        type: 'facebook_lead',
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