/**
 * Miyabi VS Code Extension
 *
 * Provides real-time visualization and management of Miyabi autonomous development platform
 */

import * as vscode from 'vscode';
import { IssueTreeProvider } from './providers/IssueTreeProvider';
import { AgentTreeProvider } from './providers/AgentTreeProvider';
import { StatusTreeProvider } from './providers/StatusTreeProvider';
import { DashboardWebviewProvider } from './views/DashboardWebview';
import { MiyabiClient } from './utils/MiyabiClient';

let miyabiClient: MiyabiClient;
let issueTreeProvider: IssueTreeProvider;
let agentTreeProvider: AgentTreeProvider;
let statusTreeProvider: StatusTreeProvider;
let statusBarItem: vscode.StatusBarItem;
let connectionStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('Miyabi extension is now active!');

  // Initialize Miyabi client
  const config = vscode.workspace.getConfiguration('miyabi');
  const serverUrl = config.get<string>('serverUrl') || 'http://localhost:3001';
  miyabiClient = new MiyabiClient(serverUrl);

  // Create status bar items
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'miyabi.showStatus';
  statusBarItem.tooltip = 'Click to view Miyabi project status';
  context.subscriptions.push(statusBarItem);

  connectionStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  connectionStatusBarItem.command = 'miyabi.openDashboard';
  connectionStatusBarItem.tooltip = 'Miyabi Dashboard Connection';
  context.subscriptions.push(connectionStatusBarItem);

  // Initialize status bar
  updateStatusBar();

  // Register Tree View Providers
  issueTreeProvider = new IssueTreeProvider(miyabiClient);
  agentTreeProvider = new AgentTreeProvider(miyabiClient);
  statusTreeProvider = new StatusTreeProvider(miyabiClient);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('miyabiIssues', issueTreeProvider),
    vscode.window.registerTreeDataProvider('miyabiAgents', agentTreeProvider),
    vscode.window.registerTreeDataProvider('miyabiStatus', statusTreeProvider)
  );

  // Register Webview Provider
  const dashboardProvider = new DashboardWebviewProvider(context.extensionUri, miyabiClient);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('miyabiDashboard', dashboardProvider)
  );

  // Register Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('miyabi.init', async () => {
      await initializeMiyabiProject();
    }),

    vscode.commands.registerCommand('miyabi.openDashboard', () => {
      DashboardWebviewProvider.createOrShow(context.extensionUri, miyabiClient);
    }),

    vscode.commands.registerCommand('miyabi.refreshIssues', () => {
      issueTreeProvider.refresh();
    }),

    vscode.commands.registerCommand('miyabi.runAgent', async (issueNumber?: number) => {
      const issue = issueNumber || await promptForIssueNumber();
      if (issue) {
        await runAgent(issue);
      }
    }),

    vscode.commands.registerCommand('miyabi.showStatus', async () => {
      const status = await miyabiClient.getStatus();
      vscode.window.showInformationMessage(
        `Miyabi Status: ${status.summary.totalOpen} open issues, ${status.summary.activeAgents} active agents`
      );
    }),

    vscode.commands.registerCommand('miyabi.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'miyabi');
    }),

    // Issue context menu commands
    vscode.commands.registerCommand('miyabi.issue.runAgent', async (issueItem: any) => {
      if (issueItem && issueItem.issue) {
        await runAgent(issueItem.issue.number);
      }
    }),

    vscode.commands.registerCommand('miyabi.issue.openInBrowser', (issueItem: any) => {
      if (issueItem && issueItem.issue) {
        vscode.env.openExternal(vscode.Uri.parse(issueItem.issue.url));
      }
    }),

    vscode.commands.registerCommand('miyabi.issue.copyUrl', async (issueItem: any) => {
      if (issueItem && issueItem.issue) {
        await vscode.env.clipboard.writeText(issueItem.issue.url);
        vscode.window.showInformationMessage(`Copied URL for issue #${issueItem.issue.number}`);
      }
    }),

    vscode.commands.registerCommand('miyabi.issue.copyNumber', async (issueItem: any) => {
      if (issueItem && issueItem.issue) {
        await vscode.env.clipboard.writeText(issueItem.issue.number.toString());
        vscode.window.showInformationMessage(`Copied issue number: ${issueItem.issue.number}`);
      }
    }),

    // Agent context menu commands
    vscode.commands.registerCommand('miyabi.agent.start', async (agentItem: any) => {
      if (agentItem && agentItem.agent) {
        const issueNumber = await promptForIssueNumber();
        if (issueNumber) {
          try {
            await miyabiClient.runAgent(agentItem.agent.agentId, issueNumber);
            vscode.window.showInformationMessage(
              `Started ${agentItem.agent.agentId} agent on issue #${issueNumber}`
            );
            agentTreeProvider.refresh();
          } catch (error) {
            vscode.window.showErrorMessage(
              `Failed to start agent: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }
      }
    }),

    vscode.commands.registerCommand('miyabi.agent.viewLogs', (agentItem: any) => {
      if (agentItem && agentItem.agent) {
        vscode.window.showInformationMessage(
          `View logs for ${agentItem.agent.agentId} (Coming soon: Integration with Output panel)`
        );
      }
    }),

    // Status context menu commands
    vscode.commands.registerCommand('miyabi.status.refresh', () => {
      statusTreeProvider.refresh();
      vscode.window.showInformationMessage('Status refreshed');
    }),

    vscode.commands.registerCommand('miyabi.status.openRepository', async () => {
      try {
        const status = await miyabiClient.getStatus();
        vscode.env.openExternal(vscode.Uri.parse(status.repository.url));
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to open repository: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

    // Issues filter & sort commands
    vscode.commands.registerCommand('miyabi.issues.filterByState', async () => {
      const states = [
        { label: '🌐 All Issues', value: 'all' },
        { label: '⏸️ Pending', value: 'pending' },
        { label: '⚙️ Implementing', value: 'implementing' },
        { label: '🔍 Reviewing', value: 'reviewing' },
        { label: '✅ Done', value: 'done' },
        { label: '🚫 Blocked', value: 'blocked' },
      ];

      const selected = await vscode.window.showQuickPick(states, {
        placeHolder: 'Filter issues by state',
      });

      if (selected) {
        issueTreeProvider.setFilter(selected.value as any);
        vscode.window.showInformationMessage(`Filtered by state: ${selected.label}`);
      }
    }),

    vscode.commands.registerCommand('miyabi.issues.filterByPriority', async () => {
      const priorities = [
        { label: '🌐 All Priorities', value: null },
        { label: '🔥 P0 - Critical', value: 'P0' },
        { label: '🔴 P1 - High', value: 'P1' },
        { label: '🟡 P2 - Medium', value: 'P2' },
        { label: '🟢 P3 - Low', value: 'P3' },
      ];

      const selected = await vscode.window.showQuickPick(priorities, {
        placeHolder: 'Filter issues by priority',
      });

      if (selected) {
        issueTreeProvider.setPriorityFilter(selected.value);
        vscode.window.showInformationMessage(
          `Filtered by priority: ${selected.label}`
        );
      }
    }),

    vscode.commands.registerCommand('miyabi.issues.sortBy', async () => {
      const sortOptions = [
        { label: '🔥 Priority (High to Low)', value: 'priority' },
        { label: '🔢 Issue Number (Newest first)', value: 'number' },
        { label: '📊 State (Blocked first)', value: 'state' },
      ];

      const selected = await vscode.window.showQuickPick(sortOptions, {
        placeHolder: 'Sort issues by',
      });

      if (selected) {
        issueTreeProvider.setSortBy(selected.value as any);
        vscode.window.showInformationMessage(`Sorted by: ${selected.label}`);
      }
    }),

    vscode.commands.registerCommand('miyabi.issues.clearFilters', () => {
      issueTreeProvider.clearFilters();
      vscode.window.showInformationMessage('All filters cleared');
    }),

    vscode.commands.registerCommand('miyabi.issues.showFilterInfo', () => {
      const info = issueTreeProvider.getFilterInfo();
      vscode.window.showInformationMessage(`Current filters: ${info}`);
    })
  );

  // Auto-refresh if enabled
  const autoRefresh = config.get<boolean>('autoRefresh');
  if (autoRefresh) {
    const interval = config.get<number>('refreshInterval') || 60000;
    setInterval(() => {
      issueTreeProvider.refresh();
      agentTreeProvider.refresh();
      statusTreeProvider.refresh();
    }, interval);
  }

  // Connect to WebSocket for real-time updates
  miyabiClient.connect();

  // Connection status events
  miyabiClient.on('connected', () => {
    connectionStatusBarItem.text = '$(check) Miyabi';
    connectionStatusBarItem.backgroundColor = undefined;
    connectionStatusBarItem.show();
    showNotification('Connected to Miyabi Dashboard', 'info');
  });

  miyabiClient.on('disconnected', () => {
    connectionStatusBarItem.text = '$(x) Miyabi Disconnected';
    connectionStatusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    connectionStatusBarItem.show();
  });

  // Real-time update events with notifications
  miyabiClient.on('issue:update', (data: any) => {
    issueTreeProvider.refresh();
    updateStatusBar();
    if (data?.message) {
      showNotification(`Issue Updated: ${data.message}`, 'info');
    }
  });

  miyabiClient.on('agent:update', (data: any) => {
    agentTreeProvider.refresh();
    updateStatusBar();

    if (data?.agentId && data?.status) {
      const emoji = data.status === 'completed' ? '✅' : data.status === 'error' ? '❌' : '🤖';
      showNotification(
        `${emoji} Agent ${data.agentId}: ${data.status}`,
        data.status === 'error' ? 'warning' : 'info'
      );
    }
  });

  miyabiClient.on('status:update', (data: any) => {
    statusTreeProvider.refresh();
    updateStatusBar();
  });

  // Show welcome message
  vscode.window.showInformationMessage('Miyabi extension activated!');
}

// Helper function to show notifications based on settings
function showNotification(message: string, type: 'info' | 'warning' | 'error' = 'info') {
  const config = vscode.workspace.getConfiguration('miyabi');
  const enableNotifications = config.get<boolean>('enableNotifications', true);

  if (!enableNotifications) {
    return;
  }

  switch (type) {
    case 'warning':
      vscode.window.showWarningMessage(message);
      break;
    case 'error':
      vscode.window.showErrorMessage(message);
      break;
    case 'info':
    default:
      vscode.window.showInformationMessage(message);
      break;
  }
}

// Helper function to update status bar
async function updateStatusBar() {
  try {
    const status = await miyabiClient.getStatus();

    // Update main status bar item
    const activeAgents = status.summary.activeAgents;
    const openIssues = status.summary.totalOpen;
    const blocked = status.summary.blocked;

    let statusText = `$(rocket) Miyabi: ${openIssues} issues`;

    if (activeAgents > 0) {
      statusText += ` • $(sync~spin) ${activeAgents} active`;
    }

    if (blocked > 0) {
      statusText += ` • $(warning) ${blocked} blocked`;
      statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      statusBarItem.backgroundColor = undefined;
    }

    statusBarItem.text = statusText;
    statusBarItem.show();
  } catch (error) {
    statusBarItem.text = '$(warning) Miyabi: Connection Error';
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    statusBarItem.show();
  }
}

export function deactivate() {
  if (miyabiClient) {
    miyabiClient.disconnect();
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
  if (connectionStatusBarItem) {
    connectionStatusBarItem.dispose();
  }
}

async function promptForIssueNumber(): Promise<number | undefined> {
  const input = await vscode.window.showInputBox({
    prompt: 'Enter issue number to run agent',
    placeHolder: '123',
    validateInput: (value) => {
      const num = parseInt(value, 10);
      return isNaN(num) ? 'Please enter a valid number' : null;
    }
  });

  return input ? parseInt(input, 10) : undefined;
}

async function runAgent(issueNumber: number) {
  const agentTypes = [
    'coordinator',
    'codegen',
    'review',
    'issue',
    'pr',
    'deployment',
    'test'
  ];

  const selectedAgent = await vscode.window.showQuickPick(agentTypes, {
    placeHolder: 'Select agent type to run',
    canPickMany: false
  });

  if (!selectedAgent) {
    return;
  }

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Notification,
    title: `Running ${selectedAgent} agent on issue #${issueNumber}`,
    cancellable: false
  }, async (progress) => {
    try {
      progress.report({ increment: 0 });

      // TODO: Implement actual agent execution via Miyabi client
      await miyabiClient.runAgent(selectedAgent, issueNumber);

      progress.report({ increment: 100 });
      vscode.window.showInformationMessage(
        `Agent ${selectedAgent} started on issue #${issueNumber}`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to run agent: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}

async function initializeMiyabiProject() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder found. Please open a folder first.');
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const fs = await import('fs');
  const path = await import('path');
  const configPath = path.join(rootPath, '.miyabi.yml');

  // Check if .miyabi.yml already exists
  if (fs.existsSync(configPath)) {
    const overwrite = await vscode.window.showWarningMessage(
      '.miyabi.yml already exists. Do you want to overwrite it?',
      'Yes', 'No'
    );
    if (overwrite !== 'Yes') {
      return;
    }
  }

  // Get GitHub token
  const githubToken = await vscode.window.showInputBox({
    prompt: 'Enter your GitHub Personal Access Token (required for Miyabi)',
    placeHolder: 'ghp_xxxxxxxxxxxxx',
    password: true,
    ignoreFocusOut: true,
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'GitHub token is required';
      }
      if (!value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
        return 'Invalid GitHub token format';
      }
      return null;
    }
  });

  if (!githubToken) {
    vscode.window.showErrorMessage('GitHub token is required to initialize Miyabi');
    return;
  }

  // Get repository info from git config
  const terminal = vscode.window.createTerminal({ name: 'Miyabi Init', cwd: rootPath });

  try {
    // Create .miyabi.yml with template
    const config = `# Miyabi Configuration File
# This file defines the settings for Miyabi autonomous development platform

# GitHub Repository Configuration
github:
  # Note: For security, set GITHUB_TOKEN in environment variables
  # GITHUB_TOKEN should never be committed to the repository
  token: \${GITHUB_TOKEN}

  # Repository information (will be auto-detected from git config)
  repository:
    owner: ""  # Will be filled automatically
    name: ""   # Will be filled automatically

# Agent Configuration
agents:
  enabled: true
  concurrency: 3  # Number of parallel agent executions

  # Agent types to enable
  types:
    - coordinator
    - codegen
    - review
    - issue
    - pr
    - deployment

# Worktree Configuration
worktrees:
  enabled: true
  basePath: ".worktrees"

# Dashboard Configuration
dashboard:
  enabled: true
  port: 3001
  autoStart: true

# Notification Settings
notifications:
  enabled: true
  channels:
    - vscode
    - github

# Logging
logging:
  level: info
  output: ".miyabi/logs"
`;

    fs.writeFileSync(configPath, config, 'utf-8');

    // Store GitHub token in environment
    await vscode.window.showInformationMessage(
      'Miyabi project initialized successfully! Please set GITHUB_TOKEN environment variable.',
      'Open Settings'
    ).then((selection) => {
      if (selection === 'Open Settings') {
        vscode.commands.executeCommand('miyabi.openSettings');
      }
    });

    // Open the created config file
    const doc = await vscode.workspace.openTextDocument(configPath);
    await vscode.window.showTextDocument(doc);

  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to initialize Miyabi project: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
