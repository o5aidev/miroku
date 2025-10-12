#!/usr/bin/env tsx
/**
 * Check Agent Status
 *
 * Displays current status of all agents and recent execution history
 *
 * Features:
 * - Agent execution statistics
 * - Current running agents
 * - Recent errors and warnings
 * - Performance metrics
 */
interface AgentStatus {
    name: string;
    status: 'idle' | 'running' | 'error' | 'completed';
    lastExecution?: Date;
    executionCount: number;
    avgDuration: number;
    successRate: number;
    lastError?: string;
}
declare class AgentStatusChecker {
    private api;
    constructor(token: string, owner: string, repo: string, projectNumber: number);
    /**
     * Get status of all agents
     */
    getAgentStatuses(): Promise<AgentStatus[]>;
    /**
     * Display agent statuses in a formatted table
     */
    displayStatus(): Promise<void>;
    /**
     * Get status icon
     */
    private getStatusIcon;
    /**
     * Get status color
     */
    private getStatusColor;
    /**
     * Format duration
     */
    private formatDuration;
    /**
     * Format success rate
     */
    private formatSuccessRate;
    /**
     * Get overall health status
     */
    private getHealthStatus;
    /**
     * Get field value from project item
     */
    private getFieldValue;
}
export default AgentStatusChecker;
//# sourceMappingURL=check-status.d.ts.map