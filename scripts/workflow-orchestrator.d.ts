#!/usr/bin/env tsx
/**
 * Workflow Orchestrator - Phase D
 *
 * Coordinates multiple agents for complex multi-step tasks
 * Implements parallel execution and dependency management
 */
interface WorkflowStep {
    name: string;
    agent: string;
    action: string;
    dependsOn?: string[];
    parallel?: boolean;
    timeout?: number;
}
interface Workflow {
    id: string;
    name: string;
    issueNumber: number;
    steps: WorkflowStep[];
    currentStep: number;
    status: 'pending' | 'running' | 'completed' | 'failed';
    startTime?: Date;
    endTime?: Date;
}
export declare class WorkflowOrchestrator {
    private octokit;
    private stateMachine;
    private owner;
    private repo;
    private runningTasks;
    private workflows;
    constructor(token: string, owner: string, repo: string);
    /**
     * Create a new workflow for an issue
     */
    createWorkflow(issueNumber: number, workflowType: string): Promise<Workflow>;
    /**
     * Execute a workflow
     */
    executeWorkflow(workflowId: string): Promise<void>;
    /**
     * Execute parallel workflows for multiple issues
     */
    executeParallel(issueNumbers: number[], workflowType: string): Promise<void>;
    private getFeatureWorkflow;
    private getBugfixWorkflow;
    private getRefactorWorkflow;
    private getDefaultWorkflow;
    private executeStep;
    private triggerAgent;
    private updateStateMachine;
    private waitForDependencies;
    private calculatePriority;
    private getTaskDuration;
    private updateIssueProgress;
    private commentWorkflowPlan;
    private commentWorkflowCompletion;
    private commentWorkflowFailure;
}
export {};
//# sourceMappingURL=workflow-orchestrator.d.ts.map