/**
 * Status Tree Provider - Display project status in VS Code sidebar
 */

import * as vscode from 'vscode';
import { MiyabiClient, MiyabiStatus } from '../utils/MiyabiClient';

export class StatusTreeProvider implements vscode.TreeDataProvider<StatusTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<StatusTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: MiyabiClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: StatusTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: StatusTreeItem): Promise<StatusTreeItem[]> {
    if (!element) {
      // Root level - fetch status
      try {
        const status = await this.client.getStatus();
        return [
          new StatusTreeItem('Repository', `${status.repository.owner}/${status.repository.name}`, 'repo', 'repository'),
          new StatusTreeItem('Total Issues', status.issues.total.toString(), 'issues', 'total-issues'),
          new StatusTreeItem('Open Issues', status.summary.totalOpen.toString(), 'issue-opened', 'open-issues'),
          new StatusTreeItem('Active Agents', status.summary.activeAgents.toString(), 'robot', 'active-agents'),
          new StatusTreeItem('Blocked', status.summary.blocked.toString(), 'warning', 'blocked'),
        ];
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fetch status: ${error instanceof Error ? error.message : String(error)}`
        );
        return [];
      }
    }

    return [];
  }
}

export class StatusTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly value: string,
    iconName: string,
    private readonly type?: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.description = value;
    this.iconPath = this.getIcon(iconName);
    this.tooltip = this.getTooltip();
    this.contextValue = 'miyabiStatus';
  }

  private getIcon(iconName: string): vscode.ThemeIcon {
    const numValue = parseInt(this.value, 10);

    // Color-code based on value and type
    if (this.type === 'blocked' && numValue > 0) {
      return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.red'));
    }

    if (this.type === 'active-agents') {
      if (numValue > 0) {
        return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.green'));
      }
      return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.gray'));
    }

    if (this.type === 'open-issues') {
      if (numValue > 20) {
        return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.orange'));
      }
      if (numValue > 0) {
        return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.yellow'));
      }
      return new vscode.ThemeIcon(iconName, new vscode.ThemeColor('charts.green'));
    }

    return new vscode.ThemeIcon(iconName);
  }

  private getTooltip(): vscode.MarkdownString {
    const md = new vscode.MarkdownString();
    md.supportHtml = true;
    md.isTrusted = true;

    md.appendMarkdown(`### ${this.label}\n\n`);
    md.appendMarkdown(`**Value:** ${this.value}\n\n`);

    // Add context-specific information
    if (this.type === 'blocked') {
      if (parseInt(this.value, 10) > 0) {
        md.appendMarkdown(`⚠️ _There are blocked issues that need attention_\n`);
      } else {
        md.appendMarkdown(`✅ _No blocked issues_\n`);
      }
    }

    if (this.type === 'active-agents') {
      if (parseInt(this.value, 10) > 0) {
        md.appendMarkdown(`🟢 _Agents are currently working_\n`);
      } else {
        md.appendMarkdown(`⚪ _All agents are idle_\n`);
      }
    }

    return md;
  }
}
