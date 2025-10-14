# Miyabi VS Code Extension

Official VS Code extension for [Miyabi](https://github.com/ShunsukeHayashi/Miyabi) - Autonomous Development Assistant.

Monitor agents, issues, and project status directly in VS Code with real-time updates.

## Features

### Real-time Dashboard
- Embedded Miyabi Dashboard in VS Code
- Live updates via WebSocket
- Auto-refresh every 30 seconds
- Connection status monitoring

### Issue Explorer
- Browse all GitHub issues in sidebar
- Color-coded status icons
- Click to open issue in browser
- Real-time status updates

### Agent Monitor
- Track all 21 agents (7 Coding + 14 Business)
- Live progress indicators
- Agent status: idle | running | completed | error
- Current issue assignment

### Project Status
- Repository information
- Issue statistics by state
- Active agent count
- Blocked issue alerts

### Quick Actions
- Open Dashboard in full panel
- Refresh all views
- Run specific agents
- Connect/disconnect from server

## Requirements

- **VS Code**: 1.85.0 or higher
- **Miyabi Dashboard Server**: Running locally or remotely
- **Node.js**: 18+ (for development)

## Installation

### From VSIX (Recommended)

1. Download `miyabi-vscode-X.X.X.vsix` from [Releases](https://github.com/ShunsukeHayashi/Miyabi/releases)
2. Open VS Code
3. Go to Extensions (`Cmd+Shift+X`)
4. Click "..." → "Install from VSIX..."
5. Select the downloaded file

### From Source (Development)

```bash
cd packages/vscode-extension
pnpm install
pnpm run compile
```

Then press `F5` to launch Extension Development Host.

## Configuration

### Server URL

Configure the Miyabi Dashboard Server URL in VS Code settings:

```json
{
  "miyabi.serverUrl": "http://localhost:3001",
  "miyabi.refreshInterval": 30
}
```

**Settings:**
- `miyabi.serverUrl`: Dashboard server URL (default: `http://localhost:3001`)
- `miyabi.refreshInterval`: Auto-refresh interval in seconds (default: 30)

### Access from Settings UI

1. Open Settings (`Cmd+,`)
2. Search for "Miyabi"
3. Update server URL and refresh interval

## Usage

### Opening the Dashboard

**Command Palette:**
```
Cmd+Shift+P → "Miyabi: Open Dashboard"
```

**Activity Bar:**
- Click Miyabi icon in sidebar
- Views: Issues, Agents, Project Status

### Viewing Issues

1. Click "Issues" in Miyabi sidebar
2. Browse all GitHub issues
3. Click any issue to open in browser
4. Status icons show current state:
   - ✅ Done
   - 🔄 In Progress
   - ⚠️ Blocked
   - 📥 Pending

### Monitoring Agents

1. Click "Agents" in Miyabi sidebar
2. View all 21 agents:
   - 🔴 Leader (2): しきるん, あきんどさん
   - 🟢 Executor (12): つくるん, めだまん, かくちゃん, etc.
   - 🔵 Analyst (5): みつけるん, しらべるん, かぞえるん, etc.
   - 🟡 Support (3): まとめるん, はこぶん, つなぐん
3. Status indicators:
   - 🔵 Idle
   - 🔄 Running (with progress %)
   - ✅ Completed
   - ❌ Error

### Refreshing Data

**Manual Refresh:**
- Command: `Miyabi: Refresh Issues`
- Button: Click "🔄 Refresh" in Dashboard

**Auto Refresh:**
- Issues/Agents: WebSocket real-time updates
- Dashboard: Auto-refresh every 30s

## Architecture

### Components

```
packages/vscode-extension/
├── src/
│   ├── extension.ts              # Activation & command registration
│   ├── utils/
│   │   └── MiyabiClient.ts       # WebSocket & HTTP client
│   ├── providers/
│   │   ├── IssueTreeProvider.ts  # Issue TreeView
│   │   ├── AgentTreeProvider.ts  # Agent TreeView
│   │   └── StatusTreeProvider.ts # Status TreeView
│   └── views/
│       └── DashboardWebview.ts   # Dashboard Webview panel
├── resources/
│   └── icon.svg                  # Extension icon
├── package.json                  # Extension manifest
└── tsconfig.json                 # TypeScript config
```

### API Integration

**WebSocket Events (Socket.io):**
- `graph:update` → Refresh issues
- `agent:started` → Agent status update
- `agent:progress` → Agent progress update
- `agent:completed` → Agent finished
- `agent:error` → Agent error
- `state:transition` → Issue state change

**HTTP Endpoints:**
- `GET /api/status` → Project status
- `GET /api/graph` → Issues with dependency graph
- `GET /api/agents/status` → All agent statuses
- `POST /api/workflow/trigger` → Run specific agent
- `POST /api/refresh` → Force refresh

### Real-time Updates

```typescript
// MiyabiClient listens to WebSocket events
miyabiClient.on('issue:update', () => {
  issueTreeProvider.refresh();
});

miyabiClient.on('agent:update', () => {
  agentTreeProvider.refresh();
});
```

## Development

### Setup

```bash
cd packages/vscode-extension
pnpm install
```

### Compile

```bash
pnpm run compile
# or watch mode
pnpm run watch
```

### Run Extension

1. Open this directory in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window

### Debugging

- Set breakpoints in TypeScript code
- Launch with `F5`
- Debug Console shows extension logs
- Use `console.log()` or `console.error()`

### Package Extension

```bash
pnpm run package
# Output: miyabi-vscode-X.X.X.vsix
```

## Troubleshooting

### Connection Error

**Problem:** Cannot connect to Miyabi server

**Solution:**
1. Verify server is running: `npm run dev:server`
2. Check server URL in settings
3. Try refreshing: `Miyabi: Refresh Issues`

### No Issues Showing

**Problem:** Issue list is empty

**Solution:**
1. Check GitHub connection
2. Verify `.miyabi.yml` configuration
3. Run `miyabi status` in terminal
4. Refresh views

### WebSocket Not Connecting

**Problem:** Real-time updates not working

**Solution:**
1. Check firewall settings
2. Verify server supports WebSocket
3. Try HTTP fallback (polling transport)

## Commands

| Command | Description |
|---------|-------------|
| `Miyabi: Open Dashboard` | Open dashboard in panel |
| `Miyabi: Refresh Issues` | Manually refresh issue list |
| `Miyabi: Refresh Agents` | Manually refresh agent list |
| `Miyabi: Refresh Status` | Manually refresh project status |
| `Miyabi: Run Agent` | Trigger specific agent |
| `Miyabi: Open Settings` | Open Miyabi settings |

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## License

MIT License - See [LICENSE](../../LICENSE) for details.

## Links

- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **Dashboard**: https://shunsukehayashi.github.io/Miyabi/
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Documentation**: https://github.com/ShunsukeHayashi/Miyabi/tree/main/docs

## Support

- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **Discussions**: https://github.com/ShunsukeHayashi/Miyabi/discussions
- **Email**: supernovasyun@gmail.com

---

🌸 **Miyabi VS Code Extension** - Autonomous Development in Your Editor
