# Miyabi Dashboard - Frontend

Real-time visualization dashboard for Miyabi Agent execution using React Flow.

## Features

- **Real-time Agent Monitoring** - Watch agents execute tasks in real-time
- **Interactive Graph Visualization** - Node-based flow using React Flow
- **WebSocket Integration** - Live updates via Socket.IO
- **State Machine Visualization** - See Issue → Agent → State transitions
- **Responsive UI** - Beautiful, modern interface with TailwindCSS

## Tech Stack

- React 18
- TypeScript
- Vite
- React Flow - Node-based graph visualization
- Socket.IO Client - Real-time communication
- TailwindCSS - Styling
- Zustand - State management (future)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dashboard will be available at http://localhost:5173

## Environment Variables

Create a `.env` file:

```bash
VITE_SOCKET_URL=http://localhost:3001
VITE_GITHUB_REPO=ShunsukeHayashi/Miyabi
```

## Project Structure

```
src/
├── components/
│   ├── nodes/
│   │   ├── IssueNode.tsx      # Issue card node
│   │   ├── AgentNode.tsx      # Agent status node
│   │   └── StateNode.tsx      # State indicator node
│   └── FlowCanvas.tsx         # Main React Flow canvas
├── hooks/
│   └── useWebSocket.ts        # WebSocket connection hook
├── types/
│   └── index.ts               # TypeScript definitions
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

## Node Types

### Issue Node
Displays GitHub Issue information:
- Issue number and title
- Current state (pending, analyzing, etc.)
- Priority level
- Assigned agents

### Agent Node
Shows Agent execution status:
- Agent type (Coordinator, CodeGen, Review, etc.)
- Status indicator (idle, running, error, completed)
- Progress bar (when running)
- Current issue being processed

### State Node
Represents Issue state:
- State emoji and label
- Number of issues in this state
- State description

## WebSocket Events

The dashboard listens to these events:

- `graph:update` - Full graph refresh
- `agent:started` - Agent begins execution
- `agent:progress` - Agent progress update
- `agent:completed` - Agent finished successfully
- `agent:error` - Agent encountered error
- `state:transition` - Issue state changed

## Integration

The frontend connects to the dashboard-server backend:

```typescript
// In useWebSocket.ts
const SOCKET_URL = 'http://localhost:3001';
```

Make sure the backend server is running before starting the frontend.

## Customization

### Adding New Node Types

1. Create component in `src/components/nodes/`
2. Register in `nodeTypes` in `FlowCanvas.tsx`
3. Add type definition in `src/types/index.ts`

### Styling

Colors are defined in `tailwind.config.js`:

```javascript
colors: {
  agent: {
    coordinator: '#FF79C6',
    codegen: '#00D9FF',
    // ...
  },
  state: {
    pending: '#E4E4E4',
    analyzing: '#0E8A16',
    // ...
  }
}
```

## Deployment

### GitHub Pages

```bash
npm run build
gh-pages -d dist
```

### Vercel

```bash
vercel --prod
```

### Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

## License

Apache-2.0
