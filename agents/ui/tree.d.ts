/**
 * agents/ui/tree.ts
 *
 * Tree structure formatter for displaying hierarchical data
 * Provides beautiful tree rendering with colors and icons
 */
export interface TreeNode {
    label: string;
    children?: TreeNode[];
    icon?: string;
    color?: string;
    meta?: string;
    status?: 'success' | 'error' | 'warning' | 'info';
}
export interface TreeOptions {
    compact?: boolean;
    showIcons?: boolean;
    useColors?: boolean;
}
/**
 * Render a tree structure
 */
export declare function renderTree(nodes: TreeNode[], options?: TreeOptions): string;
/**
 * Create a file tree from a directory structure
 */
export interface FileNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    size?: number;
}
export declare function renderFileTree(files: FileNode[]): string;
/**
 * Create a dependency tree
 */
export interface Dependency {
    name: string;
    version?: string;
    dependencies?: Dependency[];
}
export declare function renderDependencyTree(deps: Dependency[]): string;
/**
 * Create a task dependency tree (DAG visualization)
 */
export interface TaskNode {
    id: string;
    title: string;
    status: 'pending' | 'running' | 'success' | 'error';
    dependencies?: TaskNode[];
    agent?: string;
    duration?: number;
}
export declare function renderTaskTree(tasks: TaskNode[]): string;
/**
 * Create an agent execution tree
 */
export interface AgentExecution {
    agent: string;
    tasks: {
        name: string;
        status: 'success' | 'error' | 'warning';
        duration: number;
        subtasks?: AgentExecution['tasks'];
    }[];
}
export declare function renderAgentExecutionTree(executions: AgentExecution[]): string;
/**
 * Create a compact execution flow tree
 */
export interface FlowStep {
    name: string;
    status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
    parallel?: FlowStep[];
    sequential?: FlowStep[];
}
export declare function renderFlowTree(flow: FlowStep[]): string;
//# sourceMappingURL=tree.d.ts.map