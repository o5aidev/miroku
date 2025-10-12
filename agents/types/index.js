/**
 * Agent Types and Interfaces
 *
 * Core type definitions for the Autonomous Operations Agent system
 */
// ============================================================================
// Error Types
// ============================================================================
export class AgentError extends Error {
    agentType;
    taskId;
    cause;
    constructor(message, agentType, taskId, cause) {
        super(message);
        this.agentType = agentType;
        this.taskId = taskId;
        this.cause = cause;
        this.name = 'AgentError';
    }
}
export class EscalationError extends Error {
    target;
    severity;
    context;
    constructor(message, target, severity, context) {
        super(message);
        this.target = target;
        this.severity = severity;
        this.context = context;
        this.name = 'EscalationError';
    }
}
export class CircularDependencyError extends Error {
    cycle;
    constructor(message, cycle) {
        super(message);
        this.cycle = cycle;
        this.name = 'CircularDependencyError';
    }
}
//# sourceMappingURL=index.js.map