/**
 * Dashboard Webview Provider - Real-time visualization of Miyabi agents and issues
 */

import * as vscode from 'vscode';
import { MiyabiClient } from '../utils/MiyabiClient';

export class DashboardWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'miyabiDashboard';
  private static currentPanel: vscode.WebviewPanel | undefined;

  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly client: MiyabiClient
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(data => {
      switch (data.type) {
        case 'refresh':
          this.client.refreshGraph();
          break;
      }
    });
  }

  /**
   * Create or show dashboard in full panel
   */
  public static createOrShow(extensionUri: vscode.Uri, client: MiyabiClient) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    // If we already have a panel, show it
    if (DashboardWebviewProvider.currentPanel) {
      DashboardWebviewProvider.currentPanel.reveal(column);
      return;
    }

    // Otherwise, create a new panel
    const panel = vscode.window.createWebviewPanel(
      DashboardWebviewProvider.viewType,
      'Miyabi Dashboard',
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true
      }
    );

    DashboardWebviewProvider.currentPanel = panel;

    // Set HTML content
    panel.webview.html = new DashboardWebviewProvider(extensionUri, client)._getHtmlForWebview(panel.webview);

    // Reset when panel is closed
    panel.onDidDispose(() => {
      DashboardWebviewProvider.currentPanel = undefined;
    }, null);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get server URL from config
    const config = vscode.workspace.getConfiguration('miyabi');
    const serverUrl = config.get<string>('serverUrl') || 'http://localhost:3001';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Miyabi Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 16px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background-color: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 12px;
      font-size: 12px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--vscode-charts-green);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .controls {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }

    button {
      padding: 6px 12px;
      background-color: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }

    button:hover {
      background-color: var(--vscode-button-hoverBackground);
    }

    .iframe-container {
      width: 100%;
      height: calc(100vh - 180px);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      overflow: hidden;
    }

    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .info-box {
      padding: 12px;
      margin-bottom: 16px;
      background-color: var(--vscode-textBlockQuote-background);
      border-left: 3px solid var(--vscode-textLink-foreground);
      border-radius: 4px;
    }

    .info-box p {
      font-size: 13px;
      line-height: 1.5;
    }

    .error-box {
      padding: 12px;
      background-color: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 4px;
      margin-bottom: 16px;
    }

    .error-box p {
      color: var(--vscode-errorForeground);
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🌸 Miyabi Dashboard</h1>
    <div class="status-badge">
      <div class="status-dot" id="statusDot"></div>
      <span id="statusText">Connected</span>
    </div>
  </div>

  <div class="controls">
    <button onclick="refreshDashboard()">🔄 Refresh</button>
    <button onclick="openExternal()">🌐 Open in Browser</button>
  </div>

  <div class="info-box">
    <p><strong>Server:</strong> ${serverUrl}</p>
    <p>Real-time visualization of Miyabi agents, issues, and project status.</p>
  </div>

  <div class="iframe-container" id="iframeContainer">
    <iframe
      id="dashboardFrame"
      src="${serverUrl}"
      sandbox="allow-scripts allow-same-origin allow-forms"
      title="Miyabi Dashboard"
    ></iframe>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    function refreshDashboard() {
      vscode.postMessage({ type: 'refresh' });
      document.getElementById('dashboardFrame').src = '${serverUrl}?t=' + Date.now();
    }

    function openExternal() {
      window.open('${serverUrl}', '_blank');
    }

    // Check connection status
    const iframe = document.getElementById('dashboardFrame');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    iframe.addEventListener('load', () => {
      statusDot.style.backgroundColor = 'var(--vscode-charts-green)';
      statusText.textContent = 'Connected';
    });

    iframe.addEventListener('error', () => {
      statusDot.style.backgroundColor = 'var(--vscode-charts-red)';
      statusText.textContent = 'Connection Error';

      document.getElementById('iframeContainer').innerHTML =
        '<div class="error-box"><p>⚠️ Failed to connect to Miyabi server at ${serverUrl}</p><p>Please ensure the server is running: <code>npm run dev:server</code></p></div>';
    });

    // Reload iframe every 30 seconds for live updates
    setInterval(() => {
      const currentSrc = iframe.src;
      iframe.src = currentSrc.split('?')[0] + '?t=' + Date.now();
    }, 30000);
  </script>
</body>
</html>`;
  }
}
