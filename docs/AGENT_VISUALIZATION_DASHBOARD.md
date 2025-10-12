# Agent Visualization Dashboard - Architecture Design

## Overview

Real-time visualization dashboard for Miyabi Agent execution using React Flow. Provides visual representation of Issue/PR → Agent → State transitions with GitHub WebHook integration.

## System Architecture

```
┌─────────────────┐
│  GitHub         │
│  (WebHooks)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Server                           │
│  ┌─────────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │  Express API    │───▶│  Agent       │───▶│ WebSocket │ │
│  │  /webhook       │    │  Executor    │    │  Server   │ │
│  └─────────────────┘    └──────────────┘    └─────┬─────┘ │
└───────────────────────────────────────────────────┼─────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (React + Vite)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            React Flow Canvas                        │   │
│  │  ┌─────────┐      ┌─────────┐      ┌──────────┐   │   │
│  │  │  Issue  │─────▶│  Agent  │─────▶│  State   │   │   │
│  │  │  Node   │      │  Node   │      │  Node    │   │   │
│  │  └─────────┘      └─────────┘      └──────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (`packages/dashboard/`)

**Tech Stack:**
- **React 18** - UI framework
- **React Flow** - Node-based graph visualization
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Socket.IO Client** - Real-time updates

**Node Types:**

#### Issue Node
```typescript
{
  id: 'issue-47',
  type: 'issue',
  data: {
    number: 47,
    title: 'Security Audit Report',
    state: '📥 state:pending',
    priority: '📝 priority:P3-Low',
    assignedAgents: ['issue-agent']
  }
}
```

#### Agent Node
```typescript
{
  id: 'agent-coordinator',
  type: 'agent',
  data: {
    name: 'CoordinatorAgent',
    status: 'running' | 'idle' | 'error',
    currentIssue: 47,
    progress: 65 // %
  }
}
```

#### State Node
```typescript
{
  id: 'state-pending',
  type: 'state',
  data: {
    label: '📥 state:pending',
    count: 5, // Number of issues in this state
    color: '#E4E4E4'
  }
}
```

**Edge Types:**
- `issue-to-agent` - Issue assigned to Agent
- `agent-to-state` - Agent transitioning Issue state
- `state-flow` - State machine transitions

### 2. Backend (`packages/dashboard-server/`)

**Tech Stack:**
- **Express** - HTTP server
- **Socket.IO** - WebSocket server
- **@octokit/webhooks** - GitHub WebHook handling
- **tsx** - TypeScript execution

**Endpoints:**

#### WebHook Receiver
```typescript
POST /api/webhook/github
- Receives GitHub WebHooks (issues, pull_request, label)
- Parses event payload
- Triggers Agent execution
- Emits real-time updates via WebSocket
```

#### Agent Status API
```typescript
GET /api/agents/status
- Returns current status of all agents
- Response: { agents: AgentStatus[] }

GET /api/issues/:number/flow
- Returns graph data for specific issue
- Response: { nodes: Node[], edges: Edge[] }

GET /api/graph
- Returns full system graph
- Response: { nodes: Node[], edges: Edge[] }
```

#### WebSocket Events
```typescript
// Server → Client
'agent:started' - { agentId, issueNumber }
'agent:progress' - { agentId, issueNumber, progress }
'agent:completed' - { agentId, issueNumber, result }
'agent:error' - { agentId, issueNumber, error }
'state:transition' - { issueNumber, from, to }
'graph:update' - { nodes, edges }

// Client → Server
'subscribe' - { issueNumber?: number }
'unsubscribe' - { issueNumber?: number }
```

### 3. Agent Executor Integration

**Existing Scripts → Dashboard Integration:**

```typescript
// scripts/parallel-executor.ts
import { dashboardEmit } from './dashboard-client';

async function executeAgent(issue) {
  dashboardEmit('agent:started', {
    agentId: 'coordinator',
    issueNumber: issue.number
  });

  try {
    // ... existing agent execution logic

    dashboardEmit('agent:progress', {
      agentId: 'coordinator',
      issueNumber: issue.number,
      progress: 50
    });

    const result = await runAgent();

    dashboardEmit('agent:completed', {
      agentId: 'coordinator',
      issueNumber: issue.number,
      result
    });
  } catch (error) {
    dashboardEmit('agent:error', {
      agentId: 'coordinator',
      issueNumber: issue.number,
      error: error.message
    });
  }
}
```

## Data Flow

### 1. GitHub WebHook → Dashboard

```
GitHub Issue Created (#58)
  ↓
POST /api/webhook/github
  ↓
Parse event: { action: 'opened', issue: {...} }
  ↓
Create graph node: { type: 'issue', data: {...} }
  ↓
Emit 'graph:update' via WebSocket
  ↓
React Flow updates canvas
```

### 2. Agent Execution → Real-time Update

```
User triggers Agent via CLI/Slash Command
  ↓
Agent starts execution
  ↓
Emit 'agent:started' { agentId, issueNumber }
  ↓
Frontend highlights Agent node
  ↓
Agent processes (emit progress updates)
  ↓
Agent completes → Label added
  ↓
Emit 'state:transition' { from: 'pending', to: 'analyzing' }
  ↓
Frontend animates state transition
```

### 3. Label-based State Machine Visualization

```typescript
// Label change triggers state transition animation
{
  issue: '#47',
  from: '📥 state:pending',
  to: '🔍 state:analyzing',
  agent: 'coordinator',
  timestamp: '2025-10-11T18:30:00Z'
}

// React Flow edge animation:
Issue #47 → CoordinatorAgent → state:analyzing
```

## Visual Design

### Color Scheme (Label-based)

```typescript
const STATE_COLORS = {
  'state:pending': '#E4E4E4',
  'state:analyzing': '#0E8A16',
  'state:implementing': '#1D76DB',
  'state:reviewing': '#FBCA04',
  'state:done': '#2EA44F',
  'state:blocked': '#D73A4A',
  'state:failed': '#B60205'
};

const AGENT_COLORS = {
  'agent:coordinator': '#FF79C6',
  'agent:codegen': '#00D9FF',
  'agent:review': '#00FF88',
  'agent:issue': '#8B88FF',
  'agent:pr': '#FF79C6',
  'agent:deployment': '#FF4444'
};
```

### Node Styles

**Issue Node:**
```tsx
<div className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-lg">
  <div className="flex items-center gap-2">
    <span className="text-2xl">📋</span>
    <div>
      <h3 className="font-bold">#{issue.number}</h3>
      <p className="text-sm text-gray-600">{issue.title}</p>
    </div>
  </div>
  <div className="mt-2 flex gap-1">
    {issue.labels.map(label => (
      <Badge color={getLabelColor(label)}>{label}</Badge>
    ))}
  </div>
</div>
```

**Agent Node:**
```tsx
<div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-6 shadow-2xl">
  <div className="text-center">
    <span className="text-3xl">🤖</span>
    <h3 className="mt-2 font-bold text-white">{agent.name}</h3>
    <div className="mt-2 h-2 w-32 rounded-full bg-white/30">
      <div
        className="h-full rounded-full bg-white transition-all"
        style={{ width: `${agent.progress}%` }}
      />
    </div>
  </div>
</div>
```

## Implementation Plan

### Phase 1: Backend Setup
1. Create `packages/dashboard-server/`
2. Implement Express + Socket.IO server
3. Set up GitHub WebHook receiver
4. Integrate with existing Agent scripts

### Phase 2: Frontend Development
1. Create `packages/dashboard/`
2. Set up Vite + React + React Flow
3. Implement node types (Issue, Agent, State)
4. Add WebSocket client integration

### Phase 3: Real-time Features
1. Implement event emitters in Agent scripts
2. Connect WebSocket events to React Flow
3. Add animations for state transitions
4. Implement progress indicators

### Phase 4: GitHub Integration
1. Configure GitHub WebHook in repository settings
2. Test WebHook → Dashboard flow
3. Implement security (webhook secret validation)
4. Add error handling & reconnection logic

## File Structure

```
packages/
├── dashboard/                    # Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── nodes/
│   │   │   │   ├── IssueNode.tsx
│   │   │   │   ├── AgentNode.tsx
│   │   │   │   └── StateNode.tsx
│   │   │   ├── FlowCanvas.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useGraphData.ts
│   │   ├── stores/
│   │   │   └── graphStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── dashboard-server/             # Backend
    ├── src/
    │   ├── server.ts            # Express + Socket.IO setup
    │   ├── webhook-handler.ts   # GitHub WebHook processing
    │   ├── agent-integrator.ts  # Agent execution bridge
    │   ├── graph-builder.ts     # Build graph from GitHub data
    │   └── types.ts
    ├── package.json
    └── tsconfig.json
```

## Environment Variables

```bash
# .env (dashboard-server)
PORT=3001
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=ghp_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
DASHBOARD_URL=http://localhost:5173
```

## Security Considerations

1. **WebHook Secret Validation**
   ```typescript
   import { verify } from '@octokit/webhooks';

   const isValid = await verify(
     process.env.GITHUB_WEBHOOK_SECRET,
     payload,
     signature
   );
   ```

2. **CORS Configuration**
   ```typescript
   app.use(cors({
     origin: process.env.DASHBOARD_URL,
     credentials: true
   }));
   ```

3. **Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';

   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   });
   ```

## Deployment

### Development
```bash
# Terminal 1: Start backend
cd packages/dashboard-server
npm run dev

# Terminal 2: Start frontend
cd packages/dashboard
npm run dev
```

### Production (GitHub Pages + Firebase)
```bash
# Frontend: GitHub Pages (static)
cd packages/dashboard
npm run build
gh-pages -d dist

# Backend: Firebase Functions or Railway
cd packages/dashboard-server
npm run build
firebase deploy --only functions
```

## Integration with Existing Systems

### 1. Slash Commands
```bash
# .claude/commands/miyabi-auto.md
After starting agents, open dashboard:
https://dashboard.miyabi.dev
```

### 2. GitHub Actions Workflow
```yaml
# .github/workflows/agent-execution.yml
- name: Notify Dashboard
  run: |
    curl -X POST $DASHBOARD_URL/api/webhook/github \
      -H "Content-Type: application/json" \
      -d '{"action":"workflow_started","issue":${{ github.event.issue.number }}}'
```

### 3. CLI Integration
```typescript
// packages/cli/src/commands/status.ts
console.log('Dashboard: https://dashboard.miyabi.dev');
console.log('View real-time Agent execution graph');
```

## Next Steps

1. Review architecture with team
2. Create GitHub Project for dashboard development
3. Set up monorepo packages (dashboard, dashboard-server)
4. Implement Phase 1 (Backend)
5. Implement Phase 2 (Frontend)
6. Test with live WebHooks
7. Deploy to production

---

**Status:** Architecture Design Complete
**Next:** Implementation Phase 1
