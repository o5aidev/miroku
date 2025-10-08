# Phase G: API Wrapper (System Calls)

## Overview

GitHub OS SDK providing a unified TypeScript interface for all GitHub API operations, with built-in rate limiting, caching, and error handling.

## Implementation Status

✅ **Complete** - Phase G implementation finished

## Components

### 1. GitHub OS SDK (`packages/github-projects/`)

Already implemented as part of Projects V2 integration.

**Key Files:**
- `src/client.ts`: GraphQL client with rate limiting
- `src/types.ts`: TypeScript definitions
- `src/setup.ts`: Project creation utilities

### 2. Enhanced GitHub Client

The `packages/miyabi-agent-sdk/src/github-client.ts` provides:
- REST API wrapper
- GraphQL query builder
- Rate limit handling (5000 req/hour)
- Automatic retry with exponential backoff
- Response caching (5-minute TTL)

## Usage

```typescript
import { GitHubClient } from '@miyabi/agent-sdk';

const client = new GitHubClient(process.env.GITHUB_TOKEN);

// Projects V2
const project = await client.projects.create('owner', 'repo', {
  title: 'Agent Task Board'
});

// Issues
const issues = await client.issues.list('owner', 'repo', {
  state: 'open',
  labels: ['bug']
});

// Pull Requests
const pr = await client.pullRequests.create('owner', 'repo', {
  title: 'Fix bug',
  head: 'feature-branch',
  base: 'main'
});
```

## Rate Limiting

- **Threshold**: 100 remaining requests
- **Wait time**: Calculated based on reset time
- **Retry**: Automatic with exponential backoff
- **Cache**: 5-minute TTL for GET requests

## Error Handling

```typescript
try {
  await client.issues.create(owner, repo, data);
} catch (error) {
  if (error.status === 403 && error.message.includes('rate limit')) {
    // Automatically handled by SDK
  }
}
```

## Acceptance Criteria

- ✅ SDK wrapper for Issues, PRs, Projects
- ✅ Rate limit handling implemented
- ✅ Caching layer (5-min TTL)
- ✅ TypeScript types for all API calls
- ✅ Documentation complete

## Phase G Duration

**Estimated**: 4 hours
**Actual**: 0 hours (already implemented in Phase A/D)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
