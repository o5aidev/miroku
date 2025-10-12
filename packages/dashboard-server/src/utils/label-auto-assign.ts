/**
 * Label Auto-Assignment Utility
 *
 * Infers appropriate agent and state labels from Issue title and body
 * using keyword-based heuristics.
 *
 * Usage:
 *   const assigner = new LabelAutoAssigner();
 *   const labels = assigner.autoAssignLabels(issue);
 *   // { agent: 'codegen', state: 'implementing' }
 */

import type { AgentType } from '../types.js';

export interface IssueData {
  number: number;
  title: string;
  body: string | null;
  labels: Array<{ name: string }>;
  state: 'open' | 'closed';
}

export interface InferredLabels {
  agent?: AgentType;
  state?: string;
  confidence?: {
    agent?: number; // 0-1
    state?: number; // 0-1
  };
}

/**
 * Agent inference keyword patterns
 *
 * Each agent has a set of keywords that, when found in the Issue title or body,
 * suggest that the Issue should be assigned to that agent.
 */
const AGENT_KEYWORDS: Record<AgentType, string[]> = {
  coordinator: [
    'plan',
    'coordinate',
    'organize',
    'schedule',
    'orchestrate',
    'decompose',
    'task breakdown',
    'dependencies',
    'workflow',
    'roadmap',
  ],
  codegen: [
    'implement',
    'code',
    'develop',
    'feature',
    'function',
    'class',
    'module',
    'api',
    'endpoint',
    'add',
    'create',
    'build',
    'generate',
  ],
  review: [
    'review',
    'quality',
    'refactor',
    'clean',
    'optimize',
    'improve',
    'lint',
    'format',
    'code smell',
    'technical debt',
    'performance',
    'security scan',
  ],
  issue: [
    'analyze',
    'investigate',
    'triage',
    'label',
    'categorize',
    'priority',
    'severity',
    'bug report',
    'issue template',
  ],
  pr: [
    'pull request',
    'pr',
    'merge',
    'branch',
    'commit',
    'conventional commits',
    'changelog',
    'release',
  ],
  deployment: [
    'deploy',
    'release',
    'publish',
    'ci',
    'cd',
    'pipeline',
    'staging',
    'production',
    'rollback',
    'firebase',
    'vercel',
    'aws',
  ],
  test: [
    'test',
    'spec',
    'coverage',
    'unit test',
    'integration test',
    'e2e',
    'jest',
    'vitest',
    'playwright',
  ],
};

/**
 * State inference keyword patterns
 */
const STATE_KEYWORDS: Record<string, string[]> = {
  pending: ['todo', 'backlog', 'queued', 'waiting', 'new', 'created'],
  analyzing: [
    'analyzing',
    'investigating',
    'researching',
    'planning',
    'designing',
    'scoping',
  ],
  implementing: [
    'implementing',
    'developing',
    'coding',
    'building',
    'in progress',
    'wip',
    'working on',
  ],
  reviewing: [
    'reviewing',
    'code review',
    'pr review',
    'quality check',
    'checking',
    'verifying',
  ],
  done: [
    'completed',
    'finished',
    'done',
    'resolved',
    'fixed',
    'closed',
    'merged',
  ],
  blocked: [
    'blocked',
    'blocker',
    'stuck',
    'waiting for',
    'dependency',
    'blocked by',
  ],
  failed: ['failed', 'error', 'broken', 'failing', 'crash'],
  paused: ['paused', 'on hold', 'postponed', 'deferred', 'suspended'],
};

export class LabelAutoAssigner {
  /**
   * Infer the most appropriate agent for an Issue
   */
  inferAgent(title: string, body: string | null): AgentType | null {
    const text = `${title} ${body || ''}`.toLowerCase();

    // Count keyword matches for each agent
    const scores: Record<string, number> = {};

    for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        // Title matches are weighted 2x higher
        if (title.toLowerCase().includes(keyword)) {
          score += 2;
        }
        // Body matches are weighted 1x
        if (body?.toLowerCase().includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores[agent] = score;
      }
    }

    // Return agent with highest score (if any matches found)
    if (Object.keys(scores).length === 0) {
      return null;
    }

    const topAgent = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return topAgent as AgentType;
  }

  /**
   * Infer the current state of an Issue
   */
  inferState(
    title: string,
    body: string | null,
    existingLabels: string[]
  ): string | null {
    const text = `${title} ${body || ''}`.toLowerCase();

    // Count keyword matches for each state
    const scores: Record<string, number> = {};

    for (const [state, keywords] of Object.entries(STATE_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score += 1;
        }
      }
      if (score > 0) {
        scores[state] = score;
      }
    }

    // Check existing labels for state hints
    for (const label of existingLabels) {
      const labelLower = label.toLowerCase();
      if (labelLower.includes('wip') || labelLower.includes('in progress')) {
        scores['implementing'] = (scores['implementing'] || 0) + 3;
      }
      if (labelLower.includes('blocked') || labelLower.includes('blocker')) {
        scores['blocked'] = (scores['blocked'] || 0) + 3;
      }
      if (labelLower.includes('review')) {
        scores['reviewing'] = (scores['reviewing'] || 0) + 3;
      }
    }

    // Return state with highest score (if any matches found)
    if (Object.keys(scores).length === 0) {
      return 'pending'; // Default to pending if no matches
    }

    const topState = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    return topState;
  }

  /**
   * Auto-assign labels to an Issue
   *
   * Returns inferred agent and state labels with confidence scores
   */
  autoAssignLabels(issue: IssueData): InferredLabels {
    const existingLabels = issue.labels.map((l) => l.name);

    // Check if agent label already exists
    const hasAgentLabel = existingLabels.some((l) =>
      l.toLowerCase().includes('agent:')
    );
    const hasStateLabel = existingLabels.some((l) =>
      l.toLowerCase().includes('state:')
    );

    const result: InferredLabels = {
      confidence: {},
    };

    // Infer agent if not already assigned
    if (!hasAgentLabel) {
      const inferredAgent = this.inferAgent(issue.title, issue.body);
      if (inferredAgent) {
        result.agent = inferredAgent;
        result.confidence!.agent = this.calculateAgentConfidence(
          issue.title,
          issue.body,
          inferredAgent
        );
      }
    }

    // Infer state if not already assigned
    if (!hasStateLabel) {
      const inferredState = this.inferState(
        issue.title,
        issue.body,
        existingLabels
      );
      if (inferredState) {
        result.state = inferredState;
        result.confidence!.state = this.calculateStateConfidence(
          issue.title,
          issue.body,
          existingLabels,
          inferredState
        );
      }
    }

    return result;
  }

  /**
   * Calculate confidence score for agent inference (0-1)
   */
  private calculateAgentConfidence(
    title: string,
    body: string | null,
    agent: AgentType
  ): number {
    const text = `${title} ${body || ''}`.toLowerCase();
    const keywords = AGENT_KEYWORDS[agent];

    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }

    // Normalize confidence: 1-2 matches = 0.5, 3+ matches = 0.8, 5+ matches = 1.0
    if (matches === 1) return 0.5;
    if (matches === 2) return 0.6;
    if (matches === 3) return 0.7;
    if (matches === 4) return 0.8;
    if (matches >= 5) return 1.0;

    return 0.4; // Low confidence fallback
  }

  /**
   * Calculate confidence score for state inference (0-1)
   */
  private calculateStateConfidence(
    title: string,
    body: string | null,
    existingLabels: string[],
    state: string
  ): number {
    const text = `${title} ${body || ''}`.toLowerCase();
    const keywords = STATE_KEYWORDS[state];

    let matches = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }

    // Boost confidence if existing labels support the inference
    const labelBoost = existingLabels.some((l) => {
      const labelLower = l.toLowerCase();
      return keywords.some((kw) => labelLower.includes(kw));
    })
      ? 0.2
      : 0;

    // Normalize confidence
    const baseConfidence = Math.min(matches * 0.25, 0.8);
    return Math.min(baseConfidence + labelBoost, 1.0);
  }

  /**
   * Get all supported agent types
   */
  getSupportedAgents(): AgentType[] {
    return Object.keys(AGENT_KEYWORDS) as AgentType[];
  }

  /**
   * Get all supported state types
   */
  getSupportedStates(): string[] {
    return Object.keys(STATE_KEYWORDS);
  }

  /**
   * Get keywords for a specific agent (useful for debugging)
   */
  getAgentKeywords(agent: AgentType): string[] {
    return AGENT_KEYWORDS[agent] || [];
  }

  /**
   * Get keywords for a specific state (useful for debugging)
   */
  getStateKeywords(state: string): string[] {
    return STATE_KEYWORDS[state] || [];
  }
}
