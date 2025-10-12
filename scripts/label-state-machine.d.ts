#!/usr/bin/env tsx
/**
 * Label-based State Machine for Agentic OS
 *
 * Implements state management and transitions using GitHub Labels.
 * All automation MUST check labels before taking action.
 *
 * Constitutional Requirement:
 *   "Labels are the OS's state management mechanism"
 *
 * State Flow:
 *   pending → analyzing → implementing → reviewing → done
 *
 * Usage:
 *   npm run state:check -- --issue 123
 *   npm run state:transition -- --issue 123 --to implementing
 */
export type State = 'pending' | 'analyzing' | 'implementing' | 'reviewing' | 'done' | 'blocked' | 'failed' | 'paused';
export type AgentType = 'coordinator' | 'codegen' | 'review' | 'issue' | 'pr' | 'deployment';
export type Priority = 'P0-Critical' | 'P1-High' | 'P2-Medium' | 'P3-Low';
export type Severity = 'Sev.1-Critical' | 'Sev.2-High' | 'Sev.3-Medium' | 'Sev.4-Low';
export interface IssueState {
    number: number;
    title: string;
    state: State | null;
    agent: AgentType | null;
    priority: Priority | null;
    severity: Severity | null;
    labels: string[];
    canTransitionTo: State[];
}
export interface StateTransition {
    from: State;
    to: State;
    trigger: string;
    action: string;
    validation?: (issue: IssueState) => boolean;
}
export declare class LabelStateMachine {
    private octokit;
    private owner;
    private repo;
    constructor(token: string, owner: string, repo: string);
    /**
     * Get current state of an issue
     */
    getIssueState(issueNumber: number): Promise<IssueState>;
    /**
     * Transition issue to new state
     */
    transitionState(issueNumber: number, newState: State, reason?: string): Promise<void>;
    /**
     * Assign agent to issue
     */
    assignAgent(issueNumber: number, agent: AgentType): Promise<void>;
    /**
     * Check if issue can transition to target state
     */
    canTransition(currentState: State | null, targetState: State): boolean;
    private extractState;
    private extractAgent;
    private extractPriority;
    private extractSeverity;
    private stateToLabel;
    private getValidTransitions;
}
export default LabelStateMachine;
//# sourceMappingURL=label-state-machine.d.ts.map