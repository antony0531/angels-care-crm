import { NextRequest, NextResponse } from 'next/server';
import { processWebhookRetries, getDeadLetterQueueStats } from '@/lib/webhook-retry';

export const dynamic = 'force-dynamic';

/**
 * Webhook Retry Processing Endpoint
 * This endpoint should be called periodically (e.g., via cron job) to process pending webhook retries
 * 
 * Authentication: Requires API key for security
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.WEBHOOK_RETRY_API_KEY || process.env.API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting webhook retry processing...');
    
    // Process pending retries
    await processWebhookRetries();
    
    // Get stats for response
    const stats = await getDeadLetterQueueStats();
    
    console.log('Webhook retry processing completed');
    
    return NextResponse.json({
      success: true,
      message: 'Webhook retries processed',
      stats,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Error processing webhook retries:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook retries',
        message: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check retry queue status and stats
 */
export async function GET(request: NextRequest) {
  try {
    // Verify API key for security
    const apiKey = request.headers.get('x-api-key');
    const expectedApiKey = process.env.WEBHOOK_RETRY_API_KEY || process.env.API_KEY;
    
    if (!expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get dead letter queue statistics
    const dlqStats = await getDeadLetterQueueStats();
    
    // TODO: Add retry queue statistics when Prisma is connected
    // For now, return DLQ stats only
    
    return NextResponse.json({
      success: true,
      deadLetterQueue: dlqStats,
      retryQueue: {
        pending: 0,
        retrying: 0,
        total: 0
      },
      lastChecked: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting retry queue stats:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get retry queue stats',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}