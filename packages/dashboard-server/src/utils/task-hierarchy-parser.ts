/**
 * Task Hierarchy Parser
 *
 * Parses Issue body to extract Task/Sub-task/Todo hierarchical structure.
 *
 * Supported formats:
 * 1. Markdown headings (## Task, ### Sub-task)
 * 2. Checklist (- [ ] Task)
 * 3. YAML Front Matter (requires gray-matter package)
 *
 * Usage:
 *   const parser = new TaskHierarchyParser();
 *   const hierarchy = parser.parse(issue.body, issue.number);
 */

import type {
  TaskNode,
  TaskEdge,
  TaskHierarchyData,
  TaskNodeType,
} from '../types.js';

export class TaskHierarchyParser {
  /**
   * Parse Issue body to extract Task hierarchy
   *
   * Priority:
   * 1. YAML Front Matter (if gray-matter available)
   * 2. Markdown headings
   * 3. Checklist format
   * 4. Empty hierarchy (fallback)
   */
  parse(issueBody: string | null, issueNumber: number): TaskHierarchyData {
    if (!issueBody) {
      return this.createEmptyHierarchy(issueNumber);
    }

    // Try YAML format first (if gray-matter available)
    try {
      const yamlData = this.parseYAML(issueBody, issueNumber);
      if (yamlData) {
        console.log(`✅ Parsed YAML hierarchy for Issue #${issueNumber}`);
        return yamlData;
      }
    } catch (error) {
      // gray-matter not available or parsing failed
    }

    // Try Markdown format
    const markdownData = this.parseMarkdown(issueBody, issueNumber);
    if (markdownData) {
      console.log(`✅ Parsed Markdown hierarchy for Issue #${issueNumber}`);
      return markdownData;
    }

    // Try Checklist format
    const checklistData = this.parseChecklist(issueBody, issueNumber);
    if (checklistData) {
      console.log(`✅ Parsed Checklist hierarchy for Issue #${issueNumber}`);
      return checklistData;
    }

    // No hierarchy found
    return this.createEmptyHierarchy(issueNumber);
  }

  /**
   * Parse YAML Front Matter format
   *
   * Example:
   * ---
   * tasks:
   *   - id: task-1
   *     title: Database Design
   *     subtasks:
   *       - id: subtask-1-1
   *         title: Schema Definition
   * ---
   */
  private parseYAML(body: string, issueNumber: number): TaskHierarchyData | null {
    // gray-matter is optional - if not installed, skip YAML parsing
    try {
      // Dynamic import to avoid hard dependency
      const matter = require('gray-matter');
      const { data } = matter(body);

      if (!data.tasks || !Array.isArray(data.tasks)) {
        return null;
      }

      const nodes: TaskNode[] = [];
      const edges: TaskEdge[] = [];

      data.tasks.forEach((task: any, taskIndex: number) => {
        const taskId = `issue-${issueNumber}-task-${taskIndex + 1}`;

        // Task node
        nodes.push({
          id: taskId,
          type: 'task',
          parentId: `issue-${issueNumber}`,
          position: { x: 0, y: 0 },
          data: {
            title: task.title,
            description: task.description,
            status: task.status || 'pending',
            dependencies: task.depends_on || [],
            estimatedHours: task.estimated_hours,
            tags: task.tags,
          },
        });

        // Hierarchy edge (Issue → Task)
        edges.push({
          id: `hierarchy-issue-${issueNumber}-to-${taskId}`,
          source: `issue-${issueNumber}`,
          target: taskId,
          type: 'hierarchy',
          style: {
            stroke: '#6B7280',
            strokeWidth: 2,
          },
        });

        // Dependency edges (Task → Task)
        if (task.depends_on) {
          task.depends_on.forEach((depId: string) => {
            edges.push({
              id: `dep-${taskId}-depends-${depId}`,
              source: `issue-${issueNumber}-${depId}`,
              target: taskId,
              type: 'dependency',
              label: '⚙️ depends on',
              style: {
                stroke: '#FB923C',
                strokeWidth: 2.5,
                strokeDasharray: '5,5',
              },
            });
          });
        }

        // Sub-tasks
        if (task.subtasks && Array.isArray(task.subtasks)) {
          task.subtasks.forEach((subtask: any, subtaskIndex: number) => {
            const subtaskId = `${taskId}-subtask-${subtaskIndex + 1}`;

            nodes.push({
              id: subtaskId,
              type: 'subtask',
              parentId: taskId,
              position: { x: 0, y: 0 },
              data: {
                title: subtask.title,
                status: subtask.status || 'pending',
                dependencies: subtask.depends_on || [],
              },
            });

            // Hierarchy edge (Task → Sub-task)
            edges.push({
              id: `hierarchy-${taskId}-to-${subtaskId}`,
              source: taskId,
              target: subtaskId,
              type: 'hierarchy',
              style: {
                stroke: '#6B7280',
                strokeWidth: 1.5,
              },
            });

            // Dependency edges (Sub-task → Sub-task)
            if (subtask.depends_on) {
              subtask.depends_on.forEach((depId: string) => {
                const depFullId = depId.startsWith('subtask-')
                  ? `${taskId}-${depId}`
                  : `issue-${issueNumber}-${depId}`;

                edges.push({
                  id: `dep-${subtaskId}-depends-${depFullId}`,
                  source: depFullId,
                  target: subtaskId,
                  type: 'dependency',
                  label: '⚙️',
                  style: {
                    stroke: '#FB923C',
                    strokeWidth: 2,
                    strokeDasharray: '3,3',
                  },
                });
              });
            }
          });
        }
      });

      return {
        issueId: `issue-${issueNumber}`,
        nodes,
        edges,
        metadata: this.calculateMetadata(nodes),
      };
    } catch (error) {
      // gray-matter not installed or parsing failed
      return null;
    }
  }

  /**
   * Parse Markdown format
   *
   * Example:
   * ## Task 1: Database Design
   * ### Sub-task 1.1: Schema Definition
   * ⚙️ Depends on: Task 2
   */
  private parseMarkdown(body: string, issueNumber: number): TaskHierarchyData | null {
    const nodes: TaskNode[] = [];
    const edges: TaskEdge[] = [];

    const lines = body.split('\n');
    let currentTaskId: string | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Task detection: ## Task N: Title
      const taskMatch = line.match(/^##\s+Task\s+(\d+):\s+(.+)$/i);
      if (taskMatch) {
        const taskNumber = taskMatch[1];
        const taskTitle = taskMatch[2];
        currentTaskId = `issue-${issueNumber}-task-${taskNumber}`;

        nodes.push({
          id: currentTaskId,
          type: 'task',
          parentId: `issue-${issueNumber}`,
          position: { x: 0, y: 0 },
          data: {
            title: taskTitle,
            status: 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-issue-${issueNumber}-to-${currentTaskId}`,
          source: `issue-${issueNumber}`,
          target: currentTaskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 2 },
        });

        // Check next line for dependencies
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          this.parseDependencyLine(nextLine, currentTaskId, issueNumber, edges);
        }

        continue;
      }

      // Sub-task detection: ### Sub-task N.M: Title
      const subtaskMatch = line.match(/^###\s+Sub-task\s+(\d+)\.(\d+):\s+(.+)$/i);
      if (subtaskMatch && currentTaskId) {
        const taskNumber = subtaskMatch[1];
        const subtaskNumber = subtaskMatch[2];
        const subtaskTitle = subtaskMatch[3];
        const subtaskId = `issue-${issueNumber}-task-${taskNumber}-subtask-${subtaskNumber}`;

        nodes.push({
          id: subtaskId,
          type: 'subtask',
          parentId: currentTaskId,
          position: { x: 0, y: 0 },
          data: {
            title: subtaskTitle,
            status: 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-${currentTaskId}-to-${subtaskId}`,
          source: currentTaskId,
          target: subtaskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 1.5 },
        });

        // Check next line for dependencies
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          this.parseDependencyLine(nextLine, subtaskId, issueNumber, edges);
        }
      }
    }

    return nodes.length > 0
      ? {
          issueId: `issue-${issueNumber}`,
          nodes,
          edges,
          metadata: this.calculateMetadata(nodes),
        }
      : null;
  }

  /**
   * Parse Checklist format
   *
   * Example:
   * - [ ] Task 1: Database Design
   *   - [ ] Sub-task 1.1: Schema Definition (depends on 1.2)
   */
  private parseChecklist(body: string, issueNumber: number): TaskHierarchyData | null {
    const nodes: TaskNode[] = [];
    const edges: TaskEdge[] = [];

    const lines = body.split('\n');

    for (const line of lines) {
      // Task: - [ ] Task N: Title (depends on ...)
      const taskMatch = line.match(/^-\s+\[[ x]\]\s+Task\s+(\d+):\s+(.+?)(?:\s+\(depends\s+on\s+(.+?)\))?$/i);
      if (taskMatch) {
        const taskNumber = taskMatch[1];
        const taskTitle = taskMatch[2];
        const dependsOn = taskMatch[3];

        const taskId = `issue-${issueNumber}-task-${taskNumber}`;

        nodes.push({
          id: taskId,
          type: 'task',
          parentId: `issue-${issueNumber}`,
          position: { x: 0, y: 0 },
          data: {
            title: taskTitle.trim(),
            status: line.includes('[x]') ? 'completed' : 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-issue-${issueNumber}-to-${taskId}`,
          source: `issue-${issueNumber}`,
          target: taskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 2 },
        });

        // Parse dependencies
        if (dependsOn) {
          const depNumbers = dependsOn.split(',').map((s) => s.trim().replace(/Task\s+/i, ''));
          depNumbers.forEach((depNum) => {
            const sourceId = `issue-${issueNumber}-task-${depNum}`;
            edges.push({
              id: `dep-${taskId}-depends-${sourceId}`,
              source: sourceId,
              target: taskId,
              type: 'dependency',
              label: '⚙️',
              style: {
                stroke: '#FB923C',
                strokeWidth: 2.5,
                strokeDasharray: '5,5',
              },
            });
          });
        }

        continue;
      }

      // Sub-task:   - [ ] Sub-task N.M: Title (depends on ...)
      const subtaskMatch = line.match(/^\s+-\s+\[[ x]\]\s+Sub-task\s+(\d+)\.(\d+):\s+(.+?)(?:\s+\(depends\s+on\s+(.+?)\))?$/i);
      if (subtaskMatch) {
        const taskNumber = subtaskMatch[1];
        const subtaskNumber = subtaskMatch[2];
        const subtaskTitle = subtaskMatch[3];
        const dependsOn = subtaskMatch[4];

        const subtaskId = `issue-${issueNumber}-task-${taskNumber}-subtask-${subtaskNumber}`;
        const parentTaskId = `issue-${issueNumber}-task-${taskNumber}`;

        nodes.push({
          id: subtaskId,
          type: 'subtask',
          parentId: parentTaskId,
          position: { x: 0, y: 0 },
          data: {
            title: subtaskTitle.trim(),
            status: line.includes('[x]') ? 'completed' : 'pending',
            dependencies: [],
          },
        });

        edges.push({
          id: `hierarchy-${parentTaskId}-to-${subtaskId}`,
          source: parentTaskId,
          target: subtaskId,
          type: 'hierarchy',
          style: { stroke: '#6B7280', strokeWidth: 1.5 },
        });

        // Parse dependencies
        if (dependsOn) {
          const depPattern = /(\d+)\.(\d+)/;
          const depMatch = depPattern.exec(dependsOn);
          if (depMatch) {
            const depTaskNum = depMatch[1];
            const depSubtaskNum = depMatch[2];
            const sourceId = `issue-${issueNumber}-task-${depTaskNum}-subtask-${depSubtaskNum}`;

            edges.push({
              id: `dep-${subtaskId}-depends-${sourceId}`,
              source: sourceId,
              target: subtaskId,
              type: 'dependency',
              label: '⚙️',
              style: {
                stroke: '#FB923C',
                strokeWidth: 2,
                strokeDasharray: '3,3',
              },
            });
          }
        }
      }
    }

    return nodes.length > 0
      ? {
          issueId: `issue-${issueNumber}`,
          nodes,
          edges,
          metadata: this.calculateMetadata(nodes),
        }
      : null;
  }

  /**
   * Parse dependency line
   * Supports: "⚙️ Depends on: Task 1", "Depends on: Sub-task 1.1"
   */
  private parseDependencyLine(
    line: string,
    currentNodeId: string,
    issueNumber: number,
    edges: TaskEdge[]
  ): void {
    const dependsMatch = line.match(/⚙️\s*Depends\s+on:\s*(.+)$/i);
    if (!dependsMatch) {
      return;
    }

    const dependsOnText = dependsMatch[1];

    // Parse "Task N" or "Sub-task N.M"
    const depPattern = /(Task|Sub-task)\s+(\d+(?:\.\d+)?)/gi;
    let depMatch;

    while ((depMatch = depPattern.exec(dependsOnText)) !== null) {
      const depType = depMatch[1];
      const depNumber = depMatch[2];

      let sourceId: string;
      if (depType.toLowerCase() === 'task') {
        sourceId = `issue-${issueNumber}-task-${depNumber}`;
      } else {
        // Sub-task
        const [taskNum, subtaskNum] = depNumber.split('.');
        sourceId = `issue-${issueNumber}-task-${taskNum}-subtask-${subtaskNum}`;
      }

      edges.push({
        id: `dep-${currentNodeId}-depends-${sourceId}`,
        source: sourceId,
        target: currentNodeId,
        type: 'dependency',
        label: '⚙️ depends on',
        style: {
          stroke: '#FB923C',
          strokeWidth: 2.5,
          strokeDasharray: '5,5',
        },
      });
    }
  }

  /**
   * Calculate metadata from nodes
   */
  private calculateMetadata(nodes: TaskNode[]) {
    const tasks = nodes.filter((n) => n.type === 'task');

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.data.status === 'completed').length,
      blockedTasks: tasks.filter((t) => t.data.status === 'blocked').length,
      estimatedTotalHours: nodes.reduce(
        (sum, n) => sum + (n.data.estimatedHours || 0),
        0
      ),
      actualTotalHours: nodes.reduce(
        (sum, n) => sum + (n.data.actualHours || 0),
        0
      ),
    };
  }

  /**
   * Create empty hierarchy (no tasks found)
   */
  private createEmptyHierarchy(issueNumber: number): TaskHierarchyData {
    return {
      issueId: `issue-${issueNumber}`,
      nodes: [],
      edges: [],
      metadata: {
        totalTasks: 0,
        completedTasks: 0,
        blockedTasks: 0,
        estimatedTotalHours: 0,
        actualTotalHours: 0,
      },
    };
  }
}
