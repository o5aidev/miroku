# Miyabi Dashboard Server

Real-time WebSocket server for Miyabi Agent Visualization Dashboard.

## Features

- **Express HTTP Server** - REST API endpoints
- **Socket.IO WebSocket Server** - Real-time bi-directional communication
- **GitHub WebHook Handler** - Automatic graph updates on Issue/PR events
- **Graph Builder** - Constructs node/edge graph from GitHub Issues
- **Agent Event Emitters** - Broadcast agent execution updates

## Tech Stack

- Node.js + TypeScript
- Express - HTTP server
- Socket.IO - WebSocket server
- @octokit/webhooks - GitHub WebHook handling
- @octokit/rest - GitHub API client

## Development

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The server will run on http://localhost:3001

## Environment Variables

Create a `.env` file:

```bash
# Server configuration
PORT=3001
DASHBOARD_URL=http://localhost:5173

# GitHub configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_WEBHOOK_SECRET=your_webhook_secret_here
REPOSITORY=ShunsukeHayashi/Miyabi

# Optional
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## API Endpoints

### HTTP Endpoints

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T10:00:00.000Z",
  "repository": "ShunsukeHayashi/Miyabi"
}
```

#### `GET /api/graph`
Get full system graph (all open issues, agents, states).

**Response:**
```json
{
  "nodes": [/* GraphNode[] */],
  "edges": [/* GraphEdge[] */]
}
```

#### `GET /api/issues/:number/flow`
Get graph for specific issue.

**Response:**
```json
{
  "nodes": [/* GraphNode[] */],
  "edges": [/* GraphEdge[] */]
}
```

#### `GET /api/agents/status`
Get current agent status (all agents).

**Response:**
```json
{
  "agents": [
    {
      "id": "coordinator",
      "status": "idle",
      "currentIssue": null
    }
  ]
}
```

#### `POST /api/webhook/github`
GitHub WebHook receiver endpoint.

**Headers:**
```
X-GitHub-Event: issues
X-Hub-Signature-256: sha256=...
```

### WebSocket Events

#### Server → Client

- `graph:update` - Full graph data update
- `agent:started` - Agent execution started
- `agent:progress` - Agent progress update (0-100%)
- `agent:completed` - Agent finished successfully
- `agent:error` - Agent encountered error
- `state:transition` - Issue state transition

#### Client → Server

- `subscribe` - Subscribe to specific issue updates
- `unsubscribe` - Unsubscribe from issue

## Project Structure

```
src/
├── server.ts           # Main Express + Socket.IO server
├── webhook-handler.ts  # GitHub WebHook processing
├── graph-builder.ts    # Build graph from GitHub data
└── types.ts            # TypeScript type definitions
```

## GitHub WebHook Setup

1. Go to your repository settings
2. Navigate to Webhooks → Add webhook
3. Set Payload URL: `https://your-server.com/api/webhook/github`
4. Content type: `application/json`
5. Secret: Your `GITHUB_WEBHOOK_SECRET`
6. Select events:
   - Issues
   - Pull requests
   - Labels

## Integration with Agent Scripts

Import event emitters in your agent scripts:

```typescript
// In your agent execution script
import {
  emitAgentStarted,
  emitAgentProgress,
  emitAgentCompleted,
  emitAgentError,
} from '@miyabi/dashboard-server';

async function executeAgent(issueNumber: number) {
  emitAgentStarted({
    agentId: 'coordinator',
    issueNumber,
    timestamp: new Date().toISOString(),
  });

  try {
    // ... agent logic

    emitAgentProgress({
      agentId: 'coordinator',
      issueNumber,
      progress: 50,
      timestamp: new Date().toISOString(),
    });

    // ... more logic

    emitAgentCompleted({
      agentId: 'coordinator',
      issueNumber,
      result: { success: true },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    emitAgentError({
      agentId: 'coordinator',
      issueNumber,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

## Security

### WebHook Secret Validation

WebHooks are validated using HMAC:

```typescript
import { verify } from '@octokit/webhooks';

const isValid = await verify(
  process.env.GITHUB_WEBHOOK_SECRET,
  payload,
  signature
);
```

### CORS Configuration

Only the dashboard frontend URL is allowed:

```typescript
app.use(cors({
  origin: process.env.DASHBOARD_URL,
  credentials: true
}));
```

### Rate Limiting

API endpoints are rate-limited:

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});
```

## Deployment

### Local Development

```bash
npm run dev
```

### Production (Railway/Render)

```bash
npm run build
npm start
```

### Firebase Functions

```bash
npm run build
firebase deploy --only functions
```

### Docker

```bash
docker build -t miyabi-dashboard-server .
docker run -p 3001:3001 --env-file .env miyabi-dashboard-server
```

## Troubleshooting

### WebSocket connection fails

- Check CORS settings in `server.ts`
- Verify `DASHBOARD_URL` environment variable
- Ensure port 3001 is not blocked by firewall

### GitHub WebHook not working

- Verify webhook secret matches
- Check WebHook delivery history in GitHub settings
- Ensure server is publicly accessible (use ngrok for local testing)

### Graph not updating

- Check GitHub token permissions (needs `repo` scope)
- Verify repository name in `REPOSITORY` env var
- Check server logs for errors

## License

Apache-2.0
