import { NextRequest, NextResponse } from 'next/server';
import { 
  getWebhookAnalytics, 
  getActiveWebhookAlerts, 
  getWebhookHealthStatus,
  resolveWebhookAlert 
} from '@/lib/webhook-analytics';

export const dynamic = 'force-dynamic';

/**
 * Webhook Analytics and Monitoring API
 * Provides comprehensive metrics and monitoring data for webhook performance
 */

/**
 * GET - Fetch webhook analytics and monitoring data
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

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'metrics';
    const platform = searchParams.get('platform') || undefined;
    const hoursBack = parseInt(searchParams.get('hours') || '24');

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - hoursBack * 60 * 60 * 1000);

    switch (action) {
      case 'metrics':
        const metrics = await getWebhookAnalytics(startDate, endDate, platform);
        return NextResponse.json({
          success: true,
          data: metrics,
          timeRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            hours: hoursBack,
          },
          platform: platform || 'all',
        });

      case 'alerts':
        const alerts = await getActiveWebhookAlerts();
        return NextResponse.json({
          success: true,
          data: alerts,
          count: alerts.length,
        });

      case 'health':
        const health = await getWebhookHealthStatus();
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString(),
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: metrics, alerts, or health' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching webhook analytics:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch webhook analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Handle webhook analytics actions (e.g., resolve alerts)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, alertId } = body;

    switch (action) {
      case 'resolve_alert':
        if (!alertId) {
          return NextResponse.json(
            { error: 'Alert ID is required' },
            { status: 400 }
          );
        }

        await resolveWebhookAlert(alertId);
        
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully',
          alertId,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing webhook analytics action:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process webhook analytics action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}