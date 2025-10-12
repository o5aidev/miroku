#!/usr/bin/env tsx
/**
 * Convert Discussion (Idea) to GitHub Issue
 *
 * Automatically converts feature ideas from GitHub Discussions to trackable Issues
 * Part of Phase C: Message Queue (Discussions) - Issue #5
 *
 * Usage:
 *   convert-idea-to-issue.ts <discussion-number>
 *
 * Features:
 * - Fetches discussion content using GraphQL
 * - Analyzes with Claude AI to extract requirements
 * - Creates structured GitHub Issue
 * - Links back to original discussion
 * - Auto-labels based on content
 */
interface Discussion {
    id: string;
    number: number;
    title: string;
    body: string;
    category: string;
    author: {
        login: string;
    };
    url: string;
    createdAt: string;
}
interface IssueTemplate {
    title: string;
    body: string;
    labels: string[];
    priority: string;
    estimatedEffort: string;
    reasoning: string;
}
declare class IdeaToIssueConverter {
    /**
     * Fetch discussion from GitHub
     */
    fetchDiscussion(discussionNumber: number): Promise<Discussion>;
    /**
     * Analyze discussion and generate issue template with rule-based heuristics
     */
    analyzeAndGenerateIssue(discussion: Discussion): Promise<IssueTemplate>;
    /**
     * Create GitHub Issue from template
     */
    createIssue(discussion: Discussion, template: IssueTemplate): Promise<number>;
    /**
     * Convert discussion to issue (main flow)
     */
    convert(discussionNumber: number): Promise<void>;
}
export { IdeaToIssueConverter };
export type { Discussion, IssueTemplate };
//# sourceMappingURL=convert-idea-to-issue.d.ts.map