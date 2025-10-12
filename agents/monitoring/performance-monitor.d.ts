/**
 * Performance Monitor - Agent Performance Tracking & Feedback Loop
 *
 * Tracks:
 * - Tool invocation delays
 * - Agent execution bottlenecks
 * - API call latencies
 * - File I/O operations
 * - Memory usage
 *
 * Provides automatic feedback loop for continuous improvement
 */
export interface ToolInvocationMetrics {
    toolName: string;
    agentType: string;
    startTime: number;
    endTime: number;
    durationMs: number;
    success: boolean;
    error?: string;
    metadata?: Record<string, any>;
}
export interface AgentPerformanceMetrics {
    agentType: string;
    taskId: string;
    startTime: number;
    endTime: number;
    totalDurationMs: number;
    toolInvocations: ToolInvocationMetrics[];
    bottlenecks: PerformanceBottleneck[];
    memoryUsageMb: number;
}
export interface PerformanceBottleneck {
    type: 'tool_invocation' | 'api_call' | 'file_io' | 'computation';
    description: string;
    durationMs: number;
    impact: 'critical' | 'high' | 'medium' | 'low';
    suggestion: string;
}
export interface PerformanceReport {
    timestamp: string;
    agentMetrics: AgentPerformanceMetrics[];
    summary: {
        totalAgents: number;
        totalDurationMs: number;
        averageDurationMs: number;
        slowestAgent: {
            type: string;
            durationMs: number;
        };
        totalBottlenecks: number;
        criticalBottlenecks: number;
    };
    recommendations: string[];
}
/**
 * Singleton Performance Monitor
 */
export declare class PerformanceMonitor {
    private static instance;
    private agentMetrics;
    private reportDirectory;
    private readonly SLOW_TOOL_THRESHOLD_MS;
    private constructor();
    static getInstance(reportDirectory?: string): PerformanceMonitor;
    /**
     * Start tracking an agent's performance
     */
    startAgentTracking(agentType: string, taskId: string): void;
    /**
     * Track a tool invocation
     */
    trackToolInvocation(agentType: string, taskId: string, toolName: string, startTime: number, endTime: number, success: boolean, error?: string, metadata?: Record<string, any>): void;
    /**
     * End agent tracking and calculate final metrics
     */
    endAgentTracking(agentType: string, taskId: string): AgentPerformanceMetrics | null;
    /**
     * Generate performance report for all tracked agents
     */
    generateReport(): PerformanceReport;
    /**
     * Classify tool type for bottleneck categorization
     */
    private classifyToolType;
    /**
     * Determine impact level based on duration
     */
    private determineImpact;
    /**
     * Generate improvement suggestion
     */
    private generateSuggestion;
    /**
     * Generate actionable recommendations
     */
    private generateRecommendations;
    /**
     * Detect sequential API calls that could be parallelized
     */
    private detectSequentialApiCalls;
    /**
     * Save agent metrics to file
     */
    private saveAgentMetrics;
    /**
     * Save performance report
     */
    private saveReport;
    /**
     * Get all report files
     */
    private getReportFiles;
    /**
     * Find agent key by type and task ID
     */
    private findAgentKey;
    /**
     * Ensure directory exists
     */
    private ensureDirectory;
}
/**
 * Convenience function to track tool invocations
 */
export declare function trackToolInvocation<T>(agentType: string, taskId: string, toolName: string, operation: () => Promise<T>): Promise<T>;
//# sourceMappingURL=performance-monitor.d.ts.map