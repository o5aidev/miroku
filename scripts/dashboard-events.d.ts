/**
 * Dashboard Event Emitters (Optimized)
 * Send agent execution events to Miyabi Dashboard via HTTP API
 *
 * Performance: 200ms → 20ms per event (10x faster)
 */
export type AgentId = 'coordinator' | 'codegen' | 'review' | 'issue' | 'pr' | 'deployment' | 'test';
/**
 * Emit agent started event
 */
export declare function emitAgentStarted(agentId: AgentId, issueNumber: number): Promise<void>;
/**
 * Emit agent progress event
 */
export declare function emitAgentProgress(agentId: AgentId, issueNumber: number, progress: number, message?: string): Promise<void>;
/**
 * Emit agent completed event
 */
export declare function emitAgentCompleted(agentId: AgentId, issueNumber: number, result?: {
    success: boolean;
    [key: string]: any;
}): Promise<void>;
/**
 * Emit agent error event
 */
export declare function emitAgentError(agentId: AgentId, issueNumber: number, error: string | Error): Promise<void>;
/**
 * Utility: Wrap agent execution with automatic event emission
 */
export declare function withAgentTracking<T>(agentId: AgentId, issueNumber: number, fn: (progress: (p: number, msg?: string) => void) => Promise<T>): Promise<T>;
//# sourceMappingURL=dashboard-events.d.ts.map