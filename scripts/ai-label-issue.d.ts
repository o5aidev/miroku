#!/usr/bin/env tsx
/**
 * AI-powered Issue labeling using Claude Code integration
 *
 * Analyzes Issue title and body to suggest appropriate labels
 * Uses rule-based heuristics instead of direct Anthropic API calls
 */
interface LabelSuggestion {
    type: string;
    priority: string;
    phase: string;
    agent: string;
    special?: string[];
    reasoning: string;
}
/**
 * Analyze Issue with rule-based heuristics and suggest labels
 *
 * Uses keyword matching instead of direct Anthropic API calls
 */
declare function analyzeIssueWithAI(title: string, body: string, onProgress?: (text: string) => void): Promise<LabelSuggestion>;
/**
 * Apply labels to GitHub Issue
 */
declare function applyLabels(owner: string, repo: string, issueNumber: number, labels: string[]): Promise<void>;
/**
 * Add comment explaining the AI analysis
 */
declare function addAnalysisComment(owner: string, repo: string, issueNumber: number, suggestion: LabelSuggestion): Promise<void>;
export { analyzeIssueWithAI, applyLabels, addAnalysisComment };
//# sourceMappingURL=ai-label-issue.d.ts.map