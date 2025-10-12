/**
 * BaseAgent - Base class for all Autonomous Operations Agents
 *
 * Provides core functionality:
 * - Escalation mechanism
 * - Metrics recording
 * - Error handling
 * - Logging
 */
import { AgentType, AgentResult, EscalationTarget, Severity, Task, AgentConfig, ToolInvocation } from './types/index.js';
export declare abstract class BaseAgent {
    protected config: AgentConfig;
    protected agentType: AgentType;
    protected currentTask?: Task;
    protected startTime: number;
    protected logs: ToolInvocation[];
    constructor(agentType: AgentType, config: AgentConfig);
    /**
     * Convert AgentType to AgentName for UI
     */
    private getAgentName;
    /**
     * Main execution method - must be implemented by each Agent
     */
    abstract execute(task: Task): Promise<AgentResult>;
    /**
     * Run the agent with full lifecycle management (with performance monitoring)
     */
    run(task: Task): Promise<AgentResult>;
    /**
     * Validate task before execution
     */
    protected validateTask(task: Task): Promise<void>;
    /**
     * Escalate issue to appropriate human authority
     */
    protected escalate(reason: string, target: EscalationTarget, severity?: Severity, context?: Record<string, any>): Promise<void>;
    /**
     * Determine appropriate escalation target based on issue type
     */
    protected determineEscalationTarget(issueType: string): EscalationTarget;
    /**
     * Notify escalation target via GitHub
     */
    private notifyEscalation;
    /**
     * Record agent execution metrics
     */
    protected recordMetrics(result: AgentResult): Promise<void>;
    /**
     * Record escalation to file (using async batched writer)
     */
    private recordEscalation;
    /**
     * Update LDD log with execution details
     */
    protected updateLDDLog(result: AgentResult): Promise<void>;
    /**
     * Format LDD entry for markdown log
     */
    private formatLDDEntry;
    /**
     * Log tool invocation (with performance tracking)
     */
    protected logToolInvocation(command: string, status: 'passed' | 'failed', notes: string, output?: string, error?: string): Promise<void>;
    /**
     * Handle execution errors
     */
    private handleError;
    /**
     * Determine if error should trigger escalation
     */
    private shouldEscalate;
    /**
     * Categorize error type for escalation routing
     */
    private categorizeError;
    /**
     * Log message with agent context (uses RichLogger)
     */
    protected log(message: string): void;
    /**
     * Ensure directory exists
     */
    protected ensureDirectory(dirPath: string): Promise<void>;
    /**
     * Append content to file (using async batched writer for 96% improvement)
     */
    protected appendToFile(filePath: string, content: string): Promise<void>;
    /**
     * Execute shell command
     */
    protected executeCommand(command: string, options?: {
        cwd?: string;
        timeout?: number;
    }): Promise<{
        stdout: string;
        stderr: string;
        code: number;
    }>;
    /**
     * Sleep for specified milliseconds
     */
    protected sleep(ms: number): Promise<void>;
    /**
     * Retry operation with exponential backoff
     */
    protected retry<T>(operation: () => Promise<T>, maxRetries?: number, baseDelay?: number): Promise<T>;
    /**
     * Send agent event to dashboard via webhook
     */
    private sendAgentEvent;
    /**
     * Safely truncate a string without breaking Unicode surrogate pairs
     *
     * JavaScript strings are UTF-16, where some characters (like emojis) are
     * represented as surrogate pairs (two 16-bit code units). Using substring()
     * can break these pairs, creating invalid JSON.
     *
     * @param str - The string to truncate
     * @param maxLength - Maximum length in characters (not bytes)
     * @returns Safely truncated string
     */
    protected safeTruncate(str: string, maxLength: number): string;
    getAgentType(): AgentType;
    getCurrentTask(): Task | undefined;
    getConfig(): AgentConfig;
}
//# sourceMappingURL=base-agent.d.ts.map