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

  private getTooltip(): string {
    const { agent } = this;
    return [
      `Agent: ${agent.agentId}`,
      `Status: ${agent.status}`,
      `Progress: ${agent.progress}%`,
      agent.currentIssue ? `Current Issue: #${agent.currentIssue}` : 'No active issue',
    ].join('\n');
  }

  private getDescription(): string {
    const { agent } = this;
    const parts: string[] = [];

    parts.push(agent.status);

    if (agent.currentIssue) {
      parts.push(`#${agent.currentIssue}`);
    }

    if (agent.status === 'running' && agent.progress > 0) {
      parts.push(`${agent.progress}%`);
    }

    return parts.join(' • ');
  }

  private getIcon(): vscode.ThemeIcon {
    const { agent } = this;

    switch (agent.status) {
      case 'running':
        return new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('charts.blue'));
      case 'completed':
        return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      case 'error':
        return new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
      case 'idle':
      default:
        return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
    }
  }
}
