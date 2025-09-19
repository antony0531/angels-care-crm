import { NextRequest, NextResponse } from 'next/server';

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

export interface SecurityHeadersConfig {
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
  enableCSP?: boolean;
  enableCORS?: boolean;
  corsConfig?: CorsConfig;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    'https://facebook.com',
    'https://*.facebook.com',
    'https://googleads.g.doubleclick.net',
    'https://*.googleads.com',
    'https://*.google.com',
    'https://ads.google.com',
  ],
  allowedMethods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Signature-256',
    'X-Hub-Signature-256',
    'X-Goog-Signature',
    'X-Timestamp',
    'X-Goog-Timestamp',
    'X-Platform',
    'User-Agent',
    'X-Forwarded-For',
    'X-Real-IP',
    'CF-Connecting-IP',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-RateLimit-Window',
  ],
  credentials: false,
  maxAge: 86400, // 24 hours
};

const DEFAULT_SECURITY_CONFIG: SecurityHeadersConfig = {
  enableHSTS: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: true,
  enableCSP: true,
  enableCORS: true,
  corsConfig: DEFAULT_CORS_CONFIG,
};

/**
 * Check if origin is allowed based on CORS configuration
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) return false;

  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin === '*') {
      return true;
    }
    
    if (allowedOrigin.includes('*')) {
      // Handle wildcard patterns like *.facebook.com
      const pattern = allowedOrigin.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`, 'i');
      if (regex.test(origin)) {
        return true;
      }
    } else if (allowedOrigin === origin) {
      return true;
    }
  }

  return false;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPrelight(
  request: NextRequest,
  config: CorsConfig = DEFAULT_CORS_CONFIG
): NextResponse | null {
  const origin = request.headers.get('origin');
  const method = request.headers.get('access-control-request-method');
  const headers = request.headers.get('access-control-request-headers');

  // Check if this is a preflight request
  if (request.method !== 'OPTIONS') {
    return null;
  }

  // Check if origin is allowed
  if (!isOriginAllowed(origin, config.allowedOrigins)) {
    return new NextResponse(null, { status: 403 });
  }

  // Check if method is allowed
  if (method && !config.allowedMethods.includes(method)) {
    return new NextResponse(null, { status: 405 });
  }

  // Create preflight response
  const response = new NextResponse(null, { status: 200 });
  
  // Set CORS headers
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', config.allowedMethods.join(', '));
  response.headers.set('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
  
  if (config.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  if (config.maxAge) {
    response.headers.set('Access-Control-Max-Age', config.maxAge.toString());
  }

  return response;
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(
  response: NextResponse,
  request: NextRequest,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_CONFIG
): NextResponse {
  // CORS Headers
  if (config.enableCORS && config.corsConfig) {
    const origin = request.headers.get('origin');
    
    if (isOriginAllowed(origin, config.corsConfig.allowedOrigins)) {
      if (origin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      if (config.corsConfig.exposedHeaders) {
        response.headers.set('Access-Control-Expose-Headers', config.corsConfig.exposedHeaders.join(', '));
      }
      
      if (config.corsConfig.credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true');
      }
    }
  }

  // HTTP Strict Transport Security (HSTS)
  if (config.enableHSTS) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // X-Frame-Options
  if (config.enableXFrameOptions) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // X-Content-Type-Options
  if (config.enableXContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // Referrer Policy
  if (config.enableReferrerPolicy) {
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }

  // Permissions Policy
  if (config.enablePermissionsPolicy) {
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), clipboard-read=(), clipboard-write=()'
    );
  }

  // Content Security Policy
  if (config.enableCSP) {
    const csp = [
      "default-src 'none'",
      "script-src 'none'",
      "style-src 'none'",
      "img-src 'none'",
      "connect-src 'none'",
      "font-src 'none'",
      "object-src 'none'",
      "media-src 'none'",
      "frame-src 'none'",
      "base-uri 'none'",
      "form-action 'none'",
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);
  }

  // Additional security headers
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}

/**
 * Webhook-specific security configuration
 */
export const WEBHOOK_SECURITY_CONFIG: SecurityHeadersConfig = {
  enableHSTS: true,
  enableXFrameOptions: true,
  enableXContentTypeOptions: true,
  enableReferrerPolicy: true,
  enablePermissionsPolicy: false, // Less restrictive for webhooks
  enableCSP: false, // Disabled for webhooks as they don't serve content
  enableCORS: true,
  corsConfig: {
    allowedOrigins: [
      // Facebook/Meta domains (includes Instagram)
      'https://facebook.com',
      'https://*.facebook.com',
      'https://graph.facebook.com',
      'https://instagram.com',
      'https://*.instagram.com',
      
      // Google domains
      'https://googleads.g.doubleclick.net',
      'https://*.googleads.com',
      'https://*.google.com',
      'https://ads.google.com',
      'https://googleadservices.com',
      
      // TikTok domains
      'https://tiktok.com',
      'https://*.tiktok.com',
      'https://ads.tiktok.com',
      'https://*.tiktokcdn.com',
      'https://business-api.tiktok.com',
      
      // Pinterest domains
      'https://pinterest.com',
      'https://*.pinterest.com',
      'https://ads.pinterest.com',
      'https://business.pinterest.com',
      
      // Snapchat domains
      'https://snapchat.com',
      'https://*.snapchat.com',
      'https://ads.snapchat.com',
      'https://business.snapchat.com',
      'https://*.snap.com',
      
      // Landing page and form builders
      'https://*.typeform.com',
      'https://*.wufoo.com',
      'https://*.jotform.com',
      'https://*.formstack.com',
      'https://*.gravity.com',
      'https://*.hubspot.com',
      'https://*.mailchimp.com',
      'https://*.constantcontact.com',
      
      // Development/localhost (only in development)
      ...(process.env.NODE_ENV === 'development' ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ] : []),
    ],
    allowedMethods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Signature-256',
      'X-Hub-Signature-256',
      'X-Goog-Signature',
      'X-Timestamp',
      'X-Goog-Timestamp',
      'X-Platform',
      'User-Agent',
      'X-Forwarded-For',
      'X-Real-IP',
      'CF-Connecting-IP',
    ],
    exposedHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-RateLimit-Window',
    ],
    credentials: false,
    maxAge: 86400, // 24 hours
  },
};

/**
 * Comprehensive webhook security middleware
 */
export function withWebhookSecurity(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
  config: SecurityHeadersConfig = WEBHOOK_SECURITY_CONFIG
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      const preflightResponse = handleCorsPrelight(request, config.corsConfig);
      if (preflightResponse) {
        return applySecurityHeaders(preflightResponse, request, config);
      }
    }

    // Execute the handler
    const response = await handler(request);

    // Apply security headers
    return applySecurityHeaders(response, request, config);
  };
}

/**
 * Log security events for monitoring
 */
export function logSecurityEvent(
  type: 'CORS_VIOLATION' | 'INVALID_ORIGIN' | 'BLOCKED_REQUEST',
  request: NextRequest,
  details: Record<string, any> = {}
): void {
  const securityEvent = {
    type,
    timestamp: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
        request.headers.get('x-real-ip') || 
        request.ip || 'unknown',
    userAgent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    referer: request.headers.get('referer'),
    url: request.url,
    method: request.method,
    ...details,
  };

  console.warn(`🔒 SECURITY EVENT: ${type}`, securityEvent);

  // In production, you might want to send this to a security monitoring service
  // await sendToSecurityMonitoring(securityEvent);
}