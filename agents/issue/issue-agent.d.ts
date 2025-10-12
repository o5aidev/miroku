/**
 * IssueAgent - GitHub Issue Analysis & Management Agent
 *
 * Responsibilities:
 * - Analyze GitHub Issues automatically
 * - Determine issue type (feature/bug/refactor/docs/test)
 * - Assess Severity (Sev.1-5)
 * - Assess Impact (Critical/High/Medium/Low)
 * - Apply Organizational (組織設計) theory label system (65 labels)
 * - Assign appropriate team members (via CODEOWNERS)
 * - Extract task dependencies
 *
 * Issue #41: Added retry logic with exponential backoff for all GitHub API calls
 */
import { BaseAgent } from '../base-agent.js';
import { AgentResult, Task } from '../types/index.js';
export declare class IssueAgent extends BaseAgent {
    private octokit;
    private owner;
    private repo;
    constructor(config: any);
    /**
     * Main execution: Analyze Issue and apply labels
     */
    execute(task: Task): Promise<AgentResult>;
    /**
     * Fetch Issue from GitHub (with LRU cache + automatic retry)
     */
    private fetchIssue;
    /**
     * Apply labels to Issue (with automatic retry on transient failures)
     */
    private applyLabels;
    /**
     * Assign team members to Issue (with automatic retry on transient failures)
     */
    private assignTeamMembers;
    /**
     * Add analysis comment to Issue (with automatic retry on transient failures)
     */
    private addAnalysisComment;
    /**
     * Analyze Issue and determine classification
     */
    private analyzeIssue;
    /**
     * Determine issue type from title and body
     */
    private determineIssueType;
    /**
     * Determine Severity (Sev.1-5)
     */
    private determineSeverity;
    /**
     * Determine Impact level
     */
    private determineImpact;
    /**
     * Determine responsibility assignment
     */
    private determineResponsibility;
    /**
     * Determine appropriate Agent
     */
    private determineAgent;
    /**
     * Extract dependency Issue numbers (#123 format)
     */
    private extractDependencies;
    /**
     * Estimate task duration (minutes)
     */
    private estimateDuration;
    /**
     * Build complete label set based on Organizational theory
     */
    private buildLabelSet;
    /**
     * Get emoji for Severity
     */
    private getSeverityEmoji;
    /**
     * Determine assignees from CODEOWNERS or responsibility
     */
    private determineAssignees;
    /**
     * Format analysis comment for GitHub
     */
    private formatAnalysisComment;
    /**
     * Parse repository owner and name from git remote
     */
    private parseRepository;
}
//# sourceMappingURL=issue-agent.d.ts.map