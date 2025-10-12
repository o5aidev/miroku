/**
 * agents/ui/box.ts
 *
 * Box formatter for displaying content in bordered boxes
 * Provides various box styles and layouts
 */
export type BoxStyle = 'single' | 'double' | 'round' | 'bold' | 'classic';
export type BoxAlign = 'left' | 'center' | 'right';
export interface BoxOptions {
    title?: string;
    titleAlignment?: BoxAlign;
    padding?: number;
    margin?: number;
    borderStyle?: BoxStyle;
    borderColor?: string;
    backgroundColor?: string;
    dimBorder?: boolean;
    float?: 'left' | 'right' | 'center';
    width?: number;
}
/**
 * Create a bordered box with content
 */
export declare function createBox(content: string, options?: BoxOptions): string;
/**
 * Create a success box
 */
export declare function successBox(content: string, title?: string): string;
/**
 * Create an error box
 */
export declare function errorBox(content: string, title?: string): string;
/**
 * Create a warning box
 */
export declare function warningBox(content: string, title?: string): string;
/**
 * Create an info box
 */
export declare function infoBox(content: string, title?: string): string;
/**
 * Create an agent box
 */
export declare function agentBox(agentName: string, content: string, options?: {
    status?: 'running' | 'success' | 'error';
}): string;
/**
 * Create a code box
 */
export declare function codeBox(code: string, language?: string): string;
/**
 * Create a command box
 */
export declare function commandBox(command: string, description?: string): string;
/**
 * Create a result summary box
 */
export interface ResultSummary {
    success: number;
    warning: number;
    error: number;
    total: number;
    duration?: number;
}
export declare function resultSummaryBox(summary: ResultSummary): string;
/**
 * Create a multi-section box
 */
export interface BoxSection {
    title: string;
    content: string;
    color?: string;
}
export declare function multiSectionBox(sections: BoxSection[], options?: {
    title?: string;
    borderColor?: string;
}): string;
/**
 * Create a task execution box
 */
export interface TaskExecution {
    issueNumber: number;
    title: string;
    agent: string;
    status: 'pending' | 'running' | 'success' | 'error';
    duration?: number;
    error?: string;
}
export declare function taskExecutionBox(task: TaskExecution): string;
//# sourceMappingURL=box.d.ts.map