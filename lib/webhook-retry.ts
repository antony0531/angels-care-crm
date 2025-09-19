import { createClient } from '@/lib/supabase/server';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs?: number;
}

export interface WebhookRetryRecord {
  id: string;
  type: string;
  payload: any;
  url?: string;
  attempts: number;
  maxAttempts: number;
  nextRetry: Date;
  lastError?: string;
  status: 'PENDING' | 'RETRYING' | 'FAILED' | 'SUCCESS' | 'DEAD_LETTER';
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 300000, // 5 minutes
  backoffMultiplier: 2,
  jitterMs: 1000, // ±1 second
};

/**
 * Calculate next retry delay using exponential backoff with jitter
 */
export function calculateRetryDelay(
  attempt: number,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): number {
  const exponentialDelay = Math.min(
    config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelayMs
  );

  // Add jitter to prevent thundering herd
  const jitter = config.jitterMs 
    ? (Math.random() - 0.5) * 2 * config.jitterMs 
    : 0;

  return Math.max(0, exponentialDelay + jitter);
}

/**
 * Schedule a webhook for retry processing
 */
export async function scheduleWebhookRetry(
  type: string,
  payload: any,
  error: Error,
  url?: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<string> {
  const supabase = await createClient();
  
  const nextRetryDelay = calculateRetryDelay(1, config);
  const nextRetry = new Date(Date.now() + nextRetryDelay);

  const { data, error: insertError } = await supabase
    .from('webhook_retries')
    .insert({
      type,
      payload,
      url,
      attempts: 0,
      maxAttempts: config.maxAttempts,
      nextRetry: nextRetry.toISOString(),
      lastError: error.message,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('Failed to schedule webhook retry:', insertError);
    throw new Error('Failed to schedule webhook retry');
  }

  console.log(`Webhook retry scheduled: ${type} (ID: ${data.id}, Next attempt: ${nextRetry.toISOString()})`);
  return data.id;
}

/**
 * Process pending webhook retries
 */
export async function processWebhookRetries(): Promise<void> {
  const supabase = await createClient();
  
  // Get pending retries that are ready to be processed
  const { data: retries, error } = await supabase
    .from('webhook_retries')
    .select('*')
    .in('status', ['PENDING', 'RETRYING'])
    .lte('nextRetry', new Date().toISOString())
    .order('nextRetry', { ascending: true })
    .limit(10); // Process up to 10 at a time

  if (error) {
    console.error('Failed to fetch webhook retries:', error);
    return;
  }

  if (!retries || retries.length === 0) {
    return;
  }

  console.log(`Processing ${retries.length} webhook retries`);

  for (const retry of retries) {
    await processIndividualRetry(retry);
  }
}

/**
 * Process an individual webhook retry
 */
async function processIndividualRetry(retry: any): Promise<void> {
  const supabase = await createClient();
  
  try {
    // Mark as retrying
    await supabase
      .from('webhook_retries')
      .update({
        status: 'RETRYING',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', retry.id);

    console.log(`Processing webhook retry: ${retry.type} (Attempt ${retry.attempts + 1}/${retry.maxAttempts})`);

    // Attempt to reprocess the webhook
    const success = await reprocessWebhook(retry);

    if (success) {
      // Mark as successful
      await supabase
        .from('webhook_retries')
        .update({
          status: 'SUCCESS',
          updatedAt: new Date().toISOString(),
        })
        .eq('id', retry.id);

      console.log(`Webhook retry successful: ${retry.type} (ID: ${retry.id})`);
    } else {
      // Handle failure
      await handleRetryFailure(retry);
    }

  } catch (error) {
    console.error(`Error processing webhook retry ${retry.id}:`, error);
    
    await supabase
      .from('webhook_retries')
      .update({
        status: 'PENDING',
        lastError: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', retry.id);
  }
}

/**
 * Handle retry failure - either schedule next retry or move to dead letter queue
 */
async function handleRetryFailure(retry: any): Promise<void> {
  const supabase = await createClient();
  const nextAttempt = retry.attempts + 1;

  if (nextAttempt >= retry.maxAttempts) {
    // Move to dead letter queue
    await moveToDeadLetterQueue(retry);
  } else {
    // Schedule next retry
    const nextRetryDelay = calculateRetryDelay(nextAttempt + 1);
    const nextRetry = new Date(Date.now() + nextRetryDelay);

    await supabase
      .from('webhook_retries')
      .update({
        attempts: nextAttempt,
        nextRetry: nextRetry.toISOString(),
        status: 'PENDING',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', retry.id);

    console.log(`Webhook retry rescheduled: ${retry.type} (Attempt ${nextAttempt}/${retry.maxAttempts}, Next: ${nextRetry.toISOString()})`);
  }
}

/**
 * Move failed webhook to dead letter queue
 */
async function moveToDeadLetterQueue(retry: any): Promise<void> {
  const supabase = await createClient();

  try {
    // Insert into dead letter queue
    const { error: dlqError } = await supabase
      .from('webhook_dead_letter_queue')
      .insert({
        originalId: retry.id,
        type: retry.type,
        payload: retry.payload,
        url: retry.url,
        totalAttempts: retry.attempts + 1,
        lastError: retry.lastError,
        firstFailedAt: retry.createdAt,
        movedToDlqAt: new Date().toISOString(),
        status: 'REQUIRES_MANUAL_REVIEW',
        metadata: {
          webhookRetryId: retry.id,
          maxAttemptsReached: true,
          finalAttemptTime: new Date().toISOString(),
        },
      });

    if (dlqError) {
      console.error('Failed to move webhook to dead letter queue:', dlqError);
      return;
    }

    // Update original retry record
    await supabase
      .from('webhook_retries')
      .update({
        status: 'DEAD_LETTER',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', retry.id);

    console.error(`Webhook moved to dead letter queue after ${retry.attempts + 1} attempts: ${retry.type} (ID: ${retry.id})`);

    // Log critical alert for monitoring
    await logCriticalWebhookFailure(retry);

  } catch (error) {
    console.error(`Failed to move webhook to dead letter queue: ${retry.id}`, error);
  }
}

/**
 * Reprocess a webhook based on its type
 */
async function reprocessWebhook(retry: any): Promise<boolean> {
  try {
    switch (retry.type) {
      case 'facebook_lead':
        return await reprocessFacebookLead(retry.payload);
      case 'google_ads_lead':
        return await reprocessGoogleLead(retry.payload);
      case 'landing_page_submission':
        return await reprocessLandingPageLead(retry.payload);
      case 'generic_lead':
        return await reprocessGenericLead(retry.payload);
      default:
        console.warn(`Unknown webhook type for retry: ${retry.type}`);
        return false;
    }
  } catch (error) {
    console.error(`Failed to reprocess webhook ${retry.type}:`, error);
    return false;
  }
}

/**
 * Reprocess Facebook lead webhook
 */
async function reprocessFacebookLead(payload: any): Promise<boolean> {
  // Import and use the Facebook lead processing logic
  // This would need to be extracted from the webhook handler
  const { processLeadData, validateLeadData, PLATFORM_MAPPERS } = await import('./lead-mapping');
  const supabase = await createClient();

  const universalData = PLATFORM_MAPPERS.facebook(payload);
  const validation = validateLeadData(universalData);
  
  if (!validation.isValid) {
    throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
  }

  const processedLead = processLeadData(universalData, {
    platform: 'facebook',
    defaultStatus: 'NEW'
  });

  const { error } = await supabase
    .from('leads')
    .insert(processedLead);

  return !error;
}

/**
 * Reprocess Google Ads lead webhook
 */
async function reprocessGoogleLead(payload: any): Promise<boolean> {
  const { processLeadData, validateLeadData, PLATFORM_MAPPERS } = await import('./lead-mapping');
  const supabase = await createClient();

  const universalData = PLATFORM_MAPPERS.google(payload);
  const validation = validateLeadData(universalData);
  
  if (!validation.isValid) {
    throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
  }

  const processedLead = processLeadData(universalData, {
    platform: 'google',
    defaultStatus: 'NEW'
  });

  const { error } = await supabase
    .from('leads')
    .insert(processedLead);

  return !error;
}

/**
 * Reprocess landing page lead webhook
 */
async function reprocessLandingPageLead(payload: any): Promise<boolean> {
  const { processLeadData, validateLeadData, PLATFORM_MAPPERS } = await import('./lead-mapping');
  const supabase = await createClient();

  const universalData = PLATFORM_MAPPERS.landing_page(payload);
  const validation = validateLeadData(universalData);
  
  if (!validation.isValid) {
    throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
  }

  const processedLead = processLeadData(universalData, {
    platform: 'landing_page',
    defaultStatus: 'NEW'
  });

  const { error } = await supabase
    .from('leads')
    .insert(processedLead);

  return !error;
}

/**
 * Reprocess generic lead webhook
 */
async function reprocessGenericLead(payload: any): Promise<boolean> {
  const { processLeadData, validateLeadData, PLATFORM_MAPPERS } = await import('./lead-mapping');
  const supabase = await createClient();

  const universalData = PLATFORM_MAPPERS.generic(payload);
  const validation = validateLeadData(universalData);
  
  if (!validation.isValid) {
    throw new Error(`Invalid lead data: ${validation.errors.join(', ')}`);
  }

  const processedLead = processLeadData(universalData, {
    platform: 'generic',
    defaultStatus: 'NEW'
  });

  const { error } = await supabase
    .from('leads')
    .insert(processedLead);

  return !error;
}

/**
 * Log critical webhook failure for monitoring and alerting
 */
async function logCriticalWebhookFailure(retry: any): Promise<void> {
  const supabase = await createClient();

  await supabase
    .from('webhook_events')
    .insert({
      type: 'critical_webhook_failure',
      payload: {
        webhookType: retry.type,
        retryId: retry.id,
        attempts: retry.attempts + 1,
        lastError: retry.lastError,
        originalPayload: retry.payload,
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL'
      },
      status: 'FAILED',
      attempts: retry.attempts + 1,
      lastError: `Webhook moved to dead letter queue after ${retry.attempts + 1} attempts`,
      createdAt: new Date().toISOString()
    });

  // Log to console for immediate visibility
  console.error(`🚨 CRITICAL WEBHOOK FAILURE 🚨`, {
    type: retry.type,
    id: retry.id,
    attempts: retry.attempts + 1,
    lastError: retry.lastError,
    timestamp: new Date().toISOString()
  });
}

/**
 * Get dead letter queue statistics
 */
export async function getDeadLetterQueueStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  recent24h: number;
}> {
  const supabase = await createClient();
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get total count
  const { count: total } = await supabase
    .from('webhook_dead_letter_queue')
    .select('*', { count: 'exact', head: true });

  // Get count by type
  const { data: typeData } = await supabase
    .from('webhook_dead_letter_queue')
    .select('type')
    .eq('status', 'REQUIRES_MANUAL_REVIEW');

  const byType: Record<string, number> = {};
  typeData?.forEach(item => {
    byType[item.type] = (byType[item.type] || 0) + 1;
  });

  // Get recent 24h count
  const { count: recent24h } = await supabase
    .from('webhook_dead_letter_queue')
    .select('*', { count: 'exact', head: true })
    .gte('movedToDlqAt', last24h);

  return {
    total: total || 0,
    byType,
    recent24h: recent24h || 0,
  };
}

/**
 * Manually retry a webhook from dead letter queue
 */
export async function manualRetryFromDeadLetter(dlqId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data: dlqItem, error } = await supabase
    .from('webhook_dead_letter_queue')
    .select('*')
    .eq('id', dlqId)
    .single();

  if (error || !dlqItem) {
    throw new Error('Dead letter queue item not found');
  }

  try {
    const success = await reprocessWebhook(dlqItem);

    if (success) {
      await supabase
        .from('webhook_dead_letter_queue')
        .update({
          status: 'MANUALLY_RESOLVED',
          resolvedAt: new Date().toISOString(),
          metadata: {
            ...dlqItem.metadata,
            manuallyRetriedAt: new Date().toISOString(),
            manualRetrySuccess: true,
          }
        })
        .eq('id', dlqId);

      console.log(`Manual retry successful for DLQ item: ${dlqId}`);
      return true;
    } else {
      console.error(`Manual retry failed for DLQ item: ${dlqId}`);
      return false;
    }
  } catch (error) {
    console.error(`Manual retry error for DLQ item ${dlqId}:`, error);
    return false;
  }
}