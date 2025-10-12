/**
 * Graph Update Debouncer
 *
 * Debounces graph update events to reduce unnecessary WebSocket broadcasts.
 * Aggregates multiple updates within 500ms into a single broadcast.
 *
 * Based on: DASHBOARD_SPECIFICATION_V2.md Section 5.1.2
 */

import type { GraphUpdateEvent } from '../validation/event-validators';

// ============================================================================
// Types
// ============================================================================

interface DebouncedUpdate {
  event: GraphUpdateEvent;
  timestamp: number;
  count: number;  // Number of updates aggregated
}

type BroadcastFunction = (event: GraphUpdateEvent) => void;

// ============================================================================
// Configuration
// ============================================================================

/**
 * Debounce delay in milliseconds
 * Multiple updates within this window will be aggregated
 */
export const DEBOUNCE_DELAY_MS = 500;

// ============================================================================
// Debouncer Class
// ============================================================================

export class GraphDebouncer {
  private pendingUpdate: DebouncedUpdate | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private broadcastFn: BroadcastFunction;
  private delayMs: number;

  // Statistics
  private totalUpdates = 0;
  private totalBroadcasts = 0;
  private lastBroadcastTime = 0;

  /**
   * @param broadcastFn - Function to call when debounced update should be sent
   * @param delayMs - Debounce delay in milliseconds (default: 500ms)
   */
  constructor(broadcastFn: BroadcastFunction, delayMs: number = DEBOUNCE_DELAY_MS) {
    this.broadcastFn = broadcastFn;
    this.delayMs = delayMs;
  }

  /**
   * Schedule a graph update (will be debounced)
   *
   * @param event - Graph update event
   */
  update(event: GraphUpdateEvent): void {
    this.totalUpdates++;

    // Cancel previous timeout if exists
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    // Store/update pending event
    if (this.pendingUpdate) {
      // Merge with pending update
      this.pendingUpdate.event = event;  // Use latest event
      this.pendingUpdate.timestamp = Date.now();
      this.pendingUpdate.count++;
    } else {
      // Create new pending update
      this.pendingUpdate = {
        event,
        timestamp: Date.now(),
        count: 1,
      };
    }

    // Schedule broadcast
    this.timeoutId = setTimeout(() => {
      this.flush();
    }, this.delayMs);
  }

  /**
   * Force immediate broadcast of pending update
   */
  flush(): void {
    if (!this.pendingUpdate) {
      return;
    }

    // Broadcast the update
    try {
      this.broadcastFn(this.pendingUpdate.event);
      this.totalBroadcasts++;
      this.lastBroadcastTime = Date.now();

      console.log(
        `[GraphDebouncer] Broadcast graph update (aggregated ${this.pendingUpdate.count} updates)`
      );
    } catch (error) {
      console.error('[GraphDebouncer] Broadcast error:', error);
    }

    // Clear pending update
    this.pendingUpdate = null;
    this.timeoutId = null;
  }

  /**
   * Cancel any pending update without broadcasting
   */
  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.pendingUpdate = null;
  }

  /**
   * Get debouncer statistics
   */
  getStats(): {
    totalUpdates: number;
    totalBroadcasts: number;
    aggregationRate: number;  // Average updates per broadcast
    lastBroadcastTime: number;
    isPending: boolean;
  } {
    return {
      totalUpdates: this.totalUpdates,
      totalBroadcasts: this.totalBroadcasts,
      aggregationRate:
        this.totalBroadcasts > 0 ? this.totalUpdates / this.totalBroadcasts : 0,
      lastBroadcastTime: this.lastBroadcastTime,
      isPending: this.pendingUpdate !== null,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.totalUpdates = 0;
    this.totalBroadcasts = 0;
    this.lastBroadcastTime = 0;
  }

  /**
   * Check if there's a pending update
   */
  isPending(): boolean {
    return this.pendingUpdate !== null;
  }

  /**
   * Get pending update info (for debugging)
   */
  getPendingUpdate(): DebouncedUpdate | null {
    return this.pendingUpdate;
  }

  /**
   * Change debounce delay
   */
  setDelay(delayMs: number): void {
    this.delayMs = delayMs;
  }

  /**
   * Cleanup (clear timeout)
   */
  destroy(): void {
    this.cancel();
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let defaultDebouncer: GraphDebouncer | null = null;

/**
 * Get or create default debouncer instance
 */
export function getGraphDebouncer(broadcastFn?: BroadcastFunction): GraphDebouncer {
  if (!defaultDebouncer && !broadcastFn) {
    throw new Error('GraphDebouncer: broadcastFn required for first initialization');
  }

  if (!defaultDebouncer) {
    defaultDebouncer = new GraphDebouncer(broadcastFn!);
  }

  return defaultDebouncer;
}

/**
 * Reset default debouncer (useful for testing)
 */
export function resetGraphDebouncer(): void {
  if (defaultDebouncer) {
    defaultDebouncer.destroy();
    defaultDebouncer = null;
  }
}

// ============================================================================
// Express Middleware (Optional)
// ============================================================================

/**
 * Middleware to debounce graph:update events
 *
 * This middleware intercepts graph:update events and debounces them.
 * Note: This should be used BEFORE the event is broadcast.
 *
 * Usage:
 * ```typescript
 * app.post('/api/agent-event', debounceGraphUpdateMiddleware(io), (req, res) => {
 *   // Event already debounced if it's a graph:update
 * });
 * ```
 */
export function debounceGraphUpdateMiddleware(io: any) {
  const debouncer = new GraphDebouncer((event) => {
    io.emit('graph:update', event);
  });

  return (req: any, res: any, next: any) => {
    const event = req.body;

    if (event.eventType === 'graph:update') {
      // Debounce this event
      debouncer.update(event);

      // Respond immediately (actual broadcast happens later)
      res.json({
        success: true,
        message: 'Graph update scheduled',
        debounced: true,
      });
      return;
    }

    // Not a graph:update, continue normally
    next();
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a generic debouncer for any function
 *
 * @param fn - Function to debounce
 * @param delayMs - Debounce delay
 * @returns Debounced function
 */
export function createDebouncer<T extends (...args: any[]) => void>(
  fn: T,
  delayMs: number
): {
  call: (...args: Parameters<T>) => void;
  flush: () => void;
  cancel: () => void;
} {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingArgs: Parameters<T> | null = null;

  return {
    call: (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      pendingArgs = args;

      timeoutId = setTimeout(() => {
        if (pendingArgs) {
          fn(...pendingArgs);
          pendingArgs = null;
        }
        timeoutId = null;
      }, delayMs);
    },

    flush: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (pendingArgs) {
        fn(...pendingArgs);
        pendingArgs = null;
      }
    },

    cancel: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      pendingArgs = null;
    },
  };
}

/**
 * Create a throttle function (limits execution frequency)
 *
 * @param fn - Function to throttle
 * @param limitMs - Minimum time between executions
 * @returns Throttled function
 */
export function createThrottler<T extends (...args: any[]) => void>(
  fn: T,
  limitMs: number
): {
  call: (...args: Parameters<T>) => void;
  reset: () => void;
} {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return {
    call: (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      if (timeSinceLastCall >= limitMs) {
        // Execute immediately
        fn(...args);
        lastCallTime = now;
      } else {
        // Schedule for later
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        const delay = limitMs - timeSinceLastCall;
        timeoutId = setTimeout(() => {
          fn(...args);
          lastCallTime = Date.now();
          timeoutId = null;
        }, delay);
      }
    },

    reset: () => {
      lastCallTime = 0;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    },
  };
}
