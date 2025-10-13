/**
 * GitHub WebHook Handler
 */

import { createNodeMiddleware, Webhooks } from '@octokit/webhooks';
import type { Server as SocketServer } from 'socket.io';
import type { GraphUpdateEvent, StateTransitionEvent } from './types.js';
import { GraphBuilder } from './graph-builder.js';

export class WebhookHandler {
  private webhooks: Webhooks;
  private io: SocketServer;
  private graphBuilder: GraphBuilder;

  constructor(
    webhookSecret: string,
    io: SocketServer,
    graphBuilder: GraphBuilder
  ) {
    this.webhooks = new Webhooks({ secret: webhookSecret });
    this.io = io;
    this.graphBuilder = graphBuilder;

    this.setupHandlers();
  }

  /**
   * Get Express middleware
   */
  getMiddleware() {
    return createNodeMiddleware(this.webhooks, { path: '/api/webhook/github' });
  }

  /**
   * Setup webhook event handlers
   */
  private setupHandlers() {
    // Issue opened
    this.webhooks.on('issues.opened', async ({ payload }) => {
      const issue = payload.issue as any;
      console.log(`📥 Issue opened: #${issue.number}`);

      try {
        const graph = await this.graphBuilder.buildIssueGraph(
          issue.number
        );

        const event: GraphUpdateEvent = {
          nodes: graph.nodes,
          edges: graph.edges,
          timestamp: new Date().toISOString(),
        };

        this.io.emit('graph:update', event);
        console.log(`✅ Graph updated for issue #${issue.number}`);
      } catch (error) {
        console.error('❌ Error updating graph:', error);
      }
    });

    // Issue labeled (unified handler for state and agent labels)
    this.webhooks.on('issues.labeled', async ({ payload }) => {
      const labelName = payload.label?.name;

      if (!labelName) return;

      console.log(
        `🏷️  Issue #${payload.issue.number} labeled: ${labelName}`
      );

      try {
        // Handle state transition
        if (labelName.includes('state:')) {
          const newState = labelName
            .replace(/^[^\s]+\s+state:/, '')
            .replace('state:', '')
            .trim();

          // Get previous state from existing labels
          const existingStateLabels = (payload.issue.labels || [])
            .map((l) => (typeof l === 'string' ? l : l.name))
            .filter((l) => l.includes('state:') && l !== labelName);

          const fromState =
            existingStateLabels.length > 0
              ? existingStateLabels[0]
                  .replace(/^[^\s]+\s+state:/, '')
                  .replace('state:', '')
                  .trim()
              : 'pending';

          // Emit state transition event
          const transitionEvent: StateTransitionEvent = {
            issueNumber: payload.issue.number,
            from: fromState,
            to: newState,
            timestamp: new Date().toISOString(),
          };

          this.io.emit('state:transition', transitionEvent);

          console.log(
            `🔄 State transition: ${fromState} → ${newState} for #${payload.issue.number}`
          );
        }

        // Handle agent assignment
        if (labelName.includes('agent:')) {
          console.log(
            `🤖 Agent assigned to #${payload.issue.number}: ${labelName}`
          );
        }

        // Rebuild graph for any label change
        const graph = await this.graphBuilder.buildFullGraph();
        const graphEvent: GraphUpdateEvent = {
          nodes: graph.nodes,
          edges: graph.edges,
          timestamp: new Date().toISOString(),
        };

        this.io.emit('graph:update', graphEvent);
        console.log(`✅ Graph updated for issue #${payload.issue.number}`);
      } catch (error) {
        console.error('❌ Error handling label event:', error);
      }
    });

    // Issue closed
    this.webhooks.on('issues.closed', async ({ payload }) => {
      console.log(`✅ Issue closed: #${payload.issue.number}`);

      try {
        // Rebuild full graph (remove closed issue)
        const graph = await this.graphBuilder.buildFullGraph();

        const event: GraphUpdateEvent = {
          nodes: graph.nodes,
          edges: graph.edges,
          timestamp: new Date().toISOString(),
        };

        this.io.emit('graph:update', event);
      } catch (error) {
        console.error('❌ Error updating graph:', error);
      }
    });

    // Pull request events
    this.webhooks.on('pull_request.opened', async ({ payload }) => {
      const pr = payload.pull_request as any;
      console.log(`🔀 PR opened: #${pr.number}`);

      // TODO: Add PR nodes to graph
    });

    // Error handling
    this.webhooks.onError((error) => {
      console.error('❌ Webhook error:', error);
    });
  }
}
