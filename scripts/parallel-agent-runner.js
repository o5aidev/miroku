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
import { createPerformanceOptimizer } from './performance-optimizer.js';
// ============================================================================
// Parallel Agent Runner Class
// ============================================================================
export class ParallelAgentRunner {
    poolConfig;
    distributionStrategy;
    retryConfig;
    workers = new Map();
    taskQueue = [];
    runningTasks = new Map();
    results = new Map();
    optimizer;
    workerTaskCount = new Map();
    healthCheckTimer;
    constructor(_config, poolConfig, distributionStrategy, retryConfig, octokit) {
        this.poolConfig = poolConfig;
        this.distributionStrategy = distributionStrategy;
        this.retryConfig = retryConfig;
        this.optimizer = createPerformanceOptimizer({
            maxConcurrency: poolConfig.maxWorkers,
            metricsEnabled: true,
        }, octokit);
        this.initializeWorkerPool();
        this.startHealthCheck();
    }
    // ============================================================================
    // Worker Pool Management
    // ============================================================================
    /**
     * Initialize worker pool
     */
    initializeWorkerPool() {
        console.log(`[ParallelAgentRunner] Initializing worker pool with ${this.poolConfig.minWorkers} workers...`);
        for (let i = 0; i < this.poolConfig.minWorkers; i++) {
            this.addWorker();
        }
    }
    /**
     * Add a worker to the pool
     */
    addWorker(agentType) {
        const workerId = `worker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const type = agentType || 'CodeGenAgent';
        const worker = {
            id: workerId,
            agentType: type,
            maxConcurrentTasks: 3,
            skills: this.getAgentSkills(type),
            priority: 1,
            status: 'idle',
            currentLoad: 0,
        };
        this.workers.set(workerId, worker);
        this.workerTaskCount.set(workerId, 0);
        console.log(`[ParallelAgentRunner] Worker ${workerId} (${type}) added to pool`);
        return workerId;
    }
    /**
     * Remove a worker from the pool
     */
    removeWorker(workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) {
            return;
        }
        if (worker.status === 'busy') {
            console.warn(`[ParallelAgentRunner] Cannot remove busy worker ${workerId}`);
            return;
        }
        this.workers.delete(workerId);
        this.workerTaskCount.delete(workerId);
        this.optimizer.updateAgentLoad(workerId, -worker.currentLoad);
        console.log(`[ParallelAgentRunner] Worker ${workerId} removed from pool`);
    }
    /**
     * Get agent skills based on type
     */
    getAgentSkills(agentType) {
        const skillMap = {
            'CoordinatorAgent': ['coordination', 'planning', 'task-management'],
            'CodeGenAgent': ['coding', 'typescript', 'javascript', 'implementation'],
            'ReviewAgent': ['code-review', 'quality-assurance', 'testing'],
            'IssueAgent': ['issue-triage', 'analysis', 'documentation'],
            'PRAgent': ['pr-management', 'git', 'collaboration'],
            'DeploymentAgent': ['deployment', 'devops', 'monitoring'],
            'AutoFixAgent': ['debugging', 'fixing', 'testing'],
        };
        return skillMap[agentType] || [];
    }
    /**
     * Auto-scale worker pool based on load
     */
    autoScale() {
        if (!this.poolConfig.autoScale) {
            return;
        }
        const stats = this.getPoolStats();
        const loadRatio = stats.activeWorkers / stats.totalWorkers;
        // Scale up if load is high
        if (loadRatio >= this.poolConfig.scaleUpThreshold && stats.totalWorkers < this.poolConfig.maxWorkers) {
            const workersToAdd = Math.min(Math.ceil(stats.totalWorkers * 0.5), this.poolConfig.maxWorkers - stats.totalWorkers);
            console.log(`[ParallelAgentRunner] Scaling up: adding ${workersToAdd} workers (load: ${(loadRatio * 100).toFixed(1)}%)`);
            for (let i = 0; i < workersToAdd; i++) {
                this.addWorker();
            }
        }
        // Scale down if load is low
        if (loadRatio <= this.poolConfig.scaleDownThreshold && stats.totalWorkers > this.poolConfig.minWorkers) {
            const workersToRemove = Math.min(Math.ceil((stats.totalWorkers - stats.activeWorkers) * 0.5), stats.totalWorkers - this.poolConfig.minWorkers);
            console.log(`[ParallelAgentRunner] Scaling down: removing ${workersToRemove} workers (load: ${(loadRatio * 100).toFixed(1)}%)`);
            const idleWorkers = Array.from(this.workers.values())
                .filter(w => w.status === 'idle')
                .slice(0, workersToRemove);
            for (const worker of idleWorkers) {
                this.removeWorker(worker.id);
            }
        }
    }
    /**
     * Health check for workers
     */
    startHealthCheck() {
        this.healthCheckTimer = setInterval(() => {
            for (const [workerId, worker] of this.workers.entries()) {
                // Check for stuck tasks
                for (const [taskId, running] of this.runningTasks.entries()) {
                    if (running.workerId === workerId) {
                        const elapsed = Date.now() - running.startTime;
                        if (elapsed > this.poolConfig.workerTimeout) {
                            console.error(`[ParallelAgentRunner] Task ${taskId} on worker ${workerId} timed out`);
                            this.handleTaskTimeout(taskId, workerId);
                        }
                    }
                }
                // Reset error workers after cooldown
                if (worker.status === 'error') {
                    worker.status = 'idle';
                    console.log(`[ParallelAgentRunner] Worker ${workerId} recovered from error state`);
                }
            }
            // Auto-scale check
            this.autoScale();
        }, this.poolConfig.healthCheckInterval);
    }
    /**
     * Stop health check
     */
    stopHealthCheck() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
    }
    // ============================================================================
    // Task Distribution
    // ============================================================================
    /**
     * Add task to queue
     */
    addTask(task) {
        this.taskQueue.push(task);
        this.sortTaskQueue();
        this.optimizer.enqueue(task.id, task, task.priority);
        console.log(`[ParallelAgentRunner] Task ${task.id} added to queue (priority: ${task.priority})`);
        this.processTasks();
    }
    /**
     * Add multiple tasks to queue
     */
    addTasks(tasks) {
        for (const task of tasks) {
            this.taskQueue.push(task);
            this.optimizer.enqueue(task.id, task, task.priority);
        }
        this.sortTaskQueue();
        console.log(`[ParallelAgentRunner] ${tasks.length} tasks added to queue`);
        this.processTasks();
    }
    /**
     * Sort task queue by priority
     */
    sortTaskQueue() {
        this.taskQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return (a.startTime || 0) - (b.startTime || 0);
        });
    }
    /**
     * Process tasks from queue
     */
    async processTasks() {
        while (this.taskQueue.length > 0) {
            const task = this.taskQueue[0];
            const worker = this.selectWorker(task);
            if (!worker) {
                // No available workers, wait
                break;
            }
            // Remove from queue and assign to worker
            this.taskQueue.shift();
            await this.executeTask(task, worker.id);
        }
    }
    /**
     * Select worker for task based on distribution strategy
     */
    selectWorker(task) {
        const availableWorkers = Array.from(this.workers.values())
            .filter(w => w.status === 'idle' && w.currentLoad < w.maxConcurrentTasks);
        if (availableWorkers.length === 0) {
            return null;
        }
        switch (this.distributionStrategy.type) {
            case 'round-robin':
                return this.selectRoundRobin(availableWorkers);
            case 'least-loaded':
                return this.selectLeastLoaded(availableWorkers);
            case 'skill-based':
                return this.selectBySkills(availableWorkers, task);
            case 'priority-based':
                return this.selectByPriority(availableWorkers);
            default:
                return availableWorkers[0];
        }
    }
    /**
     * Round-robin worker selection
     */
    selectRoundRobin(workers) {
        return this.optimizer.selectAgent({
            strategy: 'round-robin',
            agents: workers.map(w => w.id),
        }) ? workers[0] : workers[0];
    }
    /**
     * Least-loaded worker selection
     */
    selectLeastLoaded(workers) {
        return workers.reduce((min, worker) => worker.currentLoad < min.currentLoad ? worker : min);
    }
    /**
     * Skill-based worker selection
     */
    selectBySkills(workers, task) {
        const requiredSkills = this.getRequiredSkills(task);
        const matchingWorkers = workers.filter(w => requiredSkills.every(skill => w.skills.includes(skill)));
        return matchingWorkers.length > 0
            ? this.selectLeastLoaded(matchingWorkers)
            : this.selectLeastLoaded(workers);
    }
    /**
     * Priority-based worker selection
     */
    selectByPriority(workers) {
        return workers.reduce((max, worker) => worker.priority > max.priority ? worker : max);
    }
    /**
     * Get required skills for task
     */
    getRequiredSkills(task) {
        const skillMap = {
            'feature': ['coding', 'implementation'],
            'bug': ['debugging', 'fixing'],
            'refactor': ['coding', 'refactoring'],
            'docs': ['documentation'],
            'test': ['testing', 'quality-assurance'],
            'deployment': ['deployment', 'devops'],
        };
        return skillMap[task.type] || [];
    }
    // ============================================================================
    // Task Execution
    // ============================================================================
    /**
     * Execute task on worker
     */
    async executeTask(task, workerId) {
        const worker = this.workers.get(workerId);
        if (!worker) {
            console.error(`[ParallelAgentRunner] Worker ${workerId} not found`);
            return;
        }
        // Update worker status
        worker.status = 'busy';
        worker.currentLoad++;
        this.optimizer.updateAgentLoad(workerId, 1);
        // Track running task
        const startTime = Date.now();
        this.runningTasks.set(task.id, { task, workerId, startTime });
        console.log(`[ParallelAgentRunner] Executing task ${task.id} on worker ${workerId}`);
        try {
            // Execute with performance profiling
            const result = await this.optimizer.profile(`task-${task.type}`, () => this.executeAgentTask(task, worker));
            const endTime = Date.now();
            // Record successful result
            this.results.set(task.id, {
                taskId: task.id,
                workerId,
                status: 'success',
                result,
                startTime,
                endTime,
                durationMs: endTime - startTime,
                retries: 0,
            });
            console.log(`[ParallelAgentRunner] Task ${task.id} completed successfully in ${endTime - startTime}ms`);
            this.optimizer.completeTask(task.id);
        }
        catch (error) {
            console.error(`[ParallelAgentRunner] Task ${task.id} failed:`, error);
            await this.handleTaskFailure(task, workerId, error);
        }
        finally {
            // Update worker status
            worker.currentLoad--;
            worker.status = worker.currentLoad > 0 ? 'busy' : 'idle';
            this.optimizer.updateAgentLoad(workerId, -1);
            // Remove from running tasks
            this.runningTasks.delete(task.id);
            // Process next tasks
            this.processTasks();
        }
    }
    /**
     * Execute agent task (placeholder for actual agent execution)
     */
    async executeAgentTask(task, worker) {
        // TODO: Integrate with actual agent execution
        // For now, simulate execution
        await this.sleep(Math.random() * 1000 + 500);
        return {
            status: 'success',
            data: {
                taskId: task.id,
                agentType: worker.agentType,
            },
            metrics: {
                taskId: task.id,
                agentType: worker.agentType,
                durationMs: 0,
                timestamp: new Date().toISOString(),
            },
        };
    }
    // ============================================================================
    // Failure Recovery & Retry Logic
    // ============================================================================
    /**
     * Handle task failure with retry logic
     */
    async handleTaskFailure(task, workerId, error) {
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.status = 'error';
        }
        // Check if task should be retried
        const retries = this.getTaskRetries(task.id);
        if (retries < this.retryConfig.maxRetries) {
            const delay = this.calculateRetryDelay(retries);
            console.log(`[ParallelAgentRunner] Retrying task ${task.id} in ${delay}ms (attempt ${retries + 1}/${this.retryConfig.maxRetries})`);
            await this.sleep(delay);
            // Add back to queue with retry count
            task.metadata = task.metadata || {};
            task.metadata.retries = retries + 1;
            this.taskQueue.unshift(task);
            this.optimizer.failTask(task.id);
            this.processTasks();
        }
        else {
            console.error(`[ParallelAgentRunner] Task ${task.id} failed after ${this.retryConfig.maxRetries} retries`);
            const endTime = Date.now();
            const running = this.runningTasks.get(task.id);
            this.results.set(task.id, {
                taskId: task.id,
                workerId,
                status: 'failed',
                error: error.message,
                startTime: running?.startTime || Date.now(),
                endTime,
                durationMs: running ? endTime - running.startTime : 0,
                retries,
            });
        }
    }
    /**
     * Handle task timeout
     */
    async handleTaskTimeout(taskId, workerId) {
        const running = this.runningTasks.get(taskId);
        if (!running) {
            return;
        }
        console.error(`[ParallelAgentRunner] Task ${taskId} timed out on worker ${workerId}`);
        const endTime = Date.now();
        this.results.set(taskId, {
            taskId,
            workerId,
            status: 'timeout',
            error: 'Task execution timeout',
            startTime: running.startTime,
            endTime,
            durationMs: endTime - running.startTime,
            retries: this.getTaskRetries(taskId),
        });
        // Remove from running tasks
        this.runningTasks.delete(taskId);
        // Reset worker
        const worker = this.workers.get(workerId);
        if (worker) {
            worker.currentLoad--;
            worker.status = 'error';
            this.optimizer.updateAgentLoad(workerId, -1);
        }
        // Retry task
        await this.handleTaskFailure(running.task, workerId, new Error('Task timeout'));
    }
    /**
     * Get task retry count
     */
    getTaskRetries(taskId) {
        const result = this.results.get(taskId);
        if (result) {
            return result.retries;
        }
        // Check task metadata
        for (const task of this.taskQueue) {
            if (task.id === taskId && task.metadata?.retries) {
                return task.metadata.retries;
            }
        }
        return 0;
    }
    /**
     * Calculate retry delay with exponential backoff
     */
    calculateRetryDelay(retries) {
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, retries);
        return Math.min(delay, this.retryConfig.maxRetryDelay);
    }
    // ============================================================================
    // Status & Statistics
    // ============================================================================
    /**
     * Get worker pool statistics
     */
    getPoolStats() {
        const workers = Array.from(this.workers.values());
        const results = Array.from(this.results.values());
        const completed = results.filter(r => r.status === 'success');
        const failed = results.filter(r => r.status === 'failed' || r.status === 'timeout');
        const avgDuration = completed.length > 0
            ? completed.reduce((sum, r) => sum + r.durationMs, 0) / completed.length
            : 0;
        return {
            totalWorkers: workers.length,
            activeWorkers: workers.filter(w => w.status === 'busy').length,
            idleWorkers: workers.filter(w => w.status === 'idle').length,
            errorWorkers: workers.filter(w => w.status === 'error').length,
            totalTasks: results.length + this.taskQueue.length + this.runningTasks.size,
            completedTasks: completed.length,
            failedTasks: failed.length,
            queuedTasks: this.taskQueue.length,
            avgTaskDuration: avgDuration,
            throughput: completed.length,
        };
    }
    /**
     * Get execution results
     */
    getResults() {
        return Array.from(this.results.values());
    }
    /**
     * Get result for specific task
     */
    getResult(taskId) {
        return this.results.get(taskId);
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return this.optimizer.getPerformanceSummary();
    }
    /**
     * Export runner state
     */
    exportState() {
        return {
            workers: Array.from(this.workers.values()),
            taskQueue: this.taskQueue,
            runningTasks: Array.from(this.runningTasks.values()),
            results: Array.from(this.results.values()),
            poolStats: this.getPoolStats(),
            performanceMetrics: this.getPerformanceMetrics(),
            optimizer: this.optimizer.exportState(),
        };
    }
    // ============================================================================
    // Control Methods
    // ============================================================================
    /**
     * Wait for all tasks to complete
     */
    async waitForCompletion(timeout) {
        const startTime = Date.now();
        const maxTime = timeout || Infinity;
        while (this.taskQueue.length > 0 || this.runningTasks.size > 0) {
            if (Date.now() - startTime > maxTime) {
                return false;
            }
            await this.sleep(100);
        }
        return true;
    }
    /**
     * Shutdown runner
     */
    async shutdown() {
        console.log('[ParallelAgentRunner] Shutting down...');
        this.stopHealthCheck();
        // Wait for running tasks to complete
        await this.waitForCompletion(30000);
        // Clear workers
        this.workers.clear();
        this.workerTaskCount.clear();
        console.log('[ParallelAgentRunner] Shutdown complete');
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
}
// ============================================================================
// Factory Function
// ============================================================================
/**
 * Create a parallel agent runner instance
 */
export function createParallelAgentRunner(config, poolConfig, distributionStrategy, retryConfig, octokit) {
    const defaultPoolConfig = {
        minWorkers: 2,
        maxWorkers: 10,
        autoScale: true,
        scaleUpThreshold: 0.8,
        scaleDownThreshold: 0.3,
        workerTimeout: 5 * 60 * 1000, // 5 minutes
        healthCheckInterval: 30 * 1000, // 30 seconds
    };
    const defaultDistributionStrategy = {
        type: 'least-loaded',
        rebalanceInterval: 60000,
        affinityEnabled: true,
    };
    const defaultRetryConfig = {
        maxRetries: 3,
        retryDelay: 1000,
        backoffMultiplier: 2,
        maxRetryDelay: 30000,
    };
    return new ParallelAgentRunner(config, { ...defaultPoolConfig, ...poolConfig }, { ...defaultDistributionStrategy, ...distributionStrategy }, { ...defaultRetryConfig, ...retryConfig }, octokit);
}
//# sourceMappingURL=parallel-agent-runner.js.map