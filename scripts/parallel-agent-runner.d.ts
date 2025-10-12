/**
 * Parallel Agent Runner - Concurrent Agent Execution System
 *
 * Features:
 * - Concurrent agent execution
 * - Worker pool management
 * - Task distribution strategy
 * - Resource allocation
 * - Failure recovery and retry logic
 * - Auto-scaling based on load
 *
 * Phase I: Issue #5 - Scalability & Performance Optimization
 */
import { AgentConfig, Task, AgentResult, AgentType } from '../agents/types/index.js';
import { Octokit } from '@octokit/rest';
export interface WorkerConfig {
    id: string;
    agentType: AgentType;
    maxConcurrentTasks: number;
    skills: string[];
    priority: number;
    status: 'idle' | 'busy' | 'error' | 'offline';
    currentLoad: number;
}
export interface WorkerPoolConfig {
    minWorkers: number;
    maxWorkers: number;
    autoScale: boolean;
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    workerTimeout: number;
    healthCheckInterval: number;
}
export interface TaskDistributionStrategy {
    type: 'round-robin' | 'least-loaded' | 'skill-based' | 'priority-based';
    rebalanceInterval?: number;
    affinityEnabled?: boolean;
}
export interface ExecutionResult {
    taskId: string;
    workerId: string;
    status: 'success' | 'failed' | 'timeout' | 'cancelled';
    result?: AgentResult;
    error?: string;
    startTime: number;
    endTime: number;
    durationMs: number;
    retries: number;
}
export interface WorkerPoolStats {
    totalWorkers: number;
    activeWorkers: number;
    idleWorkers: number;
    errorWorkers: number;
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    queuedTasks: number;
    avgTaskDuration: number;
    throughput: number;
}
export interface RetryConfig {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
    maxRetryDelay: number;
}
export declare class ParallelAgentRunner {
    private poolConfig;
    private distributionStrategy;
    private retryConfig;
    private workers;
    private taskQueue;
    private runningTasks;
    private results;
    private optimizer;
    private workerTaskCount;
    private healthCheckTimer?;
    constructor(_config: AgentConfig, poolConfig: WorkerPoolConfig, distributionStrategy: TaskDistributionStrategy, retryConfig: RetryConfig, octokit?: Octokit);
    /**
     * Initialize worker pool
     */
    private initializeWorkerPool;
    /**
     * Add a worker to the pool
     */
    private addWorker;
    /**
     * Remove a worker from the pool
     */
    private removeWorker;
    /**
     * Get agent skills based on type
     */
    private getAgentSkills;
    /**
     * Auto-scale worker pool based on load
     */
    private autoScale;
    /**
     * Health check for workers
     */
    private startHealthCheck;
    /**
     * Stop health check
     */
    private stopHealthCheck;
    /**
     * Add task to queue
     */
    addTask(task: Task): void;
    /**
     * Add multiple tasks to queue
     */
    addTasks(tasks: Task[]): void;
    /**
     * Sort task queue by priority
     */
    private sortTaskQueue;
    /**
     * Process tasks from queue
     */
    private processTasks;
    /**
     * Select worker for task based on distribution strategy
     */
    private selectWorker;
    /**
     * Round-robin worker selection
     */
    private selectRoundRobin;
    /**
     * Least-loaded worker selection
     */
    private selectLeastLoaded;
    /**
     * Skill-based worker selection
     */
    private selectBySkills;
    /**
     * Priority-based worker selection
     */
    private selectByPriority;
    /**
     * Get required skills for task
     */
    private getRequiredSkills;
    /**
     * Execute task on worker
     */
    private executeTask;
    /**
     * Execute agent task (placeholder for actual agent execution)
     */
    private executeAgentTask;
    /**
     * Handle task failure with retry logic
     */
    private handleTaskFailure;
    /**
     * Handle task timeout
     */
    private handleTaskTimeout;
    /**
     * Get task retry count
     */
    private getTaskRetries;
    /**
     * Calculate retry delay with exponential backoff
     */
    private calculateRetryDelay;
    /**
     * Get worker pool statistics
     */
    getPoolStats(): WorkerPoolStats;
    /**
     * Get execution results
     */
    getResults(): ExecutionResult[];
    /**
     * Get result for specific task
     */
    getResult(taskId: string): ExecutionResult | undefined;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): Record<string, {
        count: number;
        totalMs: number;
        avgMs: number;
        minMs: number;
        maxMs: number;
        cacheHitRate: number;
    }>;
    /**
     * Export runner state
     */
    exportState(): {
        workers: WorkerConfig[];
        taskQueue: Task[];
        runningTasks: {
            task: Task;
            workerId: string;
            startTime: number;
        }[];
        results: ExecutionResult[];
        poolStats: WorkerPoolStats;
        performanceMetrics: Record<string, {
            count: number;
            totalMs: number;
            avgMs: number;
            minMs: number;
            maxMs: number;
            cacheHitRate: number;
        }>;
        optimizer: {
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
                [k: string]: import("./performance-optimizer.js").RateLimitInfo;
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
    };
    /**
     * Wait for all tasks to complete
     */
    waitForCompletion(timeout?: number): Promise<boolean>;
    /**
     * Shutdown runner
     */
    shutdown(): Promise<void>;
    /**
     * Sleep for specified milliseconds
     */
    private sleep;
}
/**
 * Create a parallel agent runner instance
 */
export declare function createParallelAgentRunner(config: AgentConfig, poolConfig?: Partial<WorkerPoolConfig>, distributionStrategy?: Partial<TaskDistributionStrategy>, retryConfig?: Partial<RetryConfig>, octokit?: Octokit): ParallelAgentRunner;
//# sourceMappingURL=parallel-agent-runner.d.ts.map