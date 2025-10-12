/**
 * agents/ui/progress.ts
 *
 * Progress indicators for long-running operations
 * Provides progress bars, spinners, and multi-step tracking
 */
import { Ora } from 'ora';
export interface ProgressBarOptions {
    total: number;
    current: number;
    width?: number;
    showPercentage?: boolean;
    showCount?: boolean;
    label?: string;
    color?: string;
}
/**
 * Create a progress bar
 */
export declare function createProgressBar(options: ProgressBarOptions): string;
/**
 * Multi-step progress tracker
 */
export interface Step {
    id: string;
    label: string;
    status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
    duration?: number;
}
export declare class MultiStepProgress {
    private steps;
    constructor(steps: Omit<Step, 'status'>[]);
    /**
     * Start a specific step
     */
    startStep(stepId: string): void;
    /**
     * Complete current step with success
     */
    completeStep(stepId: string, duration?: number): void;
    /**
     * Fail current step
     */
    failStep(stepId: string): void;
    /**
     * Skip a step
     */
    skipStep(stepId: string): void;
    /**
     * Render the progress
     */
    render(): string;
    /**
     * Get step icon based on status
     */
    private getStepIcon;
    /**
     * Get overall summary
     */
    getSummary(): {
        total: number;
        completed: number;
        failed: number;
        skipped: number;
        pending: number;
    };
}
/**
 * Spinner manager
 */
export declare class SpinnerManager {
    private spinner;
    private stack;
    /**
     * Start a spinner with text
     */
    start(text: string, spinnerType?: string): Ora;
    /**
     * Update spinner text
     */
    update(text: string): void;
    /**
     * Complete spinner with success
     */
    succeed(text?: string): void;
    /**
     * Complete spinner with failure
     */
    fail(text?: string): void;
    /**
     * Complete spinner with warning
     */
    warn(text?: string): void;
    /**
     * Complete spinner with info
     */
    info(text?: string): void;
    /**
     * Stop spinner without status
     */
    stop(): void;
    /**
     * Pop previous spinner from stack
     */
    private popStack;
}
/**
 * Task progress tracker for parallel execution
 */
export interface TaskProgress {
    id: string;
    name: string;
    status: 'pending' | 'running' | 'success' | 'error';
    progress?: number;
    startTime?: number;
    endTime?: number;
}
export declare class ParallelTaskProgress {
    private tasks;
    /**
     * Add a task
     */
    addTask(task: Omit<TaskProgress, 'status'>): void;
    /**
     * Start a task
     */
    startTask(taskId: string): void;
    /**
     * Update task progress
     */
    updateProgress(taskId: string, progress: number): void;
    /**
     * Complete task with success
     */
    completeTask(taskId: string): void;
    /**
     * Fail task
     */
    failTask(taskId: string): void;
    /**
     * Render all tasks
     */
    render(): string;
    /**
     * Get task icon
     */
    private getTaskIcon;
    /**
     * Get summary
     */
    getSummary(): {
        total: number;
        pending: number;
        running: number;
        success: number;
        error: number;
    };
}
//# sourceMappingURL=progress.d.ts.map