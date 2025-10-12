/**
 * GitHub Projects V2 Integration
 *
 * Maps to OS concept: Data Persistence Layer (Database)
 *
 * Features:
 * - Task board automation
 * - Custom fields (Agent, Duration, Cost, Quality Score)
 * - Automatic status updates
 * - KPI data collection
 */
interface ProjectV2Config {
    owner: string;
    repo: string;
    projectNumber: number;
}
interface ProjectItem {
    id: string;
    content?: {
        number: number;
        title: string;
        state: string;
    };
    fieldValues?: {
        nodes: Array<{
            field: {
                name: string;
            };
            value?: string | number;
        }>;
    };
}
interface CustomField {
    id: string;
    name: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT';
    options?: Array<{
        id: string;
        name: string;
    }>;
}
export declare class ProjectsV2Client {
    private graphqlClient;
    private config;
    private projectId?;
    constructor(token: string, config: ProjectV2Config);
    /**
     * Initialize: Get project ID
     */
    initialize(): Promise<void>;
    /**
     * Add Issue to Project
     */
    addIssueToProject(issueNodeId: string): Promise<string>;
    /**
     * Get Issue node ID from issue number
     */
    getIssueNodeId(issueNumber: number): Promise<string>;
    /**
     * Get custom fields from project
     */
    getCustomFields(): Promise<CustomField[]>;
    /**
     * Update custom field value
     */
    updateFieldValue(itemId: string, fieldId: string, value: string | number): Promise<void>;
    /**
     * Update status field (special handling for single select)
     */
    updateStatus(itemId: string, status: string): Promise<void>;
    /**
     * Get all project items with their field values
     */
    getProjectItems(): Promise<ProjectItem[]>;
    /**
     * Generate KPI report from project data
     */
    generateKPIReport(): Promise<{
        totalIssues: number;
        completedIssues: number;
        avgDuration: number;
        totalCost: number;
        avgQualityScore: number;
    }>;
}
export {};
//# sourceMappingURL=projects-v2.d.ts.map