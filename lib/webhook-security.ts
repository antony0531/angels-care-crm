import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';
import { createWebhookRateLimit } from './rate-limiter';

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  rateLimited?: boolean;
  rateLimitHeaders?: Record<string, string>;
}

/**
 * Validates webhook signature using HMAC-SHA256
 * Follows industry standards for webhook security
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  algorithm: string = 'sha256'
): boolean {
  if (!signature || !secret || !payload) {
    return false;
  }

  try {
    // Remove algorithm prefix if present (e.g., "sha256=")
    const cleanSignature = signature.replace(`${algorithm}=`, '');
    
    // Generate expected signature
    const expectedSignature = createHmac(algorithm, secret)
      .update(payload, 'utf8')
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const actualBuffer = Buffer.from(cleanSignature, 'hex');

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, actualBuffer);
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}

/**
 * Validates webhook timestamp to prevent replay attacks
 * Rejects requests older than 5 minutes
 */
export function validateWebhookTimestamp(
  timestamp: string | number,
  toleranceInSeconds: number = 300 // 5 minutes
): boolean {
  try {
    const webhookTime = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    const currentTime = Math.floor(Date.now() / 1000);
    
    return Math.abs(currentTime - webhookTime) <= toleranceInSeconds;
  } catch {
    return false;
  }
}


/**
 * Extract client IP address from request headers
 * Handles various proxy configurations
 */
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfIP = request.headers.get('cf-connecting-ip'); // Cloudflare
  if (cfIP) {
    return cfIP;
  }

  // Fallback to connection IP (may be proxy IP)
  return request.ip || 'unknown';
}

/**
 * Comprehensive webhook validation
 * Combines signature, timestamp, and rate limiting checks
 */
export async function validateWebhookRequest(
  request: NextRequest,
  secret: string,
  options: {
    checkSignature?: boolean;
    checkTimestamp?: boolean;
    checkRateLimit?: boolean;
    signatureHeader?: string;
    timestampHeader?: string;
    platform?: 'facebook' | 'google' | 'landing_page' | 'generic';
  } = {}
): Promise<WebhookValidationResult> {
  const {
    checkSignature = true,
    checkTimestamp = true,
    checkRateLimit = true,
    signatureHeader = 'x-signature-256',
    timestampHeader = 'x-timestamp',
    platform = 'generic'
  } = options;

  try {
    // Get request body as text
    const payload = await request.text();
    
    // Rate limiting check using new rate limiter
    if (checkRateLimit) {
      const rateLimitCheck = createWebhookRateLimit(platform);
      const { allowed, headers } = await rateLimitCheck(request);
      
      if (!allowed) {
        return {
          isValid: false,
          error: 'Rate limit exceeded',
          rateLimited: true,
          rateLimitHeaders: headers
        };
      }
    }

    // Signature validation
    if (checkSignature) {
      const signature = request.headers.get(signatureHeader);
      
      if (!signature) {
        return {
          isValid: false,
          error: `Missing ${signatureHeader} header`
        };
      }

      if (!validateWebhookSignature(payload, signature, secret)) {
        return {
          isValid: false,
          error: 'Invalid webhook signature'
        };
      }
    }

    // Timestamp validation (prevents replay attacks)
    if (checkTimestamp) {
      const timestamp = request.headers.get(timestampHeader);
      
      if (!timestamp) {
        return {
          isValid: false,
          error: `Missing ${timestampHeader} header`
        };
      }

      if (!validateWebhookTimestamp(timestamp)) {
        return {
          isValid: false,
          error: 'Webhook timestamp too old or invalid'
        };
      }
    }

    return { isValid: true };

  } catch (error) {
    console.error('Webhook validation error:', error);
    return {
      isValid: false,
      error: 'Webhook validation failed'
    };
  }
}

/**
 * Platform-specific webhook validation configs
 */
export const WEBHOOK_CONFIGS = {
  facebook: {
    signatureHeader: 'x-hub-signature-256',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'FACEBOOK_WEBHOOK_SECRET'
  },
  instagram: {
    signatureHeader: 'x-hub-signature-256',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'INSTAGRAM_WEBHOOK_SECRET'
  },
  google: {
    signatureHeader: 'x-goog-signature',
    timestampHeader: 'x-goog-timestamp', 
    secretEnvVar: 'GOOGLE_WEBHOOK_SECRET'
  },
  tiktok: {
    signatureHeader: 'x-tiktok-signature',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'TIKTOK_WEBHOOK_SECRET'
  },
  pinterest: {
    signatureHeader: 'x-pinterest-signature',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'PINTEREST_WEBHOOK_SECRET'
  },
  snapchat: {
    signatureHeader: 'x-snapchat-signature',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'SNAPCHAT_WEBHOOK_SECRET'
  },
  generic: {
    signatureHeader: 'x-signature-256',
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'GENERIC_WEBHOOK_SECRET'
  },
  landing_page: {
    signatureHeader: 'x-signature-256', 
    timestampHeader: 'x-timestamp',
    secretEnvVar: 'LANDING_PAGE_WEBHOOK_SECRET'
  }
} as const;

/**
 * Generate webhook signature for outgoing webhooks
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
}