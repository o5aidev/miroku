/**
 * Issue Tree Provider - Display GitHub Issues in VS Code sidebar
 */

import * as vscode from 'vscode';
import { MiyabiClient, MiyabiIssue } from '../utils/MiyabiClient';

export class IssueTreeProvider implements vscode.TreeDataProvider<IssueTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<IssueTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private client: MiyabiClient) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: IssueTreeItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: IssueTreeItem): Promise<IssueTreeItem[]> {
    if (!element) {
      // Root level - fetch issues
      try {
        const issues = await this.client.getIssues();
        return issues.map(issue => new IssueTreeItem(issue));
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to fetch issues: ${error instanceof Error ? error.message : String(error)}`
        );
        return [];
      }
    }

    return [];
  }
}

export class IssueTreeItem extends vscode.TreeItem {
  constructor(public readonly issue: MiyabiIssue) {
    super(
      `#${issue.number}: ${issue.title}`,
      vscode.TreeItemCollapsibleState.None
    );

    this.tooltip = this.getTooltip();
    this.description = this.getDescription();
    this.iconPath = this.getIcon();
    this.contextValue = 'miyabiIssue';

    // Open issue URL on click
    this.command = {
      command: 'vscode.open',
      title: 'Open Issue',
      arguments: [vscode.Uri.parse(issue.url)]
    };
  }

  private getTooltip(): string {
    const { issue } = this;
    return [
      `Issue #${issue.number}`,
      `State: ${issue.state}`,
      `Priority: ${issue.priority || 'Not set'}`,
      `Agents: ${issue.assignedAgents.join(', ') || 'None'}`,
      `Labels: ${issue.labels.join(', ')}`,
    ].join('\n');
  }

  private getDescription(): string {
    const { issue } = this;
    const parts: string[] = [];

    if (issue.state) {
      parts.push(issue.state);
    }

    if (issue.assignedAgents.length > 0) {
      parts.push(`👤 ${issue.assignedAgents.length}`);
    }

    return parts.join(' • ');
  }

  private getIcon(): vscode.ThemeIcon {
    const { issue } = this;

    // Icon based on state
    if (issue.state.includes('done')) {
      return new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));
    }
    if (issue.state.includes('error') || issue.state.includes('blocked')) {
      return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
    }
    if (issue.state.includes('implementing') || issue.state.includes('analyzing')) {
      return new vscode.ThemeIcon('sync~spin', new vscode.ThemeColor('testing.iconQueued'));
    }

    return new vscode.ThemeIcon('issue-opened');
  }
}
