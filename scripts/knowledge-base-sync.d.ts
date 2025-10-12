#!/usr/bin/env tsx
/**
 * Knowledge Base Sync - Phase E
 *
 * Integrates GitHub Discussions as knowledge repository
 * Auto-posts completed work summaries and learnings
 */
export declare class KnowledgeBaseSync {
    private octokit;
    private graphqlWithAuth;
    private owner;
    private repo;
    private repositoryId;
    private categories;
    constructor(token: string, owner: string, repo: string);
    /**
     * Initialize knowledge base (fetch repo ID and categories)
     */
    initialize(): Promise<void>;
    /**
     * Post completed issue summary to Discussions
     */
    postIssueSummary(issueNumber: number): Promise<void>;
    /**
     * Post weekly learnings summary
     */
    postWeeklyLearnings(startDate: Date, endDate: Date): Promise<void>;
    /**
     * Post technical decision record
     */
    postTechnicalDecision(title: string, context: string, decision: string, consequences: string, alternatives: string[], relatedIssues: number[]): Promise<void>;
    private createDiscussion;
    private generateSummary;
    private extractLearnings;
    private extractTags;
    private findRelatedPRs;
    private getCompletedIssues;
}
//# sourceMappingURL=knowledge-base-sync.d.ts.map