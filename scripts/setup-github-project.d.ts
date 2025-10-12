#!/usr/bin/env tsx
/**
 * GitHub Project V2 Setup Script
 *
 * Creates a new GitHub Project V2 with custom fields for Agentic OS
 * - Agent (Single Select)
 * - Duration (Number)
 * - Cost (Number)
 * - Quality Score (Number)
 * - Sprint (Iteration)
 *
 * Issue #5 Phase A: Data Persistence Layer
 */
interface ProjectSetupConfig {
    owner: string;
    title: string;
    description: string;
}
interface CustomFieldConfig {
    name: string;
    dataType: 'TEXT' | 'NUMBER' | 'DATE' | 'SINGLE_SELECT' | 'ITERATION';
    options?: string[];
}
export declare class GitHubProjectSetup {
    private graphqlClient;
    constructor(token: string);
    /**
     * Create a new GitHub Project V2
     */
    createProject(config: ProjectSetupConfig): Promise<string>;
    /**
     * Add custom field to project
     */
    addCustomField(projectId: string, field: CustomFieldConfig): Promise<string>;
    /**
     * Setup complete project with all custom fields
     */
    setupCompleteProject(owner: string, projectTitle: string): Promise<{
        projectId: string;
        projectNumber: number;
    }>;
    /**
     * Get project number from project ID
     */
    private getProjectNumber;
    /**
     * Get color for single select option
     */
    private getColorForOption;
    /**
     * Sleep utility
     */
    private sleep;
}
export default GitHubProjectSetup;
//# sourceMappingURL=setup-github-project.d.ts.map