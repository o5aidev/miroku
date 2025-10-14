/**
 * Agent Tree Provider - Display Agent status in VS Code sidebar
 */

import * as vscode from 'vscode';
import { MiyabiClient, MiyabiAgent } from '../utils/MiyabiClient';

export class AgentTreeProvider implements vscode.TreeDataProvider<AgentTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: MiyabiClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AgentTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AgentTreeItem): Promise<AgentTreeItem[]> {
    if (!element) {
      // Root level - fetch agents
      try {
        const agents = await this.client.getAgents();
        return agents.map(agent => new AgentTreeItem(agent));
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fetch agents: ${error instanceof Error ? error.message : String(error)}`
        );
        return [];
      }
    }

    return [];
  }
}

export class AgentTreeItem extends vscode.TreeItem {
  constructor(public readonly agent: MiyabiAgent) {
    super(
      agent.agentId,
      vscode.TreeItemCollapsibleState.None
    );

    this.tooltip = this.getTooltip();
    this.description = this.getDescription();
    this.iconPath = this.getIcon();
    this.contextValue = 'miyabiAgent';
  }

  private getTooltip(): vscode.MarkdownString {
    const { agent } = this;
    const md = new vscode.MarkdownString();
    md.supportHtml = true;
    md.isTrusted = true;

    // Build rich tooltip
    md.appendMarkdown(`### ${this.getAgentDisplayName()}\n\n`);
    md.appendMarkdown(`---\n\n`);
    md.appendMarkdown(`**Status:** ${this.getStatusBadge()}\n\n`);

    if (agent.status === 'running' && agent.progress > 0) {
      md.appendMarkdown(`**Progress:** ${this.getProgressBar()}\n\n`);
    }

    if (agent.currentIssue) {
      md.appendMarkdown(`**Current Issue:** [#${agent.currentIssue}](https://github.com/ShunsukeHayashi/Miyabi/issues/${agent.currentIssue})\n\n`);
    } else {
      md.appendMarkdown(`**Current Issue:** _None_\n\n`);
    }

    md.appendMarkdown(`\n${this.getAgentDescription()}`);

    return md;
  }

  private getAgentDisplayName(): string {
    const names: Record<string, string> = {
      'coordinator': '🎯 Coordinator Agent',
      'codegen': '✍️ Code Generation Agent',
      'review': '🔍 Code Review Agent',
      'issue': '📋 Issue Analysis Agent',
      'pr': '🔀 Pull Request Agent',
      'deployment': '🚀 Deployment Agent',
      'test': '🧪 Test Agent',
    };
    return names[this.agent.agentId] || this.agent.agentId;
  }

  private getStatusBadge(): string {
    const { agent } = this;
    switch (agent.status) {
      case 'running':
        return '🟢 **Running**';
      case 'completed':
        return '✅ **Completed**';
      case 'error':
        return '❌ **Error**';
      case 'idle':
      default:
        return '⚪ **Idle**';
    }
  }

  private getProgressBar(): string {
    const { agent } = this;
    const filled = Math.floor(agent.progress / 10);
    const empty = 10 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `\`${bar}\` ${agent.progress}%`;
  }

  private getAgentDescription(): string {
    const descriptions: Record<string, string> = {
      'coordinator': '_Coordinates tasks and manages workflow_',
      'codegen': '_Generates code based on requirements_',
      'review': '_Reviews code quality and security_',
      'issue': '_Analyzes and processes issues_',
      'pr': '_Creates and manages pull requests_',
      'deployment': '_Handles deployment processes_',
      'test': '_Runs and manages tests_',
    };
    return descriptions[this.agent.agentId] || '';
  }

  private getDescription(): string {
    const { agent } = this;
    const parts: string[] = [];

    // Add status with emoji
    const statusEmoji = this.getStatusEmoji(agent.status);
    parts.push(`${statusEmoji} ${agent.status}`);

    // Add current issue
    if (agent.currentIssue) {
      parts.push(`📝 #${agent.currentIssue}`);
    }

    // Add progress bar for running agents
    if (agent.status === 'running' && agent.progress > 0) {
      const progressBar = this.getInlineProgressBar(agent.progress);
      parts.push(`${progressBar} ${agent.progress}%`);
    }

    return parts.join(' • ');
  }

  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'running':
        return '🟢';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      case 'idle':
      default:
        return '⚪';
    }
  }

  private getInlineProgressBar(progress: number): string {
    const blocks = Math.floor(progress / 20); // 5 blocks total
    const filled = '█'.repeat(blocks);
    const empty = '░'.repeat(5 - blocks);
    return filled + empty;
  }

  private getIcon(): vscode.ThemeIcon {
    const { agent } = this;

    // Get color based on status
    let iconColor: vscode.ThemeColor;
    let iconSuffix = '';

    switch (agent.status) {
      case 'running':
        iconColor = new vscode.ThemeColor('charts.blue');
        iconSuffix = '~spin';
        break;
      case 'completed':
        iconColor = new vscode.ThemeColor('charts.green');
        break;
      case 'error':
        iconColor = new vscode.ThemeColor('charts.red');
        break;
      case 'idle':
      default:
        iconColor = new vscode.ThemeColor('foreground');
        break;
    }

    // Get icon based on agent type
    const icons: Record<string, string> = {
      'coordinator': 'organization',
      'codegen': 'code',
      'review': 'checklist',
      'issue': 'issue-draft',
      'pr': 'git-pull-request',
      'deployment': 'rocket',
      'test': 'beaker',
    };

    const iconName = icons[agent.agentId] || 'robot';
    return new vscode.ThemeIcon(iconName + iconSuffix, iconColor);
  }
}
