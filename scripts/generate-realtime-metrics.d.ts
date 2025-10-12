#!/usr/bin/env tsx
/**
 * Real-time Metrics Generator for Phase G
 *
 * Integrates Projects V2 data with live KPI dashboard
 * Generates JSON data for GitHub Pages dashboard
 */
interface AgentMetrics {
    name: string;
    totalIssues: number;
    completedIssues: number;
    avgDuration: number;
    avgCost: number;
    successRate: number;
    activeIssues: number;
}
interface StateMetrics {
    state: string;
    count: number;
    percentage: number;
    avgTimeInState: number;
}
interface PriorityMetrics {
    priority: string;
    count: number;
    completed: number;
    completionRate: number;
}
interface DashboardData {
    timestamp: string;
    summary: {
        totalIssues: number;
        completedIssues: number;
        inProgressIssues: number;
        completionRate: number;
        avgDuration: number;
        totalCost: number;
        avgQualityScore: number;
    };
    agents: AgentMetrics[];
    states: StateMetrics[];
    priorities: PriorityMetrics[];
    recentActivity: Array<{
        number: number;
        title: string;
        state: string;
        agent: string;
        duration: number | null;
        timestamp: string;
    }>;
    trends: {
        dailyCompletions: Array<{
            date: string;
            count: number;
        }>;
        weeklyVelocity: number;
        burndownRate: number;
    };
}
declare function generateMetrics(): Promise<DashboardData>;
export { generateMetrics };
export type { DashboardData };
//# sourceMappingURL=generate-realtime-metrics.d.ts.map