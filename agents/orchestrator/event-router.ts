/**
 * Event Router - GitHub Webhook Event Handler
 *
 * Maps to OS concept: Event Bus / IPC (Inter-Process Communication)
 *
 * Routes GitHub webhook events to appropriate agents:
 * - Issue events → CodeGenAgent, ReviewAgent
 * - PR events → ReviewAgent, DeploymentAgent
 * - Push events → CI/CD Agent
 * - Comment events → Agent notifications
 */

interface WebhookEvent {
  type: 'issues' | 'pull_request' | 'push' | 'issue_comment' | 'pull_request_review';
  action?: string;
  payload: any;
}

interface AgentTask {
  agent: string;
  priority: number;
  taskType: string;
  payload: any;
}

export class EventRouter {
  /**
   * Route webhook event to appropriate agent(s)
   */
  async route(event: WebhookEvent): Promise<AgentTask[]> {
    console.log(`[EventRouter] Processing ${event.type} event (action: ${event.action})`);

    switch (event.type) {
      case 'issues':
        return this.routeIssueEvent(event);
      case 'pull_request':
        return this.routePREvent(event);
      case 'push':
        return this.routePushEvent(event);
      case 'issue_comment':
        return this.routeCommentEvent(event);
      case 'pull_request_review':
        return this.routeReviewEvent(event);
      default:
        console.log(`[EventRouter] Unhandled event type: ${event.type}`);
        return [];
    }
  }

  /**
   * Route Issue events
   */
  private async routeIssueEvent(event: WebhookEvent): Promise<AgentTask[]> {
    const { action, payload } = event;
    const issue = payload.issue;

    const tasks: AgentTask[] = [];

    switch (action) {
      case 'opened':
        // New issue → Assign to appropriate agent based on labels
        console.log(`[EventRouter] New issue #${issue.number}: ${issue.title}`);

        if (this.hasLabel(issue, 'bug')) {
          tasks.push({
            agent: 'CodeGenAgent',
            priority: 2, // High priority for bugs
            taskType: 'fix_bug',
            payload: {
              issueNumber: issue.number,
              title: issue.title,
              body: issue.body,
              labels: issue.labels.map((l: any) => l.name),
            },
          });
        } else if (this.hasLabel(issue, 'feature')) {
          tasks.push({
            agent: 'CodeGenAgent',
            priority: 3, // Medium priority for features
            taskType: 'implement_feature',
            payload: {
              issueNumber: issue.number,
              title: issue.title,
              body: issue.body,
              labels: issue.labels.map((l: any) => l.name),
            },
          });
        } else if (this.hasLabel(issue, 'documentation')) {
          tasks.push({
            agent: 'DocsAgent',
            priority: 4, // Lower priority for docs
            taskType: 'update_docs',
            payload: {
              issueNumber: issue.number,
              title: issue.title,
              body: issue.body,
            },
          });
        } else {
          // Default: analyze and triage
          tasks.push({
            agent: 'CoordinatorAgent',
            priority: 3,
            taskType: 'triage_issue',
            payload: {
              issueNumber: issue.number,
              title: issue.title,
              body: issue.body,
            },
          });
        }
        break;

      case 'labeled':
        // Label added → May trigger agent action
        const label = payload.label.name;
        console.log(`[EventRouter] Issue #${issue.number} labeled: ${label}`);

        if (label === 'ready' || label === 'approved') {
          tasks.push({
            agent: 'CodeGenAgent',
            priority: 2,
            taskType: 'start_task',
            payload: {
              issueNumber: issue.number,
              title: issue.title,
              body: issue.body,
            },
          });
        }
        break;

      case 'closed':
        // Issue closed → Update metrics, cleanup
        console.log(`[EventRouter] Issue #${issue.number} closed`);
        tasks.push({
          agent: 'MetricsAgent',
          priority: 5,
          taskType: 'record_completion',
          payload: {
            issueNumber: issue.number,
          },
        });
        break;

      default:
        console.log(`[EventRouter] Unhandled issue action: ${action}`);
    }

    return tasks;
  }

  /**
   * Route Pull Request events
   */
  private async routePREvent(event: WebhookEvent): Promise<AgentTask[]> {
    const { action, payload } = event;
    const pr = payload.pull_request;

    const tasks: AgentTask[] = [];

    switch (action) {
      case 'opened':
        // New PR → Auto-review
        console.log(`[EventRouter] New PR #${pr.number}: ${pr.title}`);
        tasks.push({
          agent: 'ReviewAgent',
          priority: 2,
          taskType: 'review_pr',
          payload: {
            prNumber: pr.number,
            title: pr.title,
            body: pr.body,
            headRef: pr.head.ref,
            baseRef: pr.base.ref,
          },
        });
        break;

      case 'synchronize':
        // PR updated → Re-review
        console.log(`[EventRouter] PR #${pr.number} updated`);
        tasks.push({
          agent: 'ReviewAgent',
          priority: 3,
          taskType: 'review_pr',
          payload: {
            prNumber: pr.number,
            title: pr.title,
          },
        });
        break;

      case 'closed':
        if (pr.merged) {
          // PR merged → Deploy
          console.log(`[EventRouter] PR #${pr.number} merged`);
          tasks.push({
            agent: 'DeploymentAgent',
            priority: 1, // Critical priority for deployment
            taskType: 'deploy',
            payload: {
              prNumber: pr.number,
              branch: pr.base.ref,
              sha: pr.merge_commit_sha,
            },
          });
        }
        break;

      default:
        console.log(`[EventRouter] Unhandled PR action: ${action}`);
    }

    return tasks;
  }

  /**
   * Route Push events
   */
  private async routePushEvent(event: WebhookEvent): Promise<AgentTask[]> {
    const { payload } = event;
    const ref = payload.ref;
    const branch = ref.replace('refs/heads/', '');

    const tasks: AgentTask[] = [];

    // Push to main → Run full CI/CD
    if (branch === 'main' || branch === 'master') {
      console.log(`[EventRouter] Push to ${branch} branch`);
      tasks.push({
        agent: 'CIAgent',
        priority: 1,
        taskType: 'run_ci',
        payload: {
          branch,
          sha: payload.after,
          commits: payload.commits,
        },
      });
    }

    return tasks;
  }

  /**
   * Route Comment events
   */
  private async routeCommentEvent(event: WebhookEvent): Promise<AgentTask[]> {
    const { action, payload } = event;
    const comment = payload.comment;
    const issue = payload.issue;

    const tasks: AgentTask[] = [];

    if (action === 'created') {
      // Check for agent mentions
      const mentionsAgent = comment.body.includes('@agent') || comment.body.includes('/agent');

      if (mentionsAgent) {
        console.log(`[EventRouter] Agent mentioned in issue #${issue.number}`);
        tasks.push({
          agent: 'CoordinatorAgent',
          priority: 2,
          taskType: 'respond_to_comment',
          payload: {
            issueNumber: issue.number,
            commentId: comment.id,
            commentBody: comment.body,
            author: comment.user.login,
          },
        });
      }
    }

    return tasks;
  }

  /**
   * Route PR Review events
   */
  private async routeReviewEvent(event: WebhookEvent): Promise<AgentTask[]> {
    const { action, payload } = event;
    const review = payload.review;
    const pr = payload.pull_request;

    const tasks: AgentTask[] = [];

    if (action === 'submitted' && review.state === 'changes_requested') {
      // Changes requested → Notify agent to fix
      console.log(`[EventRouter] Changes requested on PR #${pr.number}`);
      tasks.push({
        agent: 'CodeGenAgent',
        priority: 2,
        taskType: 'address_review_comments',
        payload: {
          prNumber: pr.number,
          reviewId: review.id,
          comments: review.body,
        },
      });
    }

    return tasks;
  }

  /**
   * Check if issue has specific label
   */
  private hasLabel(issue: any, labelName: string): boolean {
    return issue.labels.some((l: any) => l.name === labelName);
  }

  /**
   * Get priority based on labels
   */
  getPriority(labels: string[]): number {
    if (labels.includes('critical') || labels.includes('urgent')) return 1;
    if (labels.includes('high-priority') || labels.includes('bug')) return 2;
    if (labels.includes('medium-priority') || labels.includes('feature')) return 3;
    if (labels.includes('low-priority') || labels.includes('documentation')) return 4;
    return 5; // Default
  }
}
