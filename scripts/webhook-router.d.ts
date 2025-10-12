#!/usr/bin/env tsx
/**
 * Webhook Event Router
 *
 * Central event bus for GitHub webhooks - routes events to appropriate agents
 * Implements Phase B of Issue #5: GitHub as Operating System
 *
 * Architecture:
 * - Issues → IssueAgent (analysis, labeling, state transitions)
 * - PRs → ReviewAgent + PRAgent (quality checks, merging)
 * - Push → DeploymentAgent (CI/CD triggers)
 * - Comments → CoordinatorAgent (command parsing)
 *
 * Phase B Enhancements:
 * - Webhook signature verification
 * - Error handling and retry mechanism
 * - Rate limiting
 * - Comprehensive logging
 */
type EventType = 'issue' | 'pr' | 'push' | 'comment';
interface EventPayload {
    type: EventType;
    action: string;
    number?: number;
    title?: string;
    body?: string;
    labels?: string[];
    author?: string;
    branch?: string;
    commit?: string;
}
interface RoutingRule {
    condition: (payload: EventPayload) => boolean;
    agent: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    action: string;
}
declare class WebhookEventRouter {
    /**
     * Route incoming event to appropriate agent with retry support
     */
    route(payload: EventPayload): Promise<void>;
    /**
     * Trigger agent execution with exponential backoff retry
     */
    private triggerAgentWithRetry;
    /**
     * Trigger agent execution
     */
    private triggerAgent;
    /**
     * Sleep utility for retry delays
     */
    private sleep;
    /**
     * Create a comment documenting the routing decision
     */
    private createRoutingComment;
    /**
     * Parse command from comment (available for future command parsing)
     */
    private parseCommand;
    /**
     * Expose parseCommand for testing
     */
    testParseCommand(body: string): {
        command: string;
        args: string[];
    } | null;
}
export { WebhookEventRouter };
export type { EventPayload, RoutingRule };
//# sourceMappingURL=webhook-router.d.ts.map