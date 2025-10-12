/**
 * PRAgent - Pull Request Automation Agent
 *
 * Responsibilities:
 * - Create Pull Requests automatically
 * - Generate PR title and description
 * - Add appropriate labels
 * - Assign reviewers based on CODEOWNERS
 * - Link related Issues
 * - Create as Draft PR by default
 * - Follow Conventional Commits style
 *
 * Issue #41: Added retry logic with exponential backoff for all GitHub API calls
 */
import { BaseAgent } from '../base-agent.js';
import { AgentResult, Task } from '../types/index.js';
export declare class PRAgent extends BaseAgent {
    private octokit;
    private owner;
    private repo;
    constructor(config: any);
    /**
     * Main execution: Create Pull Request
     */
    execute(task: Task): Promise<AgentResult>;
    /**
     * Create PR request from task metadata
     */
    private createPRRequest;
    /**
     * Get current git branch
     */
    private getCurrentBranch;
    /**
     * Determine reviewers based on changed files and CODEOWNERS
     */
    private determineReviewers;
    /**
     * Generate PR title following Conventional Commits
     */
    private generateTitle;
    /**
     * Determine scope from changed files
     */
    private determineScope;
    /**
     * Generate comprehensive PR description
     */
    private generateDescription;
    /**
     * Get summary of changes from git diff
     */
    private getChangeSummary;
    /**
     * Get test results
     */
    private getTestResults;
    /**
     * Create Pull Request on GitHub (with automatic retry on transient failures)
     */
    private createPullRequest;
    /**
     * Add labels to PR (with automatic retry on transient failures)
     */
    private addLabels;
    /**
     * Request reviewers for PR (with automatic retry on transient failures)
     */
    private requestReviewers;
    /**
     * Parse repository owner and name from git remote
     */
    private parseRepository;
}
//# sourceMappingURL=pr-agent.d.ts.map