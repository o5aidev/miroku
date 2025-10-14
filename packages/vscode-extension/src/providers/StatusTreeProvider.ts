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
          new StatusTreeItem('Repository', `${status.repository.owner}/${status.repository.name}`, 'repo'),
          new StatusTreeItem('Total Issues', status.issues.total.toString(), 'issues'),
          new StatusTreeItem('Open Issues', status.summary.totalOpen.toString(), 'issue-opened'),
          new StatusTreeItem('Active Agents', status.summary.activeAgents.toString(), 'robot'),
          new StatusTreeItem('Blocked', status.summary.blocked.toString(), 'warning'),
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
    iconName: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.description = value;
    this.iconPath = new vscode.ThemeIcon(iconName);
    this.contextValue = 'miyabiStatus';
  }
}
