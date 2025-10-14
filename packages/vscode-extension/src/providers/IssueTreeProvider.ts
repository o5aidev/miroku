/**
 * Issue Tree Provider - Display GitHub Issues in VS Code sidebar
 */

import * as vscode from 'vscode';
import { MiyabiClient, MiyabiIssue } from '../utils/MiyabiClient';

export type IssueFilter = 'all' | 'pending' | 'implementing' | 'reviewing' | 'done' | 'blocked';
export type IssueSortBy = 'number' | 'priority' | 'state';

export class IssueTreeProvider implements vscode.TreeDataProvider<IssueTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<IssueTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private currentFilter: IssueFilter = 'all';
  private currentSort: IssueSortBy = 'priority';
  private priorityFilter: string | null = null;

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
        let issues = await this.client.getIssues();

        // Apply filters
        issues = this.filterIssues(issues);

        // Apply sorting
        issues = this.sortIssues(issues);

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

  // Filter methods
  setFilter(filter: IssueFilter): void {
    this.currentFilter = filter;
    this.refresh();
  }

  setPriorityFilter(priority: string | null): void {
    this.priorityFilter = priority;
    this.refresh();
  }

  clearFilters(): void {
    this.currentFilter = 'all';
    this.priorityFilter = null;
    this.refresh();
  }

  // Sort methods
  setSortBy(sortBy: IssueSortBy): void {
    this.currentSort = sortBy;
    this.refresh();
  }

  // Get current filter info
  getFilterInfo(): string {
    const parts: string[] = [];

    if (this.currentFilter !== 'all') {
      parts.push(`State: ${this.currentFilter}`);
    }

    if (this.priorityFilter) {
      parts.push(`Priority: ${this.priorityFilter}`);
    }

    parts.push(`Sort: ${this.currentSort}`);

    return parts.length > 0 ? parts.join(' | ') : 'All issues';
  }

  private filterIssues(issues: MiyabiIssue[]): MiyabiIssue[] {
    let filtered = issues;

    // State filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(issue => {
        const state = issue.state.toLowerCase();
        switch (this.currentFilter) {
          case 'pending':
            return state.includes('pending');
          case 'implementing':
            return state.includes('implementing');
          case 'reviewing':
            return state.includes('reviewing');
          case 'done':
            return state.includes('done') || state.includes('completed');
          case 'blocked':
            return state.includes('blocked') || state.includes('error');
          default:
            return true;
        }
      });
    }

    // Priority filter
    if (this.priorityFilter) {
      filtered = filtered.filter(issue => {
        return issue.priority?.includes(this.priorityFilter!);
      });
    }

    return filtered;
  }

  private sortIssues(issues: MiyabiIssue[]): MiyabiIssue[] {
    const sorted = [...issues];

    switch (this.currentSort) {
      case 'number':
        sorted.sort((a, b) => b.number - a.number); // Descending
        break;

      case 'priority':
        sorted.sort((a, b) => {
          const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
          const getPriority = (issue: MiyabiIssue) => {
            if (!issue.priority) return 999;
            if (issue.priority.includes('P0')) return priorityOrder.P0;
            if (issue.priority.includes('P1')) return priorityOrder.P1;
            if (issue.priority.includes('P2')) return priorityOrder.P2;
            if (issue.priority.includes('P3')) return priorityOrder.P3;
            return 999;
          };
          return getPriority(a) - getPriority(b);
        });
        break;

      case 'state':
        sorted.sort((a, b) => {
          const stateOrder = {
            'blocked': 0,
            'error': 1,
            'implementing': 2,
            'analyzing': 3,
            'reviewing': 4,
            'pending': 5,
            'done': 6
          };
          const getStateOrder = (state: string) => {
            const lowerState = state.toLowerCase();
            for (const [key, value] of Object.entries(stateOrder)) {
              if (lowerState.includes(key)) return value;
            }
            return 999;
          };
          return getStateOrder(a.state) - getStateOrder(b.state);
        });
        break;
    }

    return sorted;
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

  private getTooltip(): vscode.MarkdownString {
    const { issue } = this;
    const md = new vscode.MarkdownString();
    md.supportHtml = true;
    md.isTrusted = true;

    // Build rich tooltip with Markdown
    md.appendMarkdown(`### Issue #${issue.number}\n\n`);
    md.appendMarkdown(`**${issue.title}**\n\n`);
    md.appendMarkdown(`---\n\n`);
    md.appendMarkdown(`**State:** \`${issue.state}\`\n\n`);
    md.appendMarkdown(`**Priority:** ${this.getPriorityBadge()}\n\n`);

    if (issue.assignedAgents.length > 0) {
      md.appendMarkdown(`**Agents:** ${issue.assignedAgents.map(a => `\`${a}\``).join(', ')}\n\n`);
    } else {
      md.appendMarkdown(`**Agents:** _None assigned_\n\n`);
    }

    if (issue.labels.length > 0) {
      md.appendMarkdown(`**Labels:**\n`);
      issue.labels.forEach(label => {
        const emoji = this.getLabelEmoji(label);
        md.appendMarkdown(`  ${emoji} ${label}\n`);
      });
    }

    md.appendMarkdown(`\n[Open in GitHub →](${issue.url})`);

    return md;
  }

  private getPriorityBadge(): string {
    const { issue } = this;
    if (!issue.priority) return '_Not set_';

    if (issue.priority.includes('P0') || issue.priority.includes('Critical')) {
      return '🔥 **P0 - Critical**';
    }
    if (issue.priority.includes('P1') || issue.priority.includes('High')) {
      return '🔴 **P1 - High**';
    }
    if (issue.priority.includes('P2') || issue.priority.includes('Medium')) {
      return '🟡 **P2 - Medium**';
    }
    if (issue.priority.includes('P3') || issue.priority.includes('Low')) {
      return '🟢 **P3 - Low**';
    }

    return `\`${issue.priority}\``;
  }

  private getLabelEmoji(label: string): string {
    if (label.includes('security')) return '🔐';
    if (label.includes('bug')) return '🐛';
    if (label.includes('feature')) return '✨';
    if (label.includes('docs')) return '📚';
    if (label.includes('test')) return '🧪';
    if (label.includes('performance')) return '⚡';
    if (label.includes('cost')) return '💰';
    if (label.includes('dependencies')) return '🔄';
    if (label.includes('critical')) return '🚨';
    if (label.includes('agent:')) return '🤖';
    if (label.includes('priority:')) return '📌';
    if (label.includes('state:')) return '📊';
    if (label.includes('type:')) return '🏷️';
    return '•';
  }

  private getDescription(): string {
    const { issue } = this;
    const parts: string[] = [];

    // Add priority badge first
    if (issue.priority) {
      if (issue.priority.includes('P0')) {
        parts.push('🔥 P0');
      } else if (issue.priority.includes('P1')) {
        parts.push('🔴 P1');
      } else if (issue.priority.includes('P2')) {
        parts.push('🟡 P2');
      } else if (issue.priority.includes('P3')) {
        parts.push('🟢 P3');
      }
    }

    // Add state with emoji
    if (issue.state) {
      const stateEmoji = this.getStateEmoji(issue.state);
      parts.push(`${stateEmoji} ${issue.state}`);
    }

    // Add agent count
    if (issue.assignedAgents.length > 0) {
      parts.push(`🤖 ${issue.assignedAgents.length}`);
    }

    // Add special labels
    if (issue.labels.some(l => l.includes('security'))) {
      parts.push('🔐');
    }
    if (issue.labels.some(l => l.includes('cost-watch'))) {
      parts.push('💰');
    }

    return parts.join(' • ');
  }

  private getStateEmoji(state: string): string {
    if (state.includes('done') || state.includes('completed')) return '✅';
    if (state.includes('implementing') || state.includes('running')) return '⚙️';
    if (state.includes('analyzing') || state.includes('reviewing')) return '🔍';
    if (state.includes('pending')) return '⏸️';
    if (state.includes('blocked') || state.includes('error')) return '🚫';
    return '📝';
  }

  private getIcon(): vscode.ThemeIcon {
    const { issue } = this;

    // Priority-based color (highest priority)
    let iconColor: vscode.ThemeColor | undefined;
    if (issue.priority?.includes('P0') || issue.priority?.includes('Critical')) {
      iconColor = new vscode.ThemeColor('charts.red');
    } else if (issue.priority?.includes('P1') || issue.priority?.includes('High')) {
      iconColor = new vscode.ThemeColor('charts.orange');
    } else if (issue.priority?.includes('P2') || issue.priority?.includes('Medium')) {
      iconColor = new vscode.ThemeColor('charts.yellow');
    } else if (issue.priority?.includes('P3') || issue.priority?.includes('Low')) {
      iconColor = new vscode.ThemeColor('charts.green');
    }

    // Icon based on state
    if (issue.state.includes('done') || issue.state.includes('completed')) {
      return new vscode.ThemeIcon('pass', new vscode.ThemeColor('testing.iconPassed'));
    }
    if (issue.state.includes('error')) {
      return new vscode.ThemeIcon('error', new vscode.ThemeColor('testing.iconFailed'));
    }
    if (issue.state.includes('blocked')) {
      return new vscode.ThemeIcon('circle-slash', new vscode.ThemeColor('testing.iconErrored'));
    }
    if (issue.state.includes('implementing')) {
      return new vscode.ThemeIcon('gear~spin', iconColor || new vscode.ThemeColor('charts.blue'));
    }
    if (issue.state.includes('analyzing') || issue.state.includes('reviewing')) {
      return new vscode.ThemeIcon('search~spin', iconColor || new vscode.ThemeColor('charts.purple'));
    }

    // Special label-based icons
    if (issue.labels.some(l => l.includes('security'))) {
      return new vscode.ThemeIcon('shield', new vscode.ThemeColor('charts.red'));
    }
    if (issue.labels.some(l => l.includes('bug'))) {
      return new vscode.ThemeIcon('bug', iconColor);
    }

    // Default: open issue with priority color
    return new vscode.ThemeIcon('issue-opened', iconColor);
  }
}
