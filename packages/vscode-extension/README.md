# Miyabi VS Code Extension

Official VS Code extension for [Miyabi](https://github.com/ShunsukeHayashi/Miyabi) - Autonomous Development Assistant.

Monitor agents, issues, and project status directly in VS Code with real-time updates.

## Features

### 🎨 Enhanced Visual Experience (NEW!)
- **Priority-based color coding**: P0=Red, P1=Orange, P2=Yellow, P3=Green
- **Animated status icons**: Running agents show spinning icons
- **Rich Markdown tooltips**: Hover over items for detailed information
- **13 Label emojis**: Security 🔐, Bug 🐛, Feature ✨, and more
- **Progress bars**: Visual progress indication for running agents
- **Agent-specific icons**: 7 unique icons for different agent types

### 🎯 Interactive Features (NEW!)
- **Right-click context menus**:
  - Issues: Open in Browser, Run Agent, Copy URL/Number
  - Agents: Start Agent, View Logs
  - Status: Refresh, Open Repository
- **Inline action buttons**: Quick access to Run Agent and Open Browser
- **Click to action**: Direct interaction with all tree items
- **Keyboard shortcuts**: Full keyboard navigation support

### 🔍 Powerful Filtering & Sorting (NEW!)
- **State filters**: All / Pending / Implementing / Reviewing / Done / Blocked
- **Priority filters**: All / P0 / P1 / P2 / P3
- **Sort options**:
  - By Priority (High to Low) - Default
  - By Issue Number (Newest first)
  - By State (Blocked first)
- **Combined filters**: Apply multiple filters simultaneously
- **Quick clear**: One-click to reset all filters

### 📊 Real-time Status Bar (NEW!)
- **Active status display**: `$(rocket) Miyabi: 47 issues • $(sync~spin) 2 active`
- **Connection indicator**: `$(check) Miyabi` or `$(x) Miyabi Disconnected`
- **Color-coded warnings**: Red background for blocked issues
- **Click for details**: Instant access to full status
- **Always visible**: Never lose track of your project

### 🔔 Smart Notifications (NEW!)
- **Agent events**: Started, Progress, Completed, Error
- **Issue updates**: Real-time notifications for issue changes
- **Connection status**: WebSocket connect/disconnect alerts
- **Emoji indicators**: Visual feedback with contextual emojis
- **Settings control**: Toggle notifications on/off

### 📝 Issue Explorer
- Browse all GitHub issues in sidebar
- Priority-based color coding with emoji badges
- State indicators with animated icons
- Click to open issue in browser
- Rich tooltips with labels and agent info
- Filter by state or priority
- Sort by priority, number, or state

### 🤖 Agent Monitor
- Track all 21 agents (7 Coding + 14 Business)
- Agent-specific icons (organization, code, checklist, etc.)
- Live progress bars (█████░ 75%)
- Status with emojis: 🟢 Running, ✅ Completed, ❌ Error, ⚪ Idle
- Current issue assignment links
- Start agents directly from context menu

### 📈 Project Status
- Repository information with quick link
- Issue statistics by state
- Active agent count with color coding
- Blocked issue alerts (red warning)
- Color-coded status based on metrics
- One-click refresh

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

### Extension Settings

Configure the Miyabi extension in VS Code settings:

```json
{
  "miyabi.serverUrl": "http://localhost:3001",
  "miyabi.autoRefresh": true,
  "miyabi.refreshInterval": 60000,
  "miyabi.enableNotifications": true
}
```

**Settings:**
- `miyabi.serverUrl`: Dashboard server URL (default: `http://localhost:3001`)
- `miyabi.autoRefresh`: Enable automatic refresh (default: `true`)
- `miyabi.refreshInterval`: Auto-refresh interval in milliseconds (default: `60000` = 60s)
- `miyabi.enableNotifications`: Show notifications for agent events (default: `true`)

**Note:** Minimum refresh interval is 60 seconds to avoid GitHub API rate limits.

### Access from Settings UI

1. Open Settings (`Cmd+,`)
2. Search for "Miyabi"
3. Configure server URL, refresh settings, and notifications

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

### Main Commands
| Command | Description |
|---------|-------------|
| `Miyabi: Initialize Project` | Initialize Miyabi in current workspace |
| `Miyabi: Open Dashboard` | Open dashboard in panel |
| `Miyabi: Show Project Status` | Display project status in notification |
| `Miyabi: Open Settings` | Open Miyabi settings |

### Issue Commands (NEW!)
| Command | Description |
|---------|-------------|
| `Miyabi: Filter Issues by State` | Filter issues: All / Pending / Implementing / Done / Blocked |
| `Miyabi: Filter Issues by Priority` | Filter issues: P0 / P1 / P2 / P3 |
| `Miyabi: Sort Issues` | Sort by: Priority / Number / State |
| `Miyabi: Clear All Filters` | Reset all filters |
| `Miyabi: Refresh Issues` | Manually refresh issue list |

### Agent Commands
| Command | Description |
|---------|-------------|
| `Miyabi: Run Agent` | Select and run specific agent on an issue |

### Context Menu Commands (Right-click)
**Issues:**
- Open Issue in Browser
- Run Agent on Issue
- Copy Issue URL
- Copy Issue Number

**Agents:**
- Start Agent
- View Agent Logs

**Status:**
- Refresh Status
- Open Repository in Browser

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
