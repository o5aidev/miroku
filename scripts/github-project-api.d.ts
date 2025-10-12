#!/usr/bin/env tsx
/**
 * GitHub Projects V2 API Integration
 *
 * Provides functions to interact with GitHub Projects V2 (GraphQL API)
 * - Query project data
 * - Set custom fields
 * - Fetch project items
 * - Generate reports
 *
 * Issue #5 Phase A: Data Persistence Layer
 */
export interface ProjectConfig {
    owner: string;
    repo: string;
    projectNumber: number;
}
export interface CustomField {
    id: string;
    name: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION';
    options?: Array<{
        id: string;
        name: string;
    }>;
}
export interface ProjectItem {
    id: string;
    content: {
        id: string;
        number: number;
        title: string;
        url: string;
        state: string;
    };
    fieldValues: {
        nodes: Array<{
            field: {
                name: string;
            };
            name?: string;
            number?: number;
            date?: string;
        }>;
    };
}
export interface AgentMetrics {
    agent: string;
    executionCount: number;
    avgDuration: number;
    avgCost: number;
    avgQualityScore: number;
    totalCost: number;
}
export interface WeeklyReport {
    week: string;
    totalIssues: number;
    completedIssues: number;
    agentMetrics: AgentMetrics[];
    topQualityIssues: Array<{
        number: number;
        title: string;
        score: number;
    }>;
    totalCost: number;
}
export declare class GitHubProjectAPI {
    private graphqlClient;
    private config;
    constructor(token: string, config: ProjectConfig);
    /**
     * Get Project ID and custom field definitions
     */
    getProjectInfo(): Promise<{
        projectId: string;
        fields: CustomField[];
    }>;
    /**
     * Get all items in the project
     */
    getProjectItems(): Promise<ProjectItem[]>;
    /**
     * Set custom field value for a project item
     */
    setCustomField(itemId: string, fieldId: string, value: string | number): Promise<void>;
    /**
     * Set single select field value
     */
    setSingleSelectField(itemId: string, fieldId: string, optionId: string): Promise<void>;
    /**
     * Calculate agent metrics from project items
     */
    calculateAgentMetrics(): Promise<AgentMetrics[]>;
    /**
     * Generate weekly report
     */
    generateWeeklyReport(): Promise<WeeklyReport>;
    private getFieldValue;
}
export default GitHubProjectAPI;
//# sourceMappingURL=github-project-api.d.ts.map