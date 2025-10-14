# Changelog

All notable changes to the Miyabi VS Code Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of Miyabi VS Code Extension
- Real-time Dashboard with WebSocket support
- Issue Explorer with state-based icons
- Agent Monitor showing all 21 agents
- Project Status view with repository info
- Quick Actions: Open Dashboard, Refresh Views, Run Agents
- Configuration settings for server URL and refresh interval
- Auto-refresh every 30 seconds
- Connection status monitoring

### Features

#### Dashboard
- Embedded Miyabi Dashboard in VS Code panel
- iframe-based integration with sandbox security
- Auto-refresh with cache-busting
- Open in external browser option

#### Issue Management
- TreeView showing all GitHub issues
- Click to open issue URL
- Real-time status updates via WebSocket
- Color-coded icons:
  - ✅ Done (green)
  - 🔄 In Progress (blue, spinning)
  - ⚠️ Blocked (red)
  - 📥 Pending (gray)

#### Agent Monitoring
- Display all 21 agents (7 Coding + 14 Business)
- Character-based naming system:
  - 🔴 Leaders: しきるん, あきんどさん
  - 🟢 Executors: つくるん, めだまん, etc.
  - 🔵 Analysts: みつけるん, しらべるん, etc.
  - 🟡 Support: まとめるん, はこぶん, つなぐん
- Live progress indicators (0-100%)
- Current issue assignment display

#### Project Status
- Repository owner/name display
- Total issue count
- Issues by state breakdown
- Active agent count
- Blocked issue alerts

### Technical Details
- TypeScript with strict mode
- Socket.io-client for WebSocket
- VS Code Extension API
- TreeDataProvider for sidebar views
- WebviewViewProvider for panels
- EventEmitter for state management

## [0.1.0] - 2025-10-14

### Added
- Initial development version
- Core architecture implementation
- All provider classes
- MiyabiClient with WebSocket support
- Complete documentation

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Vulnerability fixes
