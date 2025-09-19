import { createClient } from '@/lib/supabase/server';

export interface WebhookMetrics {
  totalRequests: number;
  successRate: number;
  averageProcessingTime: number;
  errorRate: number;
  retryRate: number;
  platformBreakdown: Record<string, {
    requests: number;
    success: number;
    failed: number;
    avgProcessingTime: number;
  }>;
  recentErrors: Array<{
    timestamp: string;
    platform: string;
    error: string;
    count: number;
  }>;
  timeSeriesData: Array<{
    timestamp: string;
    requests: number;
    success: number;
    failed: number;
    avgProcessingTime: number;
  }>;
}

export interface WebhookAlert {
  id: string;
  type: 'ERROR_RATE' | 'PROCESSING_TIME' | 'VOLUME_SPIKE' | 'DEAD_LETTER_QUEUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  platform?: string;
  message: string;
  threshold: number;
  currentValue: number;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface WebhookPerformanceLog {
  id: string;
  platform: string;
  endpoint: string;
  method: string;
  statusCode: number;
  processingTime: number;
  payloadSize: number;
  timestamp: string;
  errorMessage?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Log webhook performance data
 */
export async function logWebhookPerformance(data: Omit<WebhookPerformanceLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('webhook_performance_logs')
      .insert({
        ...data,
        timestamp: new Date().toISOString(),
      });

    // Check for performance alerts
    await checkPerformanceAlerts(data);

  } catch (error) {
    console.error('Failed to log webhook performance:', error);
  }
}

/**
 * Get webhook analytics for a specific time period
 */
export async function getWebhookAnalytics(
  startDate: Date,
  endDate: Date,
  platform?: string
): Promise<WebhookMetrics> {
  try {
    const supabase = await createClient();
    
    // Build query filters
    let query = supabase
      .from('webhook_performance_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString());

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    return calculateMetrics(logs || []);

  } catch (error) {
    console.error('Failed to get webhook analytics:', error);
    throw error;
  }
}

/**
 * Calculate metrics from webhook performance logs
 */
function calculateMetrics(logs: any[]): WebhookMetrics {
  if (logs.length === 0) {
    return {
      totalRequests: 0,
      successRate: 0,
      averageProcessingTime: 0,
      errorRate: 0,
      retryRate: 0,
      platformBreakdown: {},
      recentErrors: [],
      timeSeriesData: [],
    };
  }

  const totalRequests = logs.length;
  const successfulRequests = logs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
  const failedRequests = logs.filter(log => log.statusCode >= 400).length;
  const successRate = (successfulRequests / totalRequests) * 100;
  const errorRate = (failedRequests / totalRequests) * 100;
  
  const totalProcessingTime = logs.reduce((sum, log) => sum + (log.processingTime || 0), 0);
  const averageProcessingTime = totalProcessingTime / totalRequests;

  // Platform breakdown
  const platformBreakdown: Record<string, any> = {};
  logs.forEach(log => {
    if (!platformBreakdown[log.platform]) {
      platformBreakdown[log.platform] = {
        requests: 0,
        success: 0,
        failed: 0,
        totalProcessingTime: 0,
      };
    }
    
    const platform = platformBreakdown[log.platform];
    platform.requests++;
    
    if (log.statusCode >= 200 && log.statusCode < 300) {
      platform.success++;
    } else if (log.statusCode >= 400) {
      platform.failed++;
    }
    
    platform.totalProcessingTime += log.processingTime || 0;
  });

  // Calculate average processing time per platform
  Object.keys(platformBreakdown).forEach(platform => {
    const data = platformBreakdown[platform];
    data.avgProcessingTime = data.totalProcessingTime / data.requests;
    delete data.totalProcessingTime;
  });

  // Recent errors (last 24 hours)
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentErrorLogs = logs
    .filter(log => 
      log.statusCode >= 400 && 
      new Date(log.timestamp) >= last24Hours
    )
    .slice(-10); // Get last 10 errors

  const recentErrors = recentErrorLogs.map(log => ({
    timestamp: log.timestamp,
    platform: log.platform,
    error: log.errorMessage || `HTTP ${log.statusCode}`,
    count: 1, // For now, each error is counted as 1
  }));

  // Time series data (hourly buckets)
  const timeSeriesData = generateTimeSeriesData(logs);

  return {
    totalRequests,
    successRate: Number(successRate.toFixed(2)),
    averageProcessingTime: Number(averageProcessingTime.toFixed(2)),
    errorRate: Number(errorRate.toFixed(2)),
    retryRate: 0, // TODO: Calculate from retry logs when available
    platformBreakdown,
    recentErrors,
    timeSeriesData,
  };
}

/**
 * Generate time series data for visualization
 */
function generateTimeSeriesData(logs: any[]): Array<{
  timestamp: string;
  requests: number;
  success: number;
  failed: number;
  avgProcessingTime: number;
}> {
  // Group logs by hour
  const hourlyData: Record<string, any[]> = {};
  
  logs.forEach(log => {
    const hour = new Date(log.timestamp);
    hour.setMinutes(0, 0, 0); // Round down to hour
    const hourKey = hour.toISOString();
    
    if (!hourlyData[hourKey]) {
      hourlyData[hourKey] = [];
    }
    hourlyData[hourKey].push(log);
  });

  // Calculate metrics for each hour
  return Object.entries(hourlyData)
    .map(([timestamp, hourLogs]) => {
      const requests = hourLogs.length;
      const success = hourLogs.filter(log => log.statusCode >= 200 && log.statusCode < 300).length;
      const failed = hourLogs.filter(log => log.statusCode >= 400).length;
      const totalProcessingTime = hourLogs.reduce((sum, log) => sum + (log.processingTime || 0), 0);
      const avgProcessingTime = totalProcessingTime / requests;

      return {
        timestamp,
        requests,
        success,
        failed,
        avgProcessingTime: Number(avgProcessingTime.toFixed(2)),
      };
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

/**
 * Check for performance alerts based on current metrics
 */
async function checkPerformanceAlerts(data: Omit<WebhookPerformanceLog, 'id' | 'timestamp'>): Promise<void> {
  try {
    const alerts: WebhookAlert[] = [];

    // High processing time alert
    if (data.processingTime > 5000) { // 5 seconds
      alerts.push({
        id: `processing-time-${Date.now()}`,
        type: 'PROCESSING_TIME',
        severity: data.processingTime > 10000 ? 'CRITICAL' : 'HIGH',
        platform: data.platform,
        message: `High processing time detected: ${data.processingTime}ms`,
        threshold: 5000,
        currentValue: data.processingTime,
        createdAt: new Date().toISOString(),
        resolved: false,
      });
    }

    // Error rate alert (check last hour)
    if (data.statusCode >= 400) {
      const errorRate = await calculateRecentErrorRate(data.platform);
      if (errorRate > 10) { // 10% error rate
        alerts.push({
          id: `error-rate-${Date.now()}`,
          type: 'ERROR_RATE',
          severity: errorRate > 25 ? 'CRITICAL' : 'HIGH',
          platform: data.platform,
          message: `High error rate detected: ${errorRate.toFixed(2)}%`,
          threshold: 10,
          currentValue: errorRate,
          createdAt: new Date().toISOString(),
          resolved: false,
        });
      }
    }

    // Log alerts if any
    if (alerts.length > 0) {
      await logWebhookAlerts(alerts);
    }

  } catch (error) {
    console.error('Failed to check performance alerts:', error);
  }
}

/**
 * Calculate recent error rate for a platform
 */
async function calculateRecentErrorRate(platform: string): Promise<number> {
  try {
    const supabase = await createClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: logs, error } = await supabase
      .from('webhook_performance_logs')
      .select('statusCode')
      .eq('platform', platform)
      .gte('timestamp', oneHourAgo.toISOString());

    if (error || !logs || logs.length === 0) {
      return 0;
    }

    const totalRequests = logs.length;
    const errorRequests = logs.filter(log => log.statusCode >= 400).length;
    
    return (errorRequests / totalRequests) * 100;

  } catch (error) {
    console.error('Failed to calculate error rate:', error);
    return 0;
  }
}

/**
 * Log webhook alerts
 */
async function logWebhookAlerts(alerts: WebhookAlert[]): Promise<void> {
  try {
    const supabase = await createClient();

    for (const alert of alerts) {
      // Insert into webhook_alerts table
      await supabase
        .from('webhook_alerts')
        .insert(alert);

      // Log to webhook_events for general tracking
      await supabase
        .from('webhook_events')
        .insert({
          type: 'webhook_alert',
          payload: alert,
          status: 'SUCCESS',
          attempts: 1,
          createdAt: alert.createdAt,
        });

      // Log critical alerts to console
      if (alert.severity === 'CRITICAL') {
        console.error(`🚨 CRITICAL WEBHOOK ALERT 🚨`, {
          type: alert.type,
          platform: alert.platform,
          message: alert.message,
          currentValue: alert.currentValue,
          threshold: alert.threshold,
          timestamp: alert.createdAt,
        });
      }
    }

  } catch (error) {
    console.error('Failed to log webhook alerts:', error);
  }
}

/**
 * Get active webhook alerts
 */
export async function getActiveWebhookAlerts(): Promise<WebhookAlert[]> {
  try {
    const supabase = await createClient();

    const { data: alerts, error } = await supabase
      .from('webhook_alerts')
      .select('*')
      .eq('resolved', false)
      .order('createdAt', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return alerts || [];

  } catch (error) {
    console.error('Failed to get webhook alerts:', error);
    return [];
  }
}

/**
 * Resolve a webhook alert
 */
export async function resolveWebhookAlert(alertId: string): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase
      .from('webhook_alerts')
      .update({
        resolved: true,
        resolvedAt: new Date().toISOString(),
      })
      .eq('id', alertId);

  } catch (error) {
    console.error('Failed to resolve webhook alert:', error);
  }
}

/**
 * Get webhook health status
 */
export async function getWebhookHealthStatus(): Promise<{
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  uptime: number;
  activeAlerts: number;
  lastSuccessfulRequest?: string;
  metrics: {
    last24h: WebhookMetrics;
    lastHour: WebhookMetrics;
  };
}> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const [last24hMetrics, lastHourMetrics, activeAlerts] = await Promise.all([
      getWebhookAnalytics(last24h, now),
      getWebhookAnalytics(lastHour, now),
      getActiveWebhookAlerts(),
    ]);

    // Determine overall health status
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    
    if (activeAlerts.some(alert => alert.severity === 'CRITICAL')) {
      status = 'CRITICAL';
    } else if (lastHourMetrics.errorRate > 10 || activeAlerts.length > 0) {
      status = 'WARNING';
    }

    // Calculate uptime (simplified - based on successful requests in last 24h)
    const uptime = last24hMetrics.totalRequests > 0 ? last24hMetrics.successRate : 100;

    return {
      status,
      uptime,
      activeAlerts: activeAlerts.length,
      metrics: {
        last24h: last24hMetrics,
        lastHour: lastHourMetrics,
      },
    };

  } catch (error) {
    console.error('Failed to get webhook health status:', error);
    return {
      status: 'CRITICAL',
      uptime: 0,
      activeAlerts: 0,
      metrics: {
        last24h: {
          totalRequests: 0,
          successRate: 0,
          averageProcessingTime: 0,
          errorRate: 0,
          retryRate: 0,
          platformBreakdown: {},
          recentErrors: [],
          timeSeriesData: [],
        },
        lastHour: {
          totalRequests: 0,
          successRate: 0,
          averageProcessingTime: 0,
          errorRate: 0,
          retryRate: 0,
          platformBreakdown: {},
          recentErrors: [],
          timeSeriesData: [],
        },
      },
    };
  }
}