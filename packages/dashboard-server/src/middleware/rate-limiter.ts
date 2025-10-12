/**
 * Global Rate Limiter
 *
 * IP-based global rate limiting to prevent DoS attacks.
 * Uses sliding window algorithm for accurate rate limiting.
 *
 * Based on: DASHBOARD_SPECIFICATION_V2.md Section 5.1.4
 */

import type { Request, Response, NextFunction } from 'express';

// ============================================================================
// Types
// ============================================================================

interface RateLimitEntry {
  requests: number[];  // Timestamps of requests
  blocked: boolean;
  blockedUntil?: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  reset: number;  // Unix timestamp
  retryAfter?: number;  // seconds
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Default rate limit: 100 requests per minute per IP
 */
export const DEFAULT_RATE_LIMIT = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 100,
};

/**
 * Custom rate limits for specific paths
 */
export const PATH_RATE_LIMITS: Record<string, { windowMs: number; maxRequests: number }> = {
  '/api/refresh': { windowMs: 10 * 1000, maxRequests: 1 },  // 1 req/10sec
  '/api/layout/recalculate': { windowMs: 5 * 1000, maxRequests: 1 },  // 1 req/5sec
  '/api/workflow/trigger': { windowMs: 60 * 1000, maxRequests: 10 },  // 10 req/min
};

// ============================================================================
// In-Memory Storage
// ============================================================================

/**
 * Rate limit storage per IP
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval (remove old entries every 2 minutes)
 */
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
const MAX_ENTRY_AGE_MS = 5 * 60 * 1000;  // 5 minutes

// Start cleanup interval
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((entry, ip) => {
    // Remove expired requests
    entry.requests = entry.requests.filter(
      timestamp => now - timestamp < MAX_ENTRY_AGE_MS
    );

    // Remove entry if no recent requests
    if (entry.requests.length === 0) {
      keysToDelete.push(ip);
    }
  });

  keysToDelete.forEach(key => rateLimitStore.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`[RateLimit] Cleaned up ${keysToDelete.length} IP entries`);
  }
}, CLEANUP_INTERVAL_MS);

// ============================================================================
// Rate Limiting Functions
// ============================================================================

/**
 * Check if IP should be rate limited
 *
 * @param ip - Client IP address
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests in window
 * @returns Rate limit result
 */
export function checkRateLimit(
  ip: string,
  windowMs: number = DEFAULT_RATE_LIMIT.windowMs,
  maxRequests: number = DEFAULT_RATE_LIMIT.maxRequests
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = {
      requests: [],
      blocked: false,
    };
    rateLimitStore.set(ip, entry);
  }

  // Check if currently blocked
  if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
    const retryAfterSec = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.floor(entry.blockedUntil / 1000),
      retryAfter: retryAfterSec,
    };
  }

  // Clear blocked status if expired
  if (entry.blocked && entry.blockedUntil && now >= entry.blockedUntil) {
    entry.blocked = false;
    entry.blockedUntil = undefined;
  }

  // Remove requests outside window (sliding window)
  entry.requests = entry.requests.filter(timestamp => timestamp > windowStart);

  // Check if limit exceeded
  if (entry.requests.length >= maxRequests) {
    // Rate limit exceeded
    const oldestRequest = Math.min(...entry.requests);
    const resetTime = oldestRequest + windowMs;
    const retryAfterSec = Math.ceil((resetTime - now) / 1000);

    // Block for retry period
    entry.blocked = true;
    entry.blockedUntil = resetTime;

    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      reset: Math.floor(resetTime / 1000),
      retryAfter: retryAfterSec,
    };
  }

  // Allowed - add request
  entry.requests.push(now);

  const remaining = maxRequests - entry.requests.length;
  const oldestRequest = entry.requests[0];
  const resetTime = oldestRequest + windowMs;

  return {
    allowed: true,
    limit: maxRequests,
    remaining,
    reset: Math.floor(resetTime / 1000),
  };
}

/**
 * Get client IP from request
 */
function getClientIp(req: Request): string {
  // Check various headers for real IP (behind proxy)
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }

  // Fallback to socket IP
  return req.socket.remoteAddress || 'unknown';
}

// ============================================================================
// Express Middleware
// ============================================================================

/**
 * Global rate limiter middleware
 *
 * Usage:
 * ```typescript
 * app.use('/api', globalRateLimiter);
 * ```
 */
export function globalRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = getClientIp(req);
  const path = req.path;

  // Get rate limit config for path
  const config = PATH_RATE_LIMITS[path] || DEFAULT_RATE_LIMIT;
  const result = checkRateLimit(ip, config.windowMs, config.maxRequests);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', result.reset);

  if (!result.allowed) {
    // Rate limited
    res.setHeader('Retry-After', result.retryAfter!);
    res.status(429).json({
      success: false,
      error: 'Too many requests from this IP',
      message: `Rate limit exceeded. Please retry after ${result.retryAfter} second(s).`,
      retryAfter: result.retryAfter,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    });
    return;
  }

  // Allowed
  next();
}

/**
 * Create custom rate limiter with specific config
 *
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests in window
 * @returns Express middleware
 */
export function createRateLimiter(
  windowMs: number,
  maxRequests: number
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = getClientIp(req);
    const result = checkRateLimit(ip, windowMs, maxRequests);

    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.reset);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter!);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: result.retryAfter,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
      });
      return;
    }

    next();
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear rate limit for specific IP
 */
export function clearRateLimit(ip: string): void {
  rateLimitStore.delete(ip);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  totalIPs: number;
  activeIPs: number;
  blockedIPs: number;
  totalRequests: number;
} {
  let activeCount = 0;
  let blockedCount = 0;
  let totalRequests = 0;
  const now = Date.now();

  rateLimitStore.forEach((entry) => {
    totalRequests += entry.requests.length;

    if (entry.requests.length > 0) {
      activeCount++;
    }

    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      blockedCount++;
    }
  });

  return {
    totalIPs: rateLimitStore.size,
    activeIPs: activeCount,
    blockedIPs: blockedCount,
    totalRequests,
  };
}

/**
 * Get rate limit info for specific IP (for debugging)
 */
export function getRateLimitInfo(ip: string): RateLimitEntry | null {
  return rateLimitStore.get(ip) || null;
}

/**
 * Check if IP is currently blocked
 */
export function isBlocked(ip: string): boolean {
  const entry = rateLimitStore.get(ip);
  if (!entry) return false;

  const now = Date.now();
  return entry.blocked && !!entry.blockedUntil && now < entry.blockedUntil;
}

/**
 * Manually block an IP (for admin purposes)
 *
 * @param ip - IP to block
 * @param durationMs - Block duration in milliseconds
 */
export function blockIP(ip: string, durationMs: number): void {
  const now = Date.now();
  const entry = rateLimitStore.get(ip) || {
    requests: [],
    blocked: false,
  };

  entry.blocked = true;
  entry.blockedUntil = now + durationMs;

  rateLimitStore.set(ip, entry);
  console.log(`[RateLimit] Manually blocked IP ${ip} for ${durationMs}ms`);
}

/**
 * Manually unblock an IP
 */
export function unblockIP(ip: string): void {
  const entry = rateLimitStore.get(ip);
  if (entry) {
    entry.blocked = false;
    entry.blockedUntil = undefined;
    console.log(`[RateLimit] Manually unblocked IP ${ip}`);
  }
}
