# @miyabi/agent-sdk

SDK for building and running autonomous agents in the Miyabi ecosystem.

## Installation

### From GitHub Packages

```bash
npm install @miyabi/agent-sdk
```

### Configuration

Create a `.npmrc` file in your project root:

```
@miyabi:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## Quick Start

### Creating a Custom Agent

```typescript
import { AgentBase, AgentContext, AgentResult } from '@miyabi/agent-sdk';

class MyCustomAgent extends AgentBase {
  async execute(): Promise<AgentResult> {
    this.validate();
    this.log('Starting custom agent execution');

    let operationCount = 0;
    let apiCallCount = 0;

    try {
      // Your agent logic here
      operationCount++;

      // Example: Fetch issue data
      if (this.context.issueNumber) {
        const issue = await this.githubClient.getIssue(this.context.issueNumber);
        apiCallCount++;
        this.log(`Processing issue #${issue.number}: ${issue.title}`);
      }

      return this.success(
        'Agent execution completed successfully',
        operationCount,
        apiCallCount
      );
    } catch (error) {
      this.log(`Agent execution failed: ${error.message}`, 'error');
      return this.failure(
        'Agent execution failed',
        error as Error,
        operationCount,
        apiCallCount
      );
    }
  }
}

// Usage
const agent = new MyCustomAgent({
  owner: 'your-org',
  repo: 'your-repo',
  token: process.env.GITHUB_TOKEN,
  workdir: process.cwd(),
  config: {
    name: 'MyCustomAgent',
    role: 'Custom automation agent',
    priority: 2,
  },
});

const result = await agent.execute();
console.log(result);
```

### Using the GitHub Client

```typescript
import { GitHubClient } from '@miyabi/agent-sdk';

const client = new GitHubClient({
  owner: 'your-org',
  repo: 'your-repo',
  token: process.env.GITHUB_TOKEN,
});

// Fetch issue
const issue = await client.getIssue(123);
console.log(issue.title);

// Add comment
await client.createComment(123, 'Agent processing started');

// Add labels
await client.addLabels(123, ['status:in-progress', 'agent:processing']);

// Close issue
await client.closeIssue(123);
```

### Using Utility Functions

```typescript
import {
  createAgentContext,
  validateContext,
  parseIssueNumber,
  formatDuration,
  extractLabelsFromBody,
  extractPriority,
} from '@miyabi/agent-sdk';

// Create context from environment variables
const context = createAgentContext({
  name: 'MyAgent',
  role: 'Automation',
  priority: 1,
});

// Validate context
validateContext(context);

// Parse issue number
const issueNum = parseIssueNumber('#123'); // 123
const issueNum2 = parseIssueNumber('https://github.com/owner/repo/issues/456'); // 456

// Format duration
console.log(formatDuration(125000)); // "2m 5s"

// Extract labels from issue body
const labels = extractLabelsFromBody('Labels: bug, high-priority');
// ['bug', 'high-priority']

// Extract priority
const priority = extractPriority('Priority: high', ['priority-1']);
// 1
```

## API Reference

### Types

#### `AgentContext`

Execution context for agents.

```typescript
interface AgentContext {
  owner: string;
  repo: string;
  issueNumber?: number;
  token: string;
  workdir: string;
  config: AgentConfig;
}
```

#### `AgentConfig`

Agent configuration options.

```typescript
interface AgentConfig {
  name: string;
  role: string;
  priority: number;
  timeout?: number;
  retry?: RetryConfig;
  escalation?: EscalationConfig;
}
```

#### `AgentResult`

Result of agent execution.

```typescript
interface AgentResult {
  status: 'success' | 'failure' | 'partial' | 'timeout';
  message: string;
  metrics: AgentMetrics;
  artifacts?: AgentArtifact[];
  error?: AgentError;
}
```

### Classes

#### `AgentBase`

Base class for all agents.

**Methods:**

- `execute(): Promise<AgentResult>` - Execute the agent (abstract, must be implemented)
- `validate(): void` - Validate context and configuration
- `success(message, operationCount, apiCallCount): AgentResult` - Create success result
- `failure(message, error, operationCount, apiCallCount): AgentResult` - Create failure result
- `retry<T>(operation, maxAttempts, delayMs): Promise<T>` - Retry operation with backoff
- `log(message, level): void` - Log with agent name prefix

#### `GitHubClient`

Simplified GitHub API client.

**Methods:**

- `getIssue(issueNumber): Promise<GitHubIssue>` - Fetch issue data
- `createComment(issueNumber, body): Promise<void>` - Create issue comment
- `addLabels(issueNumber, labels): Promise<void>` - Add labels to issue
- `removeLabel(issueNumber, label): Promise<void>` - Remove label from issue
- `closeIssue(issueNumber): Promise<void>` - Close issue

## Environment Variables

The SDK expects the following environment variables:

- `GITHUB_TOKEN` - GitHub personal access token
- `GITHUB_REPOSITORY` - Repository in format `owner/repo`
- `GITHUB_REPOSITORY_OWNER` - Repository owner
- `GITHUB_WORKSPACE` - Working directory (optional, defaults to `process.cwd()`)
- `ISSUE_NUMBER` - Issue number for context (optional)

## Error Handling

The SDK provides automatic retry logic for transient errors:

```typescript
// Automatic retry with exponential backoff
const result = await agent.retry(
  async () => {
    // Operation that might fail
    return await someApiCall();
  },
  3, // max attempts
  1000 // initial delay in ms
);
```

Retryable errors include:
- Network errors (ECONNREFUSED, ETIMEDOUT)
- Rate limiting (HTTP 429)
- Server errors (HTTP 502, 503)
- Timeout errors

## Examples

See the `/examples` directory for complete agent implementations:

- `examples/custom-agent.ts` - Basic custom agent
- `examples/deployment-agent.ts` - Deployment automation agent
- `examples/review-agent.ts` - Code review agent

## Contributing

Please read [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](../../LICENSE) for details.
