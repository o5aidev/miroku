/**
 * Miyabi Agent SDK
 *
 * SDK for building and running autonomous agents in the Miyabi ecosystem.
 *
 * @packageDocumentation
 */

// Export types
export type {
  AgentContext,
  AgentConfig,
  AgentResult,
  AgentMetrics,
  AgentArtifact,
  AgentError,
  AgentTask,
  GitHubIssue,
  GitHubPullRequest,
  DeploymentConfig,
  DeploymentResult,
  HealthCheckConfig,
  RetryConfig,
  EscalationConfig,
} from './types.js';

// Export base agent class
export { AgentBase } from './agent-base.js';

// Export GitHub client
export { GitHubClient } from './github-client.js';
export type { GitHubClientOptions } from './github-client.js';

// Export utilities
export { createAgentContext, validateContext } from './utils.js';
