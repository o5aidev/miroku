/**
 * ReviewAgent - Code Quality Assessment Agent
 *
 * Responsibilities:
 * - Static code analysis (ESLint, TypeScript)
 * - Security vulnerability scanning
 * - Quality scoring (0-100, passing threshold: 80)
 * - Review comments generation
 * - Escalation to CISO for critical security issues
 *
 * Scoring System:
 * - Base: 100 points
 * - ESLint error: -20 points each
 * - TypeScript error: -30 points each
 * - Critical security vulnerability: -40 points each
 * - Passing threshold: ≥80 points
 */
import { BaseAgent } from '../base-agent.js';
import { AgentResult, Task } from '../types/index.js';
export declare class ReviewAgent extends BaseAgent {
    constructor(config: any);
    /**
     * Main execution: Review code and assess quality (OPTIMIZED: Parallel Analysis)
     *
     * Performance: 3x faster with parallel execution
     * - Before: 10-20s (ESLint) + 10-20s (TS) + 10-20s (Security) = 30-60s
     * - After: max(10-20s, 10-20s, 10-20s) = 10-20s
     */
    execute(task: Task): Promise<AgentResult>;
    /**
     * Create review request from task
     */
    private createReviewRequest;
    /**
     * Get recently modified TypeScript files
     */
    private getRecentlyModifiedFiles;
    /**
     * Run ESLint on files
     */
    private runESLint;
    /**
     * Run TypeScript type checking
     */
    private runTypeScriptCheck;
    /**
     * Run security vulnerability scan (OPTIMIZED: Parallel sub-scans)
     *
     * Performance: Runs all 3 security scans in parallel
     */
    private runSecurityScan;
    /**
     * Scan for hardcoded secrets
     */
    private scanForSecrets;
    /**
     * Scan for common vulnerabilities
     */
    private scanForVulnerabilities;
    /**
     * Run npm audit for dependency vulnerabilities
     */
    private runNpmAudit;
    /**
     * Calculate overall quality score
     */
    private calculateQualityScore;
    /**
     * Generate review comments for GitHub PR
     */
    private generateReviewComments;
    /**
     * Generate fix suggestion for issue
     */
    private generateSuggestion;
    /**
     * Check if escalation is required
     */
    private checkEscalation;
}
//# sourceMappingURL=review-agent.d.ts.map