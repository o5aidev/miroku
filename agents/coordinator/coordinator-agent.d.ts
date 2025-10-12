/**
 * CoordinatorAgent - The Orchestrator of Autonomous Operations
 *
 * Responsibilities:
 * - Task decomposition (Issue → Tasks)
 * - DAG construction (dependency graph)
 * - Topological sorting
 * - Agent assignment
 * - Parallel execution control
 * - Progress monitoring
 *
 * This is the MOST IMPORTANT agent in the hierarchy.
 */
import { BaseAgent } from '../base-agent.js';
import { AgentResult, Task, Issue, DAG, TaskDecomposition } from '../types/index.js';
export declare class CoordinatorAgent extends BaseAgent {
    constructor(config: any);
    /**
     * Main execution: Coordinate full task lifecycle
     */
    execute(task: Task): Promise<AgentResult>;
    /**
     * Decompose GitHub Issue into executable Tasks
     */
    decomposeIssue(issue: Issue): Promise<TaskDecomposition>;
    /**
     * Extract tasks from Issue body
     * Supports formats:
     * - [ ] Task description
     * - 1. Task description
     * - ## Task Title
     */
    private extractTasks;
    /**
     * Create Task from Issue information
     */
    private createTask;
    /**
     * Determine task type from labels or title
     */
    private determineTaskType;
    /**
     * Determine severity from labels
     */
    private determineSeverity;
    /**
     * Determine impact from labels
     */
    private determineImpact;
    /**
     * Assign Agent based on task type
     */
    private assignAgent;
    /**
     * Estimate task duration (minutes)
     */
    private estimateDuration;
    /**
     * Build Directed Acyclic Graph from tasks
     */
    buildDAG(tasks: Task[]): Promise<DAG>;
    /**
     * Topological sort - returns task IDs grouped by execution level
     */
    private topologicalSort;
    /**
     * Detect circular dependencies using DFS
     */
    private detectCycles;
    /**
     * Generate recommendations for task execution
     */
    private generateRecommendations;
    /**
     * Create execution plan
     */
    private createExecutionPlan;
    /**
     * Execute tasks in parallel (respecting DAG levels)
     */
    private executeParallel;
    /**
     * Execute all tasks in a level in parallel (OPTIMIZED: Real agent execution)
     *
     * Performance: Now calls actual specialist agents instead of simulation
     */
    private executeLevelParallel;
    /**
     * Create a specialist agent instance based on agent type
     */
    private createSpecialistAgent;
    /**
     * Log execution progress
     */
    private logProgress;
    /**
     * Save execution report to file
     */
    private saveExecutionReport;
    /**
     * Fetch Issue from GitHub (or local metadata)
     */
    private fetchIssue;
}
//# sourceMappingURL=coordinator-agent.d.ts.map