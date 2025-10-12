/**
 * GitHub Discussions Integration
 *
 * Maps to OS concept: Message Queue / Forum
 *
 * Features:
 * - Asynchronous communication
 * - Q&A, Ideas, Show & Tell categories
 * - Weekly KPI report announcements
 * - Community engagement
 */
interface DiscussionsConfig {
    owner: string;
    repo: string;
}
interface Discussion {
    id: string;
    number: number;
    title: string;
    body: string;
    url: string;
    category: {
        id: string;
        name: string;
    };
    createdAt: string;
    author: {
        login: string;
    };
}
interface CreateDiscussionInput {
    categoryId: string;
    title: string;
    body: string;
}
export declare class DiscussionsClient {
    private graphqlClient;
    private config;
    private repositoryId?;
    private categories;
    constructor(token: string, config: DiscussionsConfig);
    /**
     * Initialize: Get repository ID and categories
     */
    initialize(): Promise<void>;
    /**
     * Get category ID by name
     */
    getCategoryId(categoryName: string): string;
    /**
     * Create a new discussion
     */
    createDiscussion(input: CreateDiscussionInput): Promise<Discussion>;
    /**
     * Add a comment to a discussion
     */
    addComment(discussionId: string, body: string): Promise<{
        id: string;
        body: string;
        url: string;
    }>;
    /**
     * Search discussions
     */
    searchDiscussions(query: string, first?: number): Promise<Discussion[]>;
    /**
     * Get discussions by category
     */
    getDiscussionsByCategory(categoryName: string, first?: number): Promise<Discussion[]>;
    /**
     * Post weekly KPI report to Announcements
     */
    postWeeklyKPIReport(kpiData: {
        totalIssues: number;
        completedIssues: number;
        avgDuration: number;
        totalCost: number;
        avgQualityScore: number;
    }): Promise<Discussion>;
    /**
     * Create Q&A discussion for Agent questions
     */
    createAgentQuestion(title: string, question: string): Promise<Discussion>;
    /**
     * Share success story in Show & Tell
     */
    shareSuccessStory(title: string, story: string, metrics?: {
        duration: number;
        cost: number;
        qualityScore: number;
    }): Promise<Discussion>;
}
export {};
//# sourceMappingURL=discussions.d.ts.map