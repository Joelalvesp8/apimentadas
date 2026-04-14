import { NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of Array.from(rateLimitStore.entries())) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean every minute

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'auth-login': { maxAttempts: 5, windowMs: 15 * 60 * 1000 },       // 5 per 15 min
  'auth-register': { maxAttempts: 3, windowMs: 60 * 60 * 1000 },    // 3 per hour
  'auth-forgot-password': { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  'auth-reset-password': { maxAttempts: 5, windowMs: 60 * 60 * 1000 },  // 5 per hour
};

/**
 * Check rate limit for a given action and identifier (IP or email).
 * Returns null if allowed, or a NextResponse if rate limited.
 */
export function checkRateLimit(
  action: string,
  identifier: string
): NextResponse | null {
  const config = RATE_LIMIT_CONFIGS[action];
  if (!config) return null;

  const key = `${action}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs });
    return null;
  }

  if (entry.count >= config.maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);
    return NextResponse.json(
      { error: 'Muitas tentativas. Tente novamente mais tarde.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
        },
      }
    );
  }

  entry.count++;
  return null;
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
