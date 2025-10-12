/**
 * Performance Optimizer - Scalability & Performance Enhancement System
 *
 * Features:
 * - Parallel task execution management
 * - Rate limiting and throttling
 * - Caching layer for API calls
 * - Batch processing for bulk operations
 * - Performance profiling and metrics
 * - Load balancing across agents
 * - Queue management for high-volume tasks
 *
 * Phase I: Issue #5 - Scalability & Performance Optimization
 */
import { Octokit } from '@octokit/rest';
export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
    hits: number;
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    used: number;
}
export interface PerformanceMetrics {
    operationName: string;
    startTime: number;
    endTime: number;
    durationMs: number;
    cacheHit: boolean;
    throttled: boolean;
    timestamp: string;
}
export interface BatchOperation<T, R> {
    id: string;
    items: T[];
    batchSize: number;
    processor: (batch: T[]) => Promise<R[]>;
    delayMs: number;
}
export interface LoadBalancingConfig {
    strategy: 'round-robin' | 'least-loaded' | 'weighted' | 'random';
    agents: string[];
    weights?: Map<string, number>;
}
export interface QueueTask<T> {
    id: string;
    priority: number;
    data: T;
    retries: number;
    maxRetries: number;
    createdAt: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
}
export interface OptimizerConfig {
    cacheTTLMs: number;
    maxCacheSize: number;
    rateLimitBuffer: number;
    batchSize: number;
    batchDelayMs: number;
    maxConcurrency: number;
    queueMaxSize: number;
    metricsEnabled: boolean;
}
export declare class PerformanceOptimizer {
    private config;
    private octokit?;
    private cache;
    private rateLimits;
    private metrics;
    private activeOperations;
    private queue;
    private loadBalancerState;
    constructor(config: OptimizerConfig, octokit?: Octokit | undefined);
    /**
     * Get cached data or execute function and cache result
     */
    withCache<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T>;
    /**
     * Get data from cache
     */
    private getFromCache;
    /**
     * Set data in cache
     */
    private setInCache;
    /**
     * Evict least recently used cache entry
     */
    private evictLRU;
    /**
     * Clear cache
     */
    clearCache(pattern?: string): void;
    /**
     * Start periodic cache cleanup
     */
    private startCacheCleanup;
    /**
     * Execute with rate limiting
     */
    withRateLimit<T>(resource: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Wait if rate limit is exceeded
     */
    private waitForRateLimit;
    /**
     * Update rate limit information from GitHub API
     */
    private updateRateLimit;
    /**
     * Get current rate limit status
     */
    getRateLimitStatus(resource?: string): RateLimitInfo | null;
    /**
     * Process items in batches with rate limiting
     */
    batchProcess<T, R>(operation: BatchOperation<T, R>): Promise<R[]>;
    /**
     * Create batches from items
     */
    private createBatches;
    /**
     * Batch GitHub API operations
     */
    batchGitHubOperations<T>(operations: Array<() => Promise<T>>, batchSize?: number, delayMs?: number): Promise<T[]>;
    /**
     * Execute tasks in parallel with concurrency limit
     */
    parallelExecute<T>(tasks: Array<() => Promise<T>>, concurrency?: number): Promise<T[]>;
    /**
     * Execute with deduplication (prevent duplicate concurrent operations)
     */
    withDeduplication<T>(key: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Select agent using load balancing strategy
     */
    selectAgent(config: LoadBalancingConfig): string;
    /**
     * Round-robin selection
     */
    private roundRobinSelect;
    /**
     * Least-loaded selection
     */
    private leastLoadedSelect;
    /**
     * Weighted random selection
     */
    private weightedSelect;
    /**
     * Random selection
     */
    private randomSelect;
    /**
     * Update agent load
     */
    updateAgentLoad(agent: string, delta: number): void;
    /**
     * Add task to queue
     */
    enqueue<T>(id: string, data: T, priority?: number, maxRetries?: number): void;
    /**
     * Dequeue task
     */
    dequeue<T>(): QueueTask<T> | null;
    /**
     * Complete task
     */
    completeTask(id: string): void;
    /**
     * Fail task and retry if possible
     */
    failTask(id: string): boolean;
    /**
     * Sort queue by priority
     */
    private sortQueue;
    /**
     * Get queue statistics
     */
    getQueueStats(): {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    };
    /**
     * Profile operation execution
     */
    profile<T>(operationName: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Record performance metric
     */
    private recordMetric;
    /**
     * Get performance metrics
     */
    getMetrics(operationName?: string): PerformanceMetrics[];
    /**
     * Get performance summary
     */
    getPerformanceSummary(): Record<string, {
        count: number;
        totalMs: number;
        avgMs: number;
        minMs: number;
        maxMs: number;
        cacheHitRate: number;
    }>;
    /**
     * Clear metrics
     */
    clearMetrics(): void;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        maxSize: number;
        totalHits: number;
        avgHitsPerEntry: number;
    };
    /**
     * Export optimizer state for debugging
     */
    exportState(): {
        cache: {
            size: number;
            entries: {
                key: string;
                hits: number;
                age: number;
                ttl: number;
            }[];
        };
        rateLimits: {
            [k: string]: RateLimitInfo;
        };
        queue: {
            total: number;
            pending: number;
            processing: number;
            completed: number;
            failed: number;
        };
        metrics: Record<string, {
            count: number;
            totalMs: number;
            avgMs: number;
            minMs: number;
            maxMs: number;
            cacheHitRate: number;
        }>;
        loadBalancer: {
            [k: string]: number;
        };
    };
}
/**
 * Create a performance optimizer instance
 */
export declare function createPerformanceOptimizer(config?: Partial<OptimizerConfig>, octokit?: Octokit): PerformanceOptimizer;
//# sourceMappingURL=performance-optimizer.d.ts.map