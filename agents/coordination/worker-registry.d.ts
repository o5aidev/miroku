/**
 * Worker Registry - Track and manage workers
 *
 * Responsibilities:
 * - Worker registration
 * - Status tracking
 * - Skill matching
 * - Load balancing
 */
export type WorkerType = 'human' | 'ai_agent';
export type WorkerStatus = 'idle' | 'working' | 'offline';
export interface Worker {
    id: string;
    type: WorkerType;
    name: string;
    skills: string[];
    maxConcurrentTasks: number;
    currentTasks: string[];
    status: WorkerStatus;
    lastActivity: Date;
    metadata?: {
        email?: string;
        githubUsername?: string;
        agentModel?: string;
    };
}
export interface RegisterWorkerInput {
    name: string;
    type: WorkerType;
    skills: string[];
    maxConcurrentTasks?: number;
    metadata?: Worker['metadata'];
}
export declare class WorkerRegistry {
    private workers;
    private workerIdCounter;
    /**
     * Register a new worker
     */
    register(input: RegisterWorkerInput): Worker;
    /**
     * Unregister a worker
     */
    unregister(workerId: string): boolean;
    /**
     * Get worker by ID
     */
    getWorker(workerId: string): Worker | undefined;
    /**
     * Get all workers
     */
    getAllWorkers(): Worker[];
    /**
     * Get active workers (not offline)
     */
    getActiveWorkers(): Worker[];
    /**
     * Get idle workers
     */
    getIdleWorkers(): Worker[];
    /**
     * Find best worker for task
     * Scoring algorithm:
     * 1. Skill match quality (more matching skills = better)
     * 2. Current load (fewer tasks = better)
     */
    findBestWorker(requiredSkills: string[]): Worker | null;
    /**
     * Assign task to worker
     */
    assignTask(workerId: string, taskId: string): boolean;
    /**
     * Unassign task from worker
     */
    unassignTask(workerId: string, taskId: string): boolean;
    /**
     * Update worker status
     */
    updateStatus(workerId: string, status: WorkerStatus): boolean;
    /**
     * Send heartbeat (keep-alive)
     */
    heartbeat(workerId: string): boolean;
    /**
     * Check for stale workers (no heartbeat for 10 minutes)
     */
    checkStaleWorkers(): Worker[];
    /**
     * Get workers by skill
     */
    getWorkersBySkill(skill: string): Worker[];
    /**
     * Get registry statistics
     */
    getStatistics(): {
        total: number;
        idle: number;
        working: number;
        offline: number;
        humans: number;
        aiAgents: number;
        totalCapacity: number;
        totalLoad: number;
    };
    /**
     * Generate unique worker ID
     */
    private generateWorkerId;
}
//# sourceMappingURL=worker-registry.d.ts.map