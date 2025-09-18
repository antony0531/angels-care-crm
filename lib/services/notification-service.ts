import { CrmSettings } from '@/lib/contexts/settings-context';
import { FrontendLead } from '@/types/lead';
import { LeadScore } from './lead-scoring';
import { AssignmentResult } from './lead-assignment';

export interface NotificationPayload {
  type: 'lead_created' | 'lead_assigned' | 'lead_converted' | 'lead_lost' | 'high_score_lead' | 'daily_digest';
  lead?: FrontendLead;
  leadScore?: LeadScore;
  assignmentResult?: AssignmentResult;
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'in_app';
  enabled: boolean;
  config: Record<string, any>;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  message?: string;
  error?: string;
}

/**
 * Notification Service - Handles all notifications based on CRM settings
 */
export class NotificationService {
  private settings: CrmSettings;
  private channels: NotificationChannel[];

  constructor(settings: CrmSettings) {
    this.settings = settings;
    this.channels = this.buildChannels();
  }

  /**
   * Send notification for a specific event
   */
  async sendNotification(payload: NotificationPayload): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    // Check if notifications are enabled
    if (!this.shouldSendNotification(payload)) {
      return [{
        success: false,
        channel: 'none',
        message: 'Notifications disabled for this event type'
      }];
    }

    // Send to each enabled channel
    for (const channel of this.channels) {
      if (!channel.enabled) continue;

      try {
        const result = await this.sendToChannel(channel, payload);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          channel: channel.type,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Send notification to specific channel
   */
  private async sendToChannel(channel: NotificationChannel, payload: NotificationPayload): Promise<NotificationResult> {
    switch (channel.type) {
      case 'email':
        return this.sendEmailNotification(payload);
      case 'sms':
        return this.sendSmsNotification(payload);
      case 'webhook':
        return this.sendWebhookNotification(payload);
      case 'in_app':
        return this.sendInAppNotification(payload);
      default:
        return {
          success: false,
          channel: channel.type,
          error: 'Unsupported channel type'
        };
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.settings.notificationEmail) {
      return {
        success: false,
        channel: 'email',
        error: 'No notification email configured'
      };
    }

    const emailContent = this.generateEmailContent(payload);
    
    // Mock email sending (in production, integrate with SendGrid, Mailgun, etc.)
    console.log('📧 Email notification sent:', {
      to: this.settings.notificationEmail,
      subject: emailContent.subject,
      body: emailContent.body
    });

    // Simulate email delivery
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          channel: 'email',
          message: `Email sent to ${this.settings.notificationEmail}`
        });
      }, 100);
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.settings.smsNumber) {
      return {
        success: false,
        channel: 'sms',
        error: 'No SMS number configured'
      };
    }

    const smsContent = this.generateSmsContent(payload);
    
    // Mock SMS sending (in production, integrate with Twilio, etc.)
    console.log('📱 SMS notification sent:', {
      to: this.settings.smsNumber,
      message: smsContent
    });

    // Simulate SMS delivery
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          success: true,
          channel: 'sms',
          message: `SMS sent to ${this.settings.smsNumber}`
        });
      }, 100);
    });
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(payload: NotificationPayload): Promise<NotificationResult> {
    if (!this.settings.webhookUrl) {
      return {
        success: false,
        channel: 'webhook',
        error: 'No webhook URL configured'
      };
    }

    try {
      // Mock webhook call (in production, make actual HTTP request)
      console.log('🔗 Webhook notification sent:', {
        url: this.settings.webhookUrl,
        payload: this.generateWebhookPayload(payload)
      });

      // Simulate webhook delivery
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            channel: 'webhook',
            message: `Webhook sent to ${this.settings.webhookUrl}`
          });
        }, 200);
      });
    } catch (error) {
      return {
        success: false,
        channel: 'webhook',
        error: error instanceof Error ? error.message : 'Webhook failed'
      };
    }
  }

  /**
   * Send in-app notification
   */
  private async sendInAppNotification(payload: NotificationPayload): Promise<NotificationResult> {
    // Mock in-app notification (in production, use WebSockets, Server-Sent Events, etc.)
    console.log('🔔 In-app notification sent:', {
      type: payload.type,
      message: this.generateInAppMessage(payload)
    });

    return {
      success: true,
      channel: 'in_app',
      message: 'In-app notification sent'
    };
  }

  /**
   * Check if notification should be sent based on settings and event type
   */
  private shouldSendNotification(payload: NotificationPayload): boolean {
    // Check instant alerts setting
    if (!this.settings.instantAlerts && payload.type !== 'daily_digest') {
      return false;
    }

    // Check daily digest setting
    if (payload.type === 'daily_digest' && !this.settings.dailyDigest) {
      return false;
    }

    // Additional filtering based on event type and lead score
    switch (payload.type) {
      case 'high_score_lead':
        // Only notify for high-score leads if score is above threshold
        return (payload.leadScore?.percentage || 0) >= 70;
      
      case 'lead_created':
        // Always notify for new leads if instant alerts are enabled
        return this.settings.instantAlerts;
      
      case 'lead_assigned':
        // Notify for assignments if instant alerts are enabled
        return this.settings.instantAlerts;
      
      case 'lead_converted':
        // Always notify for conversions
        return true;
      
      case 'lead_lost':
        // Notify for lost leads if they had high scores
        return (payload.leadScore?.percentage || 0) >= 60;
      
      default:
        return true;
    }
  }

  /**
   * Build notification channels based on settings
   */
  private buildChannels(): NotificationChannel[] {
    return [
      {
        type: 'email',
        enabled: this.settings.emailNotifications,
        config: { email: this.settings.notificationEmail }
      },
      {
        type: 'sms',
        enabled: this.settings.smsNotifications,
        config: { phone: this.settings.smsNumber }
      },
      {
        type: 'webhook',
        enabled: this.settings.webhookNotifications,
        config: { url: this.settings.webhookUrl }
      },
      {
        type: 'in_app',
        enabled: true, // Always enabled for real-time UI updates
        config: {}
      }
    ];
  }

  /**
   * Generate email content based on notification type
   */
  private generateEmailContent(payload: NotificationPayload): { subject: string; body: string } {
    switch (payload.type) {
      case 'lead_created':
        return {
          subject: `New Lead: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`,
          body: `
            A new lead has been captured:
            
            Name: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}
            Email: ${payload.lead?.email}
            Phone: ${payload.lead?.phone}
            Insurance Type: ${payload.lead?.insuranceType}
            Source: ${payload.lead?.source}
            ${payload.leadScore ? `Score: ${payload.leadScore.score}/${payload.leadScore.maxScore} (${payload.leadScore.percentage}%)` : ''}
            
            View lead details in the CRM dashboard.
          `
        };

      case 'lead_assigned':
        return {
          subject: `Lead Assigned: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`,
          body: `
            A lead has been assigned:
            
            Lead: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}
            ${payload.assignmentResult ? `Assigned to: ${payload.assignmentResult.assignedTo}` : ''}
            ${payload.assignmentResult ? `Reason: ${payload.assignmentResult.reason}` : ''}
            
            View assignment details in the CRM dashboard.
          `
        };

      case 'high_score_lead':
        return {
          subject: `🔥 High-Score Lead Alert: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`,
          body: `
            A high-priority lead requires immediate attention:
            
            Name: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}
            Email: ${payload.lead?.email}
            Score: ${payload.leadScore?.score}/${payload.leadScore?.maxScore} (${payload.leadScore?.percentage}%)
            Insurance Type: ${payload.lead?.insuranceType}
            
            This lead shows high conversion potential. Contact immediately!
          `
        };

      case 'lead_converted':
        return {
          subject: `🎉 Lead Converted: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`,
          body: `
            Congratulations! A lead has been converted:
            
            Name: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}
            Email: ${payload.lead?.email}
            Insurance Type: ${payload.lead?.insuranceType}
            Estimated Value: $${payload.lead?.estimatedValue || 0}
            
            Great work on the conversion!
          `
        };

      default:
        return {
          subject: 'CRM Notification',
          body: `A ${payload.type} event has occurred in your CRM.`
        };
    }
  }

  /**
   * Generate SMS content (shorter format)
   */
  private generateSmsContent(payload: NotificationPayload): string {
    switch (payload.type) {
      case 'lead_created':
        return `New lead: ${payload.lead?.firstName} ${payload.lead?.lastName || ''} (${payload.lead?.insuranceType})${payload.leadScore ? ` Score: ${payload.leadScore.percentage}%` : ''}`;
      
      case 'high_score_lead':
        return `🔥 HIGH PRIORITY: ${payload.lead?.firstName} ${payload.lead?.lastName || ''} scored ${payload.leadScore?.percentage}%. Contact ASAP!`;
      
      case 'lead_converted':
        return `🎉 CONVERSION: ${payload.lead?.firstName} ${payload.lead?.lastName || ''} converted! Value: $${payload.lead?.estimatedValue || 0}`;
      
      default:
        return `CRM Alert: ${payload.type} event occurred`;
    }
  }

  /**
   * Generate webhook payload
   */
  private generateWebhookPayload(payload: NotificationPayload): Record<string, any> {
    return {
      event: payload.type,
      timestamp: new Date().toISOString(),
      lead: payload.lead,
      score: payload.leadScore,
      assignment: payload.assignmentResult,
      metadata: payload.metadata
    };
  }

  /**
   * Generate in-app notification message
   */
  private generateInAppMessage(payload: NotificationPayload): string {
    switch (payload.type) {
      case 'lead_created':
        return `New lead captured: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`;
      case 'lead_assigned':
        return `Lead assigned: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`;
      case 'high_score_lead':
        return `High-priority lead: ${payload.lead?.firstName} ${payload.lead?.lastName || ''} (${payload.leadScore?.percentage}%)`;
      case 'lead_converted':
        return `Lead converted: ${payload.lead?.firstName} ${payload.lead?.lastName || ''}`;
      default:
        return `CRM event: ${payload.type}`;
    }
  }
}

/**
 * Utility function to send notification
 */
export async function sendNotification(
  payload: NotificationPayload,
  settings: CrmSettings
): Promise<NotificationResult[]> {
  const service = new NotificationService(settings);
  return service.sendNotification(payload);
}

/**
 * Utility function to send lead event notifications
 */
export async function notifyLeadEvent(
  eventType: NotificationPayload['type'],
  lead: FrontendLead,
  settings: CrmSettings,
  additionalData?: {
    leadScore?: LeadScore;
    assignmentResult?: AssignmentResult;
    metadata?: Record<string, any>;
  }
): Promise<NotificationResult[]> {
  const payload: NotificationPayload = {
    type: eventType,
    lead,
    leadScore: additionalData?.leadScore,
    assignmentResult: additionalData?.assignmentResult,
    metadata: additionalData?.metadata
  };

  return sendNotification(payload, settings);
}