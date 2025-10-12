/**
 * Throttling Middleware
 *
 * Implements event-specific throttling to prevent excessive requests.
 * Uses in-memory storage for simplicity (can be replaced with Redis).
 *
 * Based on: DASHBOARD_SPECIFICATION_V2.md Section 5.1
 */

import type { Request, Response, NextFunction } from 'express';
import type { EventType } from '../validation/event-validators';

// ============================================================================
// Types
// ============================================================================

interface ThrottleState {
  lastRequestTime: number;
  requestCount: number;
}

interface ThrottleResult {
  allowed: boolean;
  retryAfter?: number;  // seconds
  limit: number;
  remaining: number;
  reset: number;  // Unix timestamp
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Throttle configuration per event type (milliseconds)
 * Based on Section 5.1.3
 */
export const THROTTLE_CONFIG: Record<string, number> = {
  'progress': 1000,              // 1 req/sec per agent
  'graph:update': 2000,          // 1 req/2sec global
  'started': 500,                // 2 req/sec per agent
  'completed': 500,              // 2 req/sec per agent
  'error': 6000,                 // 1 req/6sec per agent (lenient)
  'state:transition': 200,       // 5 req/sec global
  'task:discovered': 6000,       // 1 req/6sec global
  'coordinator:analyzing': 12000,    // 1 req/12sec global
  'coordinator:decomposing': 12000,  // 1 req/12sec global
  'coordinator:assigning': 12000,    // 1 req/12sec global
};

/**
 * Default throttle if event type not in config
 */
const DEFAULT_THROTTLE_MS = 1000;  // 1 req/sec

// ============================================================================
// In-Memory Storage
// ============================================================================

/**
 * Throttle state storage
 * Key format: "eventType:key" where key is agentId or "global"
 */
const throttleState = new Map<string, ThrottleState>();

/**
 * Cleanup interval (remove old entries every 5 minutes)
 */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
const MAX_ENTRY_AGE_MS = 10 * 60 * 1000;  // 10 minutes

// Start cleanup interval
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];

  throttleState.forEach((state, key) => {
    if (now - state.lastRequestTime > MAX_ENTRY_AGE_MS) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => throttleState.delete(key));

  if (keysToDelete.length > 0) {
    console.log(`[Throttle] Cleaned up ${keysToDelete.length} old entries`);
  }
}, CLEANUP_INTERVAL_MS);

// ============================================================================
// Throttle Functions
// ============================================================================

/**
 * Check if request should be throttled
 *
 * @param eventType - Event type to throttle
 * @param key - Unique key (agentId or "global")
 * @returns Throttle result with allowed status
 */
export function checkThrottle(
  eventType: string,
  key: string
): ThrottleResult {
  const throttleMs = THROTTLE_CONFIG[eventType] || DEFAULT_THROTTLE_MS;
  const stateKey = `${eventType}:${key}`;
  const now = Date.now();

  // Get or create state
  let state = throttleState.get(stateKey);
  if (!state) {
    state = {
      lastRequestTime: 0,
      requestCount: 0,
    };
    throttleState.set(stateKey, state);
  }

  // Calculate time since last request
  const timeSinceLastRequest = now - state.lastRequestTime;

  // Check if throttled
  if (timeSinceLastRequest < throttleMs) {
    // Throttled
    const retryAfterMs = throttleMs - timeSinceLastRequest;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    const resetTime = state.lastRequestTime + throttleMs;

    return {
      allowed: false,
      retryAfter: retryAfterSec,
      limit: 1,  // 1 request per throttle period
      remaining: 0,
      reset: Math.floor(resetTime / 1000),
    };
  }

  // Allowed - update state
  state.lastRequestTime = now;
  state.requestCount++;

  return {
    allowed: true,
    limit: 1,
    remaining: 1,
    reset: Math.floor((now + throttleMs) / 1000),
  };
}

/**
 * Progress event throttling (Section 5.1.1)
 * Special case: 1 req/sec per agentId
 */
export function throttleProgress(agentId: string): ThrottleResult {
  return checkThrottle('progress', agentId);
}

/**
 * Clear throttle state for specific key
 */
export function clearThrottle(eventType: string, key: string): void {
  const stateKey = `${eventType}:${key}`;
  throttleState.delete(stateKey);
}

/**
 * Clear all throttle state (useful for testing)
 */
export function clearAllThrottle(): void {
  throttleState.clear();
}

/**
 * Get throttle statistics
 */
export function getThrottleStats(): {
  totalKeys: number;
  activeKeys: number;
  oldestEntry: number | null;
} {
  const now = Date.now();
  let activeCount = 0;
  let oldestTime = Infinity;

  throttleState.forEach((state) => {
    const age = now - state.lastRequestTime;
    if (age < 60000) {  // Active in last minute
      activeCount++;
    }
    oldestTime = Math.min(oldestTime, state.lastRequestTime);
  });

  return {
    totalKeys: throttleState.size,
    activeKeys: activeCount,
    oldestEntry: oldestTime === Infinity ? null : oldestTime,
  };
}

// ============================================================================
// Express Middleware
// ============================================================================

/**
 * Express middleware for throttling dashboard events
 *
 * Usage:
 * ```typescript
 * app.post('/api/agent-event', throttleEventMiddleware, (req, res) => {
 *   // Request is already throttle-checked
 * });
 * ```
 */
export function throttleEventMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const event = req.body;

  // Extract event type
  const eventType = event?.eventType as string;
  if (!eventType) {
    // No event type - skip throttling (will fail validation later)
    next();
    return;
  }

  // Determine throttle key
  let throttleKey = 'global';

  // For agent events, use agentId as key
  if (event.agentId) {
    throttleKey = event.agentId;
  }

  // Check throttle
  const throttleResult = checkThrottle(eventType, throttleKey);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', throttleResult.limit);
  res.setHeader('X-RateLimit-Remaining', throttleResult.remaining);
  res.setHeader('X-RateLimit-Reset', throttleResult.reset);

  if (!throttleResult.allowed) {
    // Throttled - return 429
    res.setHeader('Retry-After', throttleResult.retryAfter!);
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
      message: `Too many ${eventType} events. Please retry after ${throttleResult.retryAfter} second(s).`,
      retryAfter: throttleResult.retryAfter,
      limit: throttleResult.limit,
      remaining: throttleResult.remaining,
      reset: throttleResult.reset,
    });
    return;
  }

  // Allowed - continue
  next();
}

/**
 * Create custom throttle middleware with specific config
 *
 * @param config - Custom throttle configuration
 * @returns Express middleware
 */
export function createThrottleMiddleware(
  config: Partial<typeof THROTTLE_CONFIG>
): (req: Request, res: Response, next: NextFunction) => void {
  // Merge with default config
  const mergedConfig = { ...THROTTLE_CONFIG, ...config };

  return (req: Request, res: Response, next: NextFunction) => {
    const event = req.body;
    const eventType = event?.eventType as string;

    if (!eventType) {
      next();
      return;
    }

    const throttleMs = mergedConfig[eventType] || DEFAULT_THROTTLE_MS;
    const throttleKey = event.agentId || 'global';
    const stateKey = `${eventType}:${throttleKey}`;
    const now = Date.now();

    let state = throttleState.get(stateKey);
    if (!state) {
      state = { lastRequestTime: 0, requestCount: 0 };
      throttleState.set(stateKey, state);
    }

    const timeSinceLastRequest = now - state.lastRequestTime;

    if (timeSinceLastRequest < throttleMs) {
      const retryAfterMs = throttleMs - timeSinceLastRequest;
      const retryAfterSec = Math.ceil(retryAfterMs / 1000);

      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: retryAfterSec,
      });
      return;
    }

    state.lastRequestTime = now;
    state.requestCount++;
    next();
  };
}

// ============================================================================
// Testing Utilities
// ============================================================================

/**
 * Get current throttle state (for debugging/testing)
 */
export function getThrottleState(eventType: string, key: string): ThrottleState | null {
  const stateKey = `${eventType}:${key}`;
  return throttleState.get(stateKey) || null;
}

/**
 * Set throttle state manually (for testing)
 */
export function setThrottleState(
  eventType: string,
  key: string,
  state: ThrottleState
): void {
  const stateKey = `${eventType}:${key}`;
  throttleState.set(stateKey, state);
}
