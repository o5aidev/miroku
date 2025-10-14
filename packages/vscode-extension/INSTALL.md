# Miyabi VS Code Extension - Installation Guide

Quick guide to install and use the Miyabi VS Code Extension.

## 📦 Installation

### Method 1: Install from VSIX (Recommended)

1. **Locate the VSIX file:**
   ```
   packages/vscode-extension/miyabi-vscode-0.1.0.vsix
   ```

2. **Install in VS Code:**
   - Open VS Code
   - Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
   - Type: `Extensions: Install from VSIX...`
   - Select `miyabi-vscode-0.1.0.vsix`
   - Wait for installation to complete
   - Reload VS Code when prompted

### Method 2: Install via Command Line

```bash
code --install-extension packages/vscode-extension/miyabi-vscode-0.1.0.vsix
```

### Method 3: Drag and Drop

1. Open VS Code
2. Open Extensions view (`Cmd+Shift+X`)
3. Drag and drop `miyabi-vscode-0.1.0.vsix` into the Extensions view

## 🚀 Setup

### 1. Start Miyabi Dashboard Server

The extension requires the Miyabi Dashboard Server to be running:

```bash
# From project root
npm run dashboard:server
```

Server will start at: `http://localhost:3001`

### 2. Configure Extension

Open VS Code Settings (`Cmd+,`) and search for "Miyabi":

- **Server URL:** `http://localhost:3001` (default)
- **Auto Refresh:** `true` (default)
- **Refresh Interval:** `30000` ms (30 seconds)
- **Enable Notifications:** `true` (default)

Or edit `settings.json`:

```json
{
  "miyabi.serverUrl": "http://localhost:3001",
  "miyabi.autoRefresh": true,
  "miyabi.refreshInterval": 30000,
  "miyabi.enableNotifications": true
}
```

## 🎯 Usage

### Access Miyabi Views

1. Click the **Miyabi icon** (cherry blossom) in the Activity Bar (left sidebar)

2. You'll see three views:
   - **Issues** - All GitHub issues with state icons
   - **Agents** - All 21 agents with live status
   - **Project Status** - Repository metrics

### Open Dashboard

**Method 1: Command Palette**
- Press `Cmd+Shift+P`
- Type: `Miyabi: Open Dashboard`
- Press Enter

**Method 2: Context Menu**
- Right-click in any Miyabi view
- Click "Open Dashboard"

**Method 3: View Title Button**
- Click the dashboard icon in the Agents view title bar

### Refresh Data

**Auto Refresh:**
- WebSocket updates happen in real-time
- Views auto-refresh every 30 seconds

**Manual Refresh:**
- Press `Cmd+Shift+P`
- Type: `Miyabi: Refresh Issues`
- Or click the refresh button in the view title bar

## 🔧 Features

### 1. Issue Explorer

- View all GitHub issues
- Color-coded status icons:
  - ✅ Done (green check)
  - 🔄 In Progress (blue spinning)
  - ⚠️ Blocked (red warning)
  - 📥 Pending (gray circle)
- Click any issue to open in browser

### 2. Agent Monitor

- View all 21 agents:
  - 🔴 Leaders (2): しきるん, あきんどさん
  - 🟢 Executors (12): つくるん, めだまん, かくちゃん, etc.
  - 🔵 Analysts (5): みつけるん, しらべるん, かぞえるん, etc.
  - 🟡 Support (3): まとめるん, はこぶん, つなぐん
- Live progress indicators (0-100%)
- Current issue assignment
- Status: idle | running | completed | error

### 3. Project Status

- Repository owner/name
- Total issue count
- Issues by state breakdown
- Active agent count
- Blocked issue alerts

### 4. Real-time Dashboard

- Embedded webview with full Miyabi dashboard
- Auto-refresh every 30 seconds
- Connection status indicator
- Open in external browser option

## 🐛 Troubleshooting

### Extension Not Loading

**Check:**
1. VS Code version >= 1.85.0
2. VSIX installed correctly (check Extensions view)
3. No conflicting extensions

**Solution:**
```bash
# Reload VS Code
Cmd+Shift+P → "Developer: Reload Window"
```

### Server Connection Error

**Check:**
1. Dashboard server is running: `npm run dashboard:server`
2. Server URL in settings: `http://localhost:3001`
3. No firewall blocking port 3001

**Solution:**
```bash
# Restart server
npm run dashboard:server

# Check server logs for errors
```

### No Issues Showing

**Check:**
1. GitHub token configured in `.miyabi.yml`
2. Repository set correctly
3. Internet connection active

**Solution:**
```bash
# Test API manually
curl http://localhost:3001/api/status
curl http://localhost:3001/api/graph
```

### WebSocket Not Connecting

**Check:**
1. Server supports WebSocket (it should by default)
2. No proxy blocking WebSocket connections
3. Firewall allows WebSocket

**Solution:**
- Extension will automatically fall back to HTTP polling
- Check server logs for WebSocket errors

## 📊 Commands

All available commands (access via `Cmd+Shift+P`):

| Command | Description |
|---------|-------------|
| `Miyabi: Open Dashboard` | Open dashboard in panel |
| `Miyabi: Refresh Issues` | Manually refresh issue list |
| `Miyabi: Refresh Agents` | Manually refresh agent list |
| `Miyabi: Refresh Status` | Manually refresh project status |
| `Miyabi: Run Agent` | Trigger specific agent |
| `Miyabi: Open Settings` | Open Miyabi settings |

## 🔄 Uninstall

1. Open Extensions view (`Cmd+Shift+X`)
2. Find "Miyabi - Autonomous Development Assistant"
3. Click gear icon → "Uninstall"
4. Reload VS Code

Or via command line:
```bash
code --uninstall-extension miyabi.miyabi-vscode
```

## 📚 More Information

- **Documentation:** [README.md](./README.md)
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)
- **Repository:** https://github.com/ShunsukeHayashi/Miyabi
- **Issues:** https://github.com/ShunsukeHayashi/Miyabi/issues

## 🎉 Quick Test

After installation:

1. **Start server:**
   ```bash
   npm run dashboard:server
   ```

2. **Open extension:**
   - Click Miyabi icon in Activity Bar
   - Should see 48 issues loaded

3. **Open dashboard:**
   - `Cmd+Shift+P` → "Miyabi: Open Dashboard"
   - Should see interactive dashboard

4. **Verify WebSocket:**
   - Connection indicator should be green
   - Changes should update in real-time

**Success!** You're now monitoring Miyabi agents in VS Code!

---

🌸 **Miyabi VS Code Extension** - Autonomous Development in Your Editor
