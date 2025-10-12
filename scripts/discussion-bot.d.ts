#!/usr/bin/env tsx
/**
 * GitHub Discussions Bot
 *
 * Automated bot for managing GitHub Discussions as a message queue
 * Implements Phase C of Issue #5: Message Queue (Discussions)
 *
 * Features:
 * - Welcome messages for new discussions
 * - FAQ auto-responses
 * - Category suggestions
 * - Idea → Issue conversion
 * - Rich CLI output
 *
 * Categories:
 * - Q&A: Questions and answers
 * - Ideas: Feature proposals
 * - Show & Tell: Showcase achievements
 * - Announcements: Official announcements
 * - General: General discussions
 */
type DiscussionCategory = 'Q&A' | 'Ideas' | 'Show & Tell' | 'Announcements' | 'General';
interface Discussion {
    id: string;
    number: number;
    title: string;
    body: string;
    category: string;
    author: string;
    url: string;
    createdAt: string;
}
interface DiscussionAnalysis {
    category: DiscussionCategory;
    shouldConvertToIssue: boolean;
    isQuestion: boolean;
    suggestedFAQ?: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    reasoning: string;
}
interface BotConfig {
    enableWelcomeMessage: boolean;
    enableFAQ: boolean;
    enableCategorySuggestion: boolean;
    enableIdeaConversion: boolean;
}
declare const FAQ_DATABASE: {
    question: string;
    answer: string;
    keywords: string[];
}[];
declare class DiscussionBot {
    private config;
    constructor(config?: BotConfig);
    /**
     * Process a new discussion
     */
    processDiscussion(discussion: Discussion): Promise<void>;
    /**
     * Analyze discussion with rule-based heuristics
     */
    private analyzeDiscussion;
    /**
     * Send welcome message to new discussion
     */
    private sendWelcomeMessage;
    /**
     * Send FAQ response
     */
    private sendFAQResponse;
    /**
     * Suggest category change
     */
    private suggestCategory;
    /**
     * Convert Idea discussion to GitHub Issue
     */
    private convertToIssue;
    /**
     * Create comment on discussion
     */
    private createComment;
    /**
     * Search FAQ database for matching answer
     */
    searchFAQ(query: string): string | null;
}
export { DiscussionBot, FAQ_DATABASE };
export type { Discussion, DiscussionAnalysis, BotConfig };
//# sourceMappingURL=discussion-bot.d.ts.map