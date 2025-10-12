/**
 * agents/ui/table.ts
 *
 * Table formatter for displaying structured data in CLI
 * Provides beautiful table rendering with borders, colors, and alignment
 */
export interface TableColumn {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
    color?: string;
}
export interface TableOptions {
    title?: string;
    columns: TableColumn[];
    data: Record<string, any>[];
    borderColor?: string;
    headerColor?: string;
    compact?: boolean;
}
/**
 * Create a beautifully formatted table
 */
export declare function createTable(options: TableOptions): string;
/**
 * Create a summary table (2-column key-value pairs)
 */
export declare function createSummaryTable(data: Record<string, any>, options?: {
    title?: string;
    keyColor?: string;
    valueColor?: string;
    borderColor?: string;
}): string;
/**
 * Create a status table for agents
 */
export interface AgentStatus {
    name: string;
    status: 'idle' | 'running' | 'success' | 'error';
    task?: string;
    duration?: number;
}
export declare function createAgentStatusTable(agents: AgentStatus[]): string;
/**
 * Create a KPI metrics table
 */
export interface KPIMetric {
    name: string;
    current: number | string;
    target: number | string;
    status: 'good' | 'warning' | 'bad';
}
export declare function createKPITable(metrics: KPIMetric[]): string;
//# sourceMappingURL=table.d.ts.map