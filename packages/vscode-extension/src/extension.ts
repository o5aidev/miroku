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

export function activate(context: vscode.ExtensionContext) {
  console.log('Miyabi extension is now active!');

  // Initialize Miyabi client
  const config = vscode.workspace.getConfiguration('miyabi');
  const serverUrl = config.get<string>('serverUrl') || 'http://localhost:3001';
  miyabiClient = new MiyabiClient(serverUrl);

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
    })
  );

  // Auto-refresh if enabled
  const autoRefresh = config.get<boolean>('autoRefresh');
  if (autoRefresh) {
    const interval = config.get<number>('refreshInterval') || 5000;
    setInterval(() => {
      issueTreeProvider.refresh();
      agentTreeProvider.refresh();
      statusTreeProvider.refresh();
    }, interval);
  }

  // Connect to WebSocket for real-time updates
  miyabiClient.connect();
  miyabiClient.on('issue:update', () => issueTreeProvider.refresh());
  miyabiClient.on('agent:update', () => agentTreeProvider.refresh());
  miyabiClient.on('status:update', () => statusTreeProvider.refresh());

  // Show welcome message
  vscode.window.showInformationMessage('Miyabi extension activated!');
}

export function deactivate() {
  if (miyabiClient) {
    miyabiClient.disconnect();
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
