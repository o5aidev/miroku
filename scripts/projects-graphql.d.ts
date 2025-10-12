/**
 * GitHub Projects V2 GraphQL Helper
 *
 * Provides utilities for querying and updating Projects V2 via GraphQL API
 * Addresses Issue #5 - Phase A: Data Persistence Layer
 */
interface ProjectField {
    id: string;
    name: string;
    dataType: string;
    options?: {
        id: string;
        name: string;
    }[];
}
interface ProjectItem {
    id: string;
    content: {
        number: number;
        title: string;
        state: string;
    };
    fieldValues: {
        nodes: Array<{
            field: {
                name: string;
            };
            value?: string;
        }>;
    };
}
/**
 * Get Project V2 ID and fields
 */
export declare function getProjectInfo(owner: string, projectNumber: number, token: string): Promise<{
    projectId: string;
    fields: ProjectField[];
}>;
/**
 * Add Issue/PR to Project V2
 */
export declare function addItemToProject(projectId: string, contentId: string, token: string): Promise<string>;
/**
 * Update Project V2 item field value
 */
export declare function updateProjectField(projectId: string, itemId: string, fieldId: string, value: string | number, token: string): Promise<void>;
/**
 * Update single-select field (e.g., Agent, Priority)
 */
export declare function updateSingleSelectField(projectId: string, itemId: string, fieldId: string, optionId: string, token: string): Promise<void>;
/**
 * Get all items in a project with field values
 */
export declare function getProjectItems(owner: string, projectNumber: number, token: string): Promise<ProjectItem[]>;
/**
 * Generate weekly report from project data
 */
export declare function generateWeeklyReport(owner: string, projectNumber: number, token: string): Promise<string>;
export {};
//# sourceMappingURL=projects-graphql.d.ts.map