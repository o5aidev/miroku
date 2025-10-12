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
// ============================================================================
// Performance Optimizer Class
// ============================================================================
export class PerformanceOptimizer {
    config;
    octokit;
    cache = new Map();
    rateLimits = new Map();
    metrics = [];
    activeOperations = new Map();
    queue = [];
    loadBalancerState = new Map();
    constructor(config, octokit) {
        this.config = config;
        this.octokit = octokit;
        this.startCacheCleanup();
    }
    // ============================================================================
    // Caching Layer
    // ============================================================================
    /**
     * Get cached data or execute function and cache result
     */
    async withCache(key, fn, ttlMs) {
        const cached = this.getFromCache(key);
        if (cached) {
            this.recordMetric('cache-hit', true);
            return cached;
        }
        const result = await fn();
        this.setInCache(key, result, ttlMs);
        this.recordMetric('cache-miss', false);
        return result;
    }
    /**
     * Get data from cache
     */
    getFromCache(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        const now = Date.now();
        if (now >= entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }
        entry.hits++;
        return entry.data;
    }
    /**
     * Set data in cache
     */
    setInCache(key, data, ttlMs) {
        const now = Date.now();
        const ttl = ttlMs || this.config.cacheTTLMs;
        // Evict oldest entries if cache is full
        if (this.cache.size >= this.config.maxCacheSize) {
            this.evictLRU();
        }
        this.cache.set(key, {
            data,
            timestamp: now,
            expiresAt: now + ttl,
            hits: 0,
        });
    }
    /**
     * Evict least recently used cache entry
     */
    evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTime) {
                oldestTime = entry.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.cache.delete(oldestKey);
        }
    }
    /**
     * Clear cache
     */
    clearCache(pattern) {
        if (!pattern) {
            this.cache.clear();
            return;
        }
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Start periodic cache cleanup
     */
    startCacheCleanup() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.cache.entries()) {
                if (now >= entry.expiresAt) {
                    this.cache.delete(key);
                }
            }
        }, 60000); // Clean every minute
    }
    // ============================================================================
    // Rate Limiting & Throttling
    // ============================================================================
    /**
     * Execute with rate limiting
     */
    async withRateLimit(resource, fn) {
        await this.waitForRateLimit(resource);
        const result = await fn();
        await this.updateRateLimit(resource);
        return result;
    }
    /**
     * Wait if rate limit is exceeded
     */
    async waitForRateLimit(resource) {
        const limit = this.rateLimits.get(resource);
        if (!limit) {
            return;
        }
        const now = Date.now() / 1000;
        if (limit.remaining <= this.config.rateLimitBuffer) {
            const waitTime = Math.max(0, limit.reset - now);
            if (waitTime > 0) {
                console.log(`[PerformanceOptimizer] Rate limit reached for ${resource}, waiting ${waitTime.toFixed(1)}s...`);
                this.recordMetric('rate-limit-wait', false, true);
                await this.sleep(waitTime * 1000);
            }
        }
    }
    /**
     * Update rate limit information from GitHub API
     */
    async updateRateLimit(resource) {
        if (!this.octokit) {
            return;
        }
        try {
            const { data } = await this.octokit.rateLimit.get();
            const rate = resource === 'core' ? data.resources.core : data.resources.search;
            this.rateLimits.set(resource, {
                limit: rate.limit,
                remaining: rate.remaining,
                reset: rate.reset,
                used: rate.used,
            });
        }
        catch (error) {
            console.error(`[PerformanceOptimizer] Failed to update rate limit:`, error);
        }
    }
    /**
     * Get current rate limit status
     */
    getRateLimitStatus(resource = 'core') {
        return this.rateLimits.get(resource) || null;
    }
    // ============================================================================
    // Batch Processing
    // ============================================================================
    /**
     * Process items in batches with rate limiting
     */
    async batchProcess(operation) {
        const results = [];
        const batches = this.createBatches(operation.items, operation.batchSize);
        console.log(`[PerformanceOptimizer] Processing ${operation.items.length} items in ${batches.length} batches...`);
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const startTime = Date.now();
            try {
                const batchResults = await operation.processor(batch);
                results.push(...batchResults);
                const duration = Date.now() - startTime;
                console.log(`[PerformanceOptimizer] Batch ${i + 1}/${batches.length} completed in ${duration}ms`);
                // Delay between batches to avoid rate limits
                if (i < batches.length - 1 && operation.delayMs > 0) {
                    await this.sleep(operation.delayMs);
                }
            }
            catch (error) {
                console.error(`[PerformanceOptimizer] Batch ${i + 1} failed:`, error);
                throw error;
            }
        }
        return results;
    }
    /**
     * Create batches from items
     */
    createBatches(items, batchSize) {
        const batches = [];
        for (let i = 0; i < items.length; i += batchSize) {
            batches.push(items.slice(i, i + batchSize));
        }
        return batches;
    }
    /**
     * Batch GitHub API operations
     */
    async batchGitHubOperations(operations, batchSize = 10, delayMs = 1000) {
        return this.batchProcess({
            id: `github-batch-${Date.now()}`,
            items: operations,
            batchSize,
            processor: async (batch) => {
                return Promise.all(batch.map(op => op()));
            },
            delayMs,
        });
    }
    // ============================================================================
    // Parallel Execution
    // ============================================================================
    /**
     * Execute tasks in parallel with concurrency limit
     */
    async parallelExecute(tasks, concurrency) {
        const limit = concurrency || this.config.maxConcurrency;
        const results = [];
        const executing = [];
        for (const task of tasks) {
            const promise = task().then(result => {
                results.push(result);
            });
            executing.push(promise);
            if (executing.length >= limit) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }
        await Promise.all(executing);
        return results;
    }
    /**
     * Execute with deduplication (prevent duplicate concurrent operations)
     */
    async withDeduplication(key, fn) {
        const existing = this.activeOperations.get(key);
        if (existing) {
            console.log(`[PerformanceOptimizer] Deduplicating operation: ${key}`);
            return existing;
        }
        const promise = fn();
        this.activeOperations.set(key, promise);
        try {
            const result = await promise;
            return result;
        }
        finally {
            this.activeOperations.delete(key);
        }
    }
    // ============================================================================
    // Load Balancing
    // ============================================================================
    /**
     * Select agent using load balancing strategy
     */
    selectAgent(config) {
        switch (config.strategy) {
            case 'round-robin':
                return this.roundRobinSelect(config.agents);
            case 'least-loaded':
                return this.leastLoadedSelect(config.agents);
            case 'weighted':
                return this.weightedSelect(config.agents, config.weights);
            case 'random':
                return this.randomSelect(config.agents);
            default:
                return config.agents[0];
        }
    }
    /**
     * Round-robin selection
     */
    roundRobinSelect(agents) {
        const key = 'round-robin';
        const current = this.loadBalancerState.get(key) || 0;
        const selected = agents[current % agents.length];
        this.loadBalancerState.set(key, current + 1);
        return selected;
    }
    /**
     * Least-loaded selection
     */
    leastLoadedSelect(agents) {
        let minLoad = Infinity;
        let selected = agents[0];
        for (const agent of agents) {
            const load = this.loadBalancerState.get(agent) || 0;
            if (load < minLoad) {
                minLoad = load;
                selected = agent;
            }
        }
        return selected;
    }
    /**
     * Weighted random selection
     */
    weightedSelect(agents, weights) {
        const totalWeight = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        for (const agent of agents) {
            const weight = weights.get(agent) || 1;
            random -= weight;
            if (random <= 0) {
                return agent;
            }
        }
        return agents[0];
    }
    /**
     * Random selection
     */
    randomSelect(agents) {
        return agents[Math.floor(Math.random() * agents.length)];
    }
    /**
     * Update agent load
     */
    updateAgentLoad(agent, delta) {
        const current = this.loadBalancerState.get(agent) || 0;
        this.loadBalancerState.set(agent, current + delta);
    }
    // ============================================================================
    // Queue Management
    // ============================================================================
    /**
     * Add task to queue
     */
    enqueue(id, data, priority = 5, maxRetries = 3) {
        if (this.queue.length >= this.config.queueMaxSize) {
            throw new Error('Queue is full');
        }
        this.queue.push({
            id,
            priority,
            data,
            retries: 0,
            maxRetries,
            createdAt: Date.now(),
            status: 'pending',
        });
        this.sortQueue();
    }
    /**
     * Dequeue task
     */
    dequeue() {
        const task = this.queue.find(t => t.status === 'pending');
        if (task) {
            task.status = 'processing';
        }
        return task || null;
    }
    /**
     * Complete task
     */
    completeTask(id) {
        const index = this.queue.findIndex(t => t.id === id);
        if (index !== -1) {
            this.queue[index].status = 'completed';
        }
    }
    /**
     * Fail task and retry if possible
     */
    failTask(id) {
        const task = this.queue.find(t => t.id === id);
        if (!task) {
            return false;
        }
        task.retries++;
        if (task.retries >= task.maxRetries) {
            task.status = 'failed';
            return false;
        }
        task.status = 'pending';
        return true;
    }
    /**
     * Sort queue by priority
     */
    sortQueue() {
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.createdAt - b.createdAt;
        });
    }
    /**
     * Get queue statistics
     */
    getQueueStats() {
        return {
            total: this.queue.length,
            pending: this.queue.filter(t => t.status === 'pending').length,
            processing: this.queue.filter(t => t.status === 'processing').length,
            completed: this.queue.filter(t => t.status === 'completed').length,
            failed: this.queue.filter(t => t.status === 'failed').length,
        };
    }
    // ============================================================================
    // Performance Profiling
    // ============================================================================
    /**
     * Profile operation execution
     */
    async profile(operationName, fn) {
        const startTime = Date.now();
        try {
            const result = await fn();
            this.recordMetric(operationName, false, false, startTime);
            return result;
        }
        catch (error) {
            this.recordMetric(operationName, false, false, startTime);
            throw error;
        }
    }
    /**
     * Record performance metric
     */
    recordMetric(operationName, cacheHit, throttled = false, startTime) {
        if (!this.config.metricsEnabled) {
            return;
        }
        const now = Date.now();
        const start = startTime || now;
        this.metrics.push({
            operationName,
            startTime: start,
            endTime: now,
            durationMs: now - start,
            cacheHit,
            throttled,
            timestamp: new Date().toISOString(),
        });
        // Keep only last 1000 metrics
        if (this.metrics.length > 1000) {
            this.metrics = this.metrics.slice(-1000);
        }
    }
    /**
     * Get performance metrics
     */
    getMetrics(operationName) {
        if (operationName) {
            return this.metrics.filter(m => m.operationName === operationName);
        }
        return [...this.metrics];
    }
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const summary = {};
        for (const metric of this.metrics) {
            if (!summary[metric.operationName]) {
                summary[metric.operationName] = {
                    count: 0,
                    totalMs: 0,
                    avgMs: 0,
                    minMs: Infinity,
                    maxMs: 0,
                    cacheHitRate: 0,
                };
            }
            const stats = summary[metric.operationName];
            stats.count++;
            stats.totalMs += metric.durationMs;
            stats.minMs = Math.min(stats.minMs, metric.durationMs);
            stats.maxMs = Math.max(stats.maxMs, metric.durationMs);
            if (metric.cacheHit) {
                stats.cacheHitRate++;
            }
        }
        // Calculate averages and rates
        for (const stats of Object.values(summary)) {
            stats.avgMs = stats.totalMs / stats.count;
            stats.cacheHitRate = (stats.cacheHitRate / stats.count) * 100;
        }
        return summary;
    }
    /**
     * Clear metrics
     */
    clearMetrics() {
        this.metrics = [];
    }
    // ============================================================================
    // Utility Methods
    // ============================================================================
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        let totalHits = 0;
        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
        }
        return {
            size: this.cache.size,
            maxSize: this.config.maxCacheSize,
            totalHits,
            avgHitsPerEntry: this.cache.size > 0 ? totalHits / this.cache.size : 0,
        };
    }
    /**
     * Export optimizer state for debugging
     */
    exportState() {
        return {
            cache: {
                size: this.cache.size,
                entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                    key,
                    hits: entry.hits,
                    age: Date.now() - entry.timestamp,
                    ttl: entry.expiresAt - Date.now(),
                })),
            },
            rateLimits: Object.fromEntries(this.rateLimits),
            queue: this.getQueueStats(),
            metrics: this.getPerformanceSummary(),
            loadBalancer: Object.fromEntries(this.loadBalancerState),
        };
    }
}
// ============================================================================
// Factory Function
// ============================================================================
/**
 * Create a performance optimizer instance
 */
export function createPerformanceOptimizer(config, octokit) {
    const defaultConfig = {
        cacheTTLMs: 5 * 60 * 1000, // 5 minutes
        maxCacheSize: 1000,
        rateLimitBuffer: 100,
        batchSize: 10,
        batchDelayMs: 1000,
        maxConcurrency: 5,
        queueMaxSize: 10000,
        metricsEnabled: true,
    };
    return new PerformanceOptimizer({ ...defaultConfig, ...config }, octokit);
}
//# sourceMappingURL=performance-optimizer.js.map