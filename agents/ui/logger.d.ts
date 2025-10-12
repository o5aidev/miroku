/**
 * RichLogger — Beautiful CLI Output System
 *
 * Addresses Issue #4 - Rich CLI Output Styling
 *
 * Provides a unified API for rich terminal output with:
 * - Colors (chalk)
 * - Boxes (boxen)
 * - Tables (cli-table3)
 * - Spinners (ora)
 * - Gradients (gradient-string)
 * - ASCII Art (figlet)
 */
import { Ora } from 'ora';
import { type AgentName } from './theme.js';
export interface LogOptions {
    prefix?: string;
    indent?: number;
    newline?: boolean;
}
export interface BoxOptions {
    title?: string;
    padding?: number;
    margin?: number;
    borderStyle?: 'single' | 'double' | 'round' | 'bold';
    borderColor?: string;
    align?: 'left' | 'center' | 'right';
}
export declare class RichLogger {
    private indentLevel;
    /**
     * Output raw text (no styling)
     */
    raw(text: string): void;
    /**
     * Main header (large, gradient)
     */
    header(text: string, useGradient?: boolean): void;
    /**
     * Sub-header (medium, colored)
     */
    subheader(text: string): void;
    /**
     * Section header (small, with emoji)
     */
    section(emoji: string, text: string): void;
    /**
     * Success message
     */
    success(message: string, options?: LogOptions): void;
    /**
     * Error message
     */
    error(message: string, error?: Error, options?: LogOptions): void;
    /**
     * Warning message
     */
    warning(message: string, options?: LogOptions): void;
    /**
     * Info message
     */
    info(message: string, options?: LogOptions): void;
    /**
     * Agent-specific message
     */
    agent(agentName: AgentName, message: string, options?: LogOptions): void;
    /**
     * Human/Guardian message
     */
    human(message: string, options?: LogOptions): void;
    /**
     * Dimmed/muted message
     */
    muted(message: string, options?: LogOptions): void;
    /**
     * Generic log with indentation support
     */
    log(message: string, options?: LogOptions): void;
    /**
     * Bullet list item
     */
    bullet(message: string, level?: number): void;
    /**
     * Create a box around content
     */
    box(content: string, options?: BoxOptions): void;
    /**
     * Start a spinner
     */
    startSpinner(text: string, spinnerType?: string): Ora;
    /**
     * Stop a spinner with success
     */
    stopSpinnerSuccess(spinner: Ora, text?: string): void;
    /**
     * Stop a spinner with failure
     */
    stopSpinnerFail(spinner: Ora, text?: string): void;
    /**
     * Stop a spinner with warning
     */
    stopSpinnerWarn(spinner: Ora, text?: string): void;
    /**
     * Stop a spinner with info
     */
    stopSpinnerInfo(spinner: Ora, text?: string): void;
    /**
     * ASCII art banner
     */
    banner(text: string, font?: string): Promise<void>;
    /**
     * Gradient text
     */
    gradient(text: string): void;
    /**
     * Divider line
     */
    divider(type?: 'light' | 'heavy' | 'double'): void;
    /**
     * Empty line
     */
    newline(count?: number): void;
    /**
     * Increase indent level
     */
    indent(): void;
    /**
     * Decrease indent level
     */
    outdent(): void;
    /**
     * Reset indent level
     */
    resetIndent(): void;
    /**
     * Progress bar (simple text-based)
     */
    progressBar(current: number, total: number, width?: number): string;
    /**
     * Key-value pair
     */
    keyValue(key: string, value: string, color?: string): void;
    /**
     * Status indicator
     */
    status(label: string, status: 'success' | 'error' | 'warning' | 'info' | 'pending'): void;
    /**
     * Clear console
     */
    clear(): void;
}
export declare const logger: RichLogger;
//# sourceMappingURL=logger.d.ts.map