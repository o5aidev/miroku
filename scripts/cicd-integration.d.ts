#!/usr/bin/env tsx
/**
 * CI/CD Integration - Continuous Integration and Deployment Management
 *
 * Features:
 * - GitHub Actions workflow management
 * - Automated deployment triggers
 * - Build status monitoring
 * - Deployment rollback capabilities
 * - Integration with Firebase/Cloud platforms
 *
 * Phase F: Issue #5 - CI/CD Pipeline Integration
 */
export interface CICDConfig {
    owner: string;
    repo: string;
    githubToken: string;
}
export interface WorkflowRun {
    id: number;
    name: string;
    status: string;
    conclusion: string | null;
    html_url: string;
    created_at: string;
    updated_at: string;
}
export interface DeploymentStatus {
    environment: string;
    state: 'success' | 'failure' | 'pending' | 'in_progress';
    target_url?: string;
    description?: string;
}
/**
 * CI/CD Integration Manager
 */
export declare class CICDIntegration {
    private octokit;
    private config;
    constructor(token: string, owner: string, repo: string);
    /**
     * List all workflow runs
     */
    listWorkflowRuns(limit?: number): Promise<WorkflowRun[]>;
    /**
     * Trigger a workflow dispatch event
     */
    triggerWorkflow(workflowId: string, ref?: string, inputs?: Record<string, any>): Promise<boolean>;
    /**
     * Get workflow run status
     */
    getWorkflowRunStatus(runId: number): Promise<WorkflowRun | null>;
    /**
     * Cancel a workflow run
     */
    cancelWorkflowRun(runId: number): Promise<boolean>;
    /**
     * Create a deployment
     */
    createDeployment(ref: string, environment: string, description?: string): Promise<number | null>;
    /**
     * Update deployment status
     */
    updateDeploymentStatus(deploymentId: number, state: 'success' | 'failure' | 'pending' | 'in_progress', targetUrl?: string, description?: string): Promise<boolean>;
    /**
     * List deployments
     */
    listDeployments(environment?: string, limit?: number): Promise<any[]>;
    /**
     * Get commit status
     */
    getCommitStatus(ref: string): Promise<any>;
    /**
     * Create a commit status
     */
    createCommitStatus(sha: string, state: 'success' | 'failure' | 'pending' | 'error', context: string, description?: string, targetUrl?: string): Promise<boolean>;
    /**
     * Wait for workflow run to complete
     */
    waitForWorkflowCompletion(runId: number, timeoutMs?: number): Promise<WorkflowRun | null>;
    /**
     * Get latest successful deployment
     */
    getLatestSuccessfulDeployment(environment: string): Promise<any | null>;
}
//# sourceMappingURL=cicd-integration.d.ts.map