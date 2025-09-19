import { NextRequest } from 'next/server';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: NextRequest) => string;
  onLimitReached?: (key: string, request: NextRequest) => void;
}

export interface RateLimitResult {
  isAllowed: boolean;
  remainingRequests: number;
  resetTime: number;
  totalRequests: number;
}

class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { count: number; resetTime: number } | undefined {
    return this.store.get(key);
  }

  set(key: string, value: { count: number; resetTime: number }): void {
    this.store.set(key, value);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}

export class RateLimiter {
  private store: InMemoryStore;
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.store = new InMemoryStore();
    this.config = {
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: this.defaultKeyGenerator,
      onLimitReached: () => {},
      ...config,
    };

    setInterval(() => {
      this.store.cleanup();
    }, this.config.windowMs);
  }

  private defaultKeyGenerator(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfIP = request.headers.get('cf-connecting-ip');
    const ip = forwarded?.split(',')[0].trim() || realIP || cfIP || request.ip || 'unknown';
    
    return `${ip}:${request.nextUrl.pathname}`;
  }

  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator(request);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    let record = this.store.get(key);

    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime };
      this.store.set(key, record);
    }

    const isAllowed = record.count < this.config.maxRequests;

    if (isAllowed) {
      record.count++;
      this.store.set(key, record);
    } else {
      this.config.onLimitReached(key, request);
    }

    return {
      isAllowed,
      remainingRequests: Math.max(0, this.config.maxRequests - record.count),
      resetTime: record.resetTime,
      totalRequests: record.count,
    };
  }

  async increment(request: NextRequest): Promise<void> {
    const key = this.config.keyGenerator(request);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    let record = this.store.get(key);

    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime };
    } else {
      record.count++;
    }

    this.store.set(key, record);
  }

  reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const webhookRateLimiters = {
  facebook: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '1000'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `facebook:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Facebook webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  instagram: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '1000'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `instagram:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Instagram webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  google: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '1000'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `google:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Google webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  tiktok: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '800'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `tiktok:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for TikTok webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  pinterest: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '600'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `pinterest:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Pinterest webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  snapchat: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '600'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `snapchat:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Snapchat webhook: ${key}`, {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  landing_page: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '500'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      return `landing_page:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Landing Page webhook: ${key}`, {
        url: request.url,
        referrer: request.headers.get('referer'),
        timestamp: new Date().toISOString(),
      });
    },
  }),

  generic: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: parseInt(process.env.WEBHOOK_MAX_REQUESTS_PER_HOUR || '200'),
    keyGenerator: (request) => {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                 request.headers.get('x-real-ip') || 
                 request.ip || 'unknown';
      const platform = request.headers.get('x-platform') || 'unknown';
      return `generic:${platform}:${ip}`;
    },
    onLimitReached: (key, request) => {
      console.warn(`Rate limit exceeded for Generic webhook: ${key}`, {
        url: request.url,
        platform: request.headers.get('x-platform'),
        timestamp: new Date().toISOString(),
      });
    },
  }),
};

export async function applyRateLimit(
  request: NextRequest,
  limiter: RateLimiter
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const result = await limiter.checkLimit(request);

  const headers = {
    'X-RateLimit-Limit': limiter['config'].maxRequests.toString(),
    'X-RateLimit-Remaining': result.remainingRequests.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'X-RateLimit-Window': Math.ceil(limiter['config'].windowMs / 1000).toString(),
  };

  if (!result.isAllowed) {
    headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString();
  }

  return {
    allowed: result.isAllowed,
    headers,
  };
}

export function createWebhookRateLimit(platform: keyof typeof webhookRateLimiters) {
  return async (request: NextRequest) => {
    const limiter = webhookRateLimiters[platform];
    if (!limiter) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    return applyRateLimit(request, limiter);
  };
}

export function getRateLimitInfo(request: NextRequest, platform: keyof typeof webhookRateLimiters) {
  const limiter = webhookRateLimiters[platform];
  if (!limiter) {
    return null;
  }

  const key = limiter['config'].keyGenerator(request);
  const record = limiter['store'].get(key);
  
  if (!record) {
    return {
      requests: 0,
      remaining: limiter['config'].maxRequests,
      resetTime: Date.now() + limiter['config'].windowMs,
    };
  }

  return {
    requests: record.count,
    remaining: Math.max(0, limiter['config'].maxRequests - record.count),
    resetTime: record.resetTime,
  };
}