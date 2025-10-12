/**
 * Task Orchestrator - Central Coordinator for Parallel Work
 *
 * Responsibilities:
 * - Task queue management
 * - Worker assignment
 * - Conflict detection
 * - Progress tracking
 */
export interface Task {
    id: string;
    type: 'issue' | 'pr' | 'refactor' | 'test' | 'doc';
    priority: 1 | 2 | 3 | 4 | 5;
    dependencies: string[];
    estimatedDuration: number;
    requiredSkills: string[];
    assignedTo?: string;
    status: 'pending' | 'claimed' | 'in_progress' | 'completed' | 'failed';
    metadata: {
        issueNumber?: number;
        branchName?: string;
        files: string[];
        description: string;
    };
    createdAt: Date;
    claimedAt?: Date;
    startedAt?: Date;
    completedAt?: Date;
}
export interface ClaimResult {
    success: boolean;
    task?: Task;
    error?: string;
    conflictingTasks?: Task[];
}
export interface TaskFilter {
    status?: Task['status'];
    type?: Task['type'];
    priority?: Task['priority'];
    workerId?: string;
}
export declare class TaskOrchestrator {
    private tasks;
    private taskQueue;
    /**
     * Load tasks from GitHub Issues
     */
    loadTasksFromIssues(): Promise<Task[]>;
    /**
     * Add a task to the queue
     */
    addTask(task: Task): void;
    /**
     * Get available tasks for a worker
     */
    getAvailableTasks(_workerId: string, workerSkills: string[]): Task[];
    /**
     * Claim a task for a worker
     */
    claimTask(workerId: string, taskId: string): Promise<ClaimResult>;
    /**
     * Start task execution
     */
    startTask(taskId: string): Promise<boolean>;
    /**
     * Complete a task
     */
    completeTask(taskId: string, success: boolean): Promise<void>;
    /**
     * Release a task (unclaim)
     */
    releaseTask(taskId: string): Promise<void>;
    /**
     * Get tasks by filter
     */
    getTasks(filter?: TaskFilter): Task[];
    /**
     * Get task by ID
     */
    getTask(taskId: string): Task | undefined;
    /**
     * Get worker's current tasks
     */
    getWorkerTasks(workerId: string): Task[];
    /**
     * Check if task dependencies are met
     */
    private areDependenciesMet;
    /**
     * Check if worker has required skills
     */
    private hasRequiredSkills;
    /**
     * Detect file conflicts with other tasks
     */
    private detectFileConflicts;
    /**
     * Sort task queue by priority (1 = highest)
     */
    private sortTaskQueue;
    /**
     * Get queue statistics
     */
    getStatistics(): {
        total: number;
        pending: number;
        claimed: number;
        inProgress: number;
        completed: number;
        failed: number;
    };
}
//# sourceMappingURL=task-orchestrator.d.ts.map