/**
 * LayoutEngine - Dashboard Node Layout Calculator
 *
 * Implements Contextual Hierarchical layout algorithm with:
 * - Relationship-based positioning (agents near assigned issues)
 * - Mathematical formulas for reproducible positioning
 * - Collision detection and resolution
 * - Optimized for 1-10 Issues, 7 Agents, 8 States
 *
 * Based on: DASHBOARD_SPECIFICATION_V2.md Section 6 + Contextual Enhancements
 */

import type { GraphNode, GraphEdge } from '../types/index';

// ============================================================================
// Types
// ============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface LayoutConfig {
  // Node dimensions (default sizes)
  issueWidth: number;
  issueHeight: number;
  agentWidth: number;
  agentHeight: number;
  stateWidth: number;
  stateHeight: number;

  // Spacing parameters
  issueSpacing: number;      // Vertical spacing between issues
  agentSpacing: {
    horizontal: number;       // Horizontal spacing in grid
    vertical: number;         // Vertical spacing in grid
  };
  stateSpacing: number;       // Vertical spacing between states

  // Collision detection
  collisionMargin: number;    // Minimum margin between nodes

  // NEW: Contextual positioning parameters
  agentToIssueDistance: number;  // Horizontal distance from issue to specialist agent
  agentVerticalOffset: number;    // Vertical offset range for contextual positioning
  enableContextualLayout: boolean; // Enable/disable contextual positioning
}

export interface Collision {
  nodeA: string;
  nodeB: string;
  overlap: number;  // Amount of overlap in pixels
  axis: 'x' | 'y';   // Primary axis of collision
}

export interface LayoutResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  bounds: {
    width: number;
    height: number;
  };
  collisions: Collision[];
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: LayoutConfig = {
  // Node dimensions
  issueWidth: 180,
  issueHeight: 120,
  agentWidth: 200,    // Slightly wider for better visibility
  agentHeight: 140,
  stateWidth: 160,
  stateHeight: 100,

  // Spacing - Reduced for tighter, more connected layout
  issueSpacing: 200,  // Reduced from 250
  agentSpacing: {
    horizontal: 280,  // Reduced from 350
    vertical: 180,    // Reduced from 300
  },
  stateSpacing: 180,  // Reduced from 200

  // Collision
  collisionMargin: 30, // Increased from 20 for better separation

  // NEW: Contextual positioning
  agentToIssueDistance: 320, // Distance from issue to specialist agent
  agentVerticalOffset: 50,    // Vertical offset range for variety
  enableContextualLayout: true, // Enable by default
};

// ============================================================================
// LayoutEngine Class
// ============================================================================

export class LayoutEngine {
  private config: LayoutConfig;

  constructor(config?: Partial<LayoutConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // ==========================================================================
  // Main Layout Calculation
  // ==========================================================================

  /**
   * Calculate layout for entire graph
   *
   * @param nodes - Input nodes (may have existing positions)
   * @param edges - Input edges
   * @returns Complete layout with positioned nodes and edges
   */
  calculateLayout(
    nodes: GraphNode[],
    edges: GraphEdge[]
  ): LayoutResult {
    const positionedNodes: GraphNode[] = [];

    // Separate nodes by type
    const issueNodes = nodes.filter(n => n.type === 'issue');
    const agentNodes = nodes.filter(n => n.type === 'agent');
    const stateNodes = nodes.filter(n => n.type === 'state');

    // 1. Position Issue nodes (left column)
    const issuePositions = new Map<number, Position>();
    issueNodes.forEach((node, index) => {
      const position = this.calculateIssuePosition(index, issueNodes.length);
      issuePositions.set((node.data as any).number, position);
      positionedNodes.push({
        ...node,
        position,
      });
    });

    // 2. Position Coordinator (center, middle of issues)
    const coordinatorNode = agentNodes.find(n => (n.data as any).agentId === 'coordinator');
    if (coordinatorNode) {
      positionedNodes.push({
        ...coordinatorNode,
        position: this.calculateCoordinatorPosition(issueNodes.length),
      });
    }

    // 3. Position Specialist Agents (contextual or grid)
    const specialistNodes = agentNodes.filter(n => (n.data as any).agentId !== 'coordinator');
    if (this.config.enableContextualLayout) {
      // NEW: Contextual positioning based on agent-issue relationships
      const agentAssignments = this.buildAgentAssignmentMap(issueNodes, specialistNodes);
      const usedPositions: Array<{ x: number; y: number; width: number; height: number }> = [];

      specialistNodes.forEach((node, index) => {
        const position = this.calculateContextualSpecialistPosition(
          node,
          index,
          agentAssignments,
          issuePositions,
          usedPositions
        );
        usedPositions.push({
          x: position.x,
          y: position.y,
          width: this.config.agentWidth,
          height: this.config.agentHeight,
        });
        positionedNodes.push({
          ...node,
          position,
        });
      });
    } else {
      // Original grid layout
      specialistNodes.forEach((node, index) => {
        positionedNodes.push({
          ...node,
          position: this.calculateSpecialistPosition(index),
        });
      });
    }

    // 4. Position State nodes (far right column)
    stateNodes.forEach((node, index) => {
      positionedNodes.push({
        ...node,
        position: this.calculateStatePosition(index),
      });
    });

    // 5. Detect collisions
    const collisions = this.detectCollisions(positionedNodes);

    // 6. Resolve collisions if any
    let finalNodes = positionedNodes;
    if (collisions.length > 0) {
      finalNodes = this.resolveCollisions(positionedNodes, collisions);
    }

    // 7. Calculate bounds
    const bounds = this.calculateBounds(finalNodes);

    return {
      nodes: finalNodes,
      edges,
      bounds,
      collisions,
    };
  }

  // ==========================================================================
  // NEW: Contextual Positioning Helpers
  // ==========================================================================

  /**
   * Build map of agent assignments from issue data and agent currentIssue
   */
  private buildAgentAssignmentMap(
    issueNodes: GraphNode[],
    agentNodes: GraphNode[]
  ): Map<string, number[]> {
    const agentAssignments = new Map<string, number[]>();

    // Get assignments from issue nodes
    issueNodes.forEach((issue) => {
      const assignedAgents = (issue.data as any).assignedAgents || [];
      const issueNumber = (issue.data as any).number;

      assignedAgents.forEach((agentId: string) => {
        const assignments = agentAssignments.get(agentId) || [];
        if (!assignments.includes(issueNumber)) {
          assignments.push(issueNumber);
        }
        agentAssignments.set(agentId, assignments);
      });
    });

    // Also check currentIssue from agent nodes
    agentNodes.forEach((agent) => {
      const agentId = (agent.data as any).agentId;
      const currentIssue = (agent.data as any).currentIssue;

      if (currentIssue) {
        const assignments = agentAssignments.get(agentId) || [];
        if (!assignments.includes(currentIssue)) {
          assignments.push(currentIssue);
        }
        agentAssignments.set(agentId, assignments);
      }
    });

    return agentAssignments;
  }

  /**
   * Calculate contextual position for specialist agent based on assigned issues
   */
  private calculateContextualSpecialistPosition(
    agent: GraphNode,
    index: number,
    agentAssignments: Map<string, number[]>,
    issuePositions: Map<number, Position>,
    usedPositions: Array<{ x: number; y: number; width: number; height: number }>
  ): Position {
    const agentId = (agent.data as any).agentId;
    const assignedIssueNumbers = agentAssignments.get(agentId) || [];

    let targetX: number;
    let targetY: number;

    if (assignedIssueNumbers.length > 0) {
      // Position near the assigned issues (calculate center of assigned issues)
      const assignedPositions = assignedIssueNumbers
        .map((num) => issuePositions.get(num))
        .filter((pos): pos is Position => pos !== undefined);

      if (assignedPositions.length > 0) {
        // Calculate average Y position of assigned issues
        const avgY = assignedPositions.reduce((sum, pos) => sum + pos.y, 0) / assignedPositions.length;

        // Position to the right of issues
        targetX = 100 + this.config.issueWidth + this.config.agentToIssueDistance;

        // Add vertical offset for variety and to avoid overlaps
        const offsetDirection = index % 2 === 0 ? -1 : 1;
        const offsetAmount = (Math.floor(index / 2) * this.config.agentVerticalOffset);
        targetY = avgY + (offsetDirection * offsetAmount);
      } else {
        // Fallback to grid if can't find issue positions
        targetX = 800 + (index % 2) * this.config.agentSpacing.horizontal;
        targetY = 120 + Math.floor(index / 2) * this.config.agentSpacing.vertical;
      }
    } else {
      // No assignment: use grid layout on the right
      targetX = 800 + (index % 2) * this.config.agentSpacing.horizontal;
      targetY = 120 + Math.floor(index / 2) * this.config.agentSpacing.vertical;
    }

    // Collision avoidance with existing agents
    let finalX = targetX;
    let finalY = targetY;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const collision = usedPositions.some((used) => {
        return (
          finalX < used.x + used.width + this.config.collisionMargin &&
          finalX + this.config.agentWidth + this.config.collisionMargin > used.x &&
          finalY < used.y + used.height + this.config.collisionMargin &&
          finalY + this.config.agentHeight + this.config.collisionMargin > used.y
        );
      });

      if (!collision) break;

      // Move down to avoid collision
      finalY += this.config.agentSpacing.vertical * 0.5;
      attempts++;
    }

    return { x: finalX, y: finalY };
  }

  // ==========================================================================
  // Node Position Calculations (Section 6.2 formulas)
  // ==========================================================================

  /**
   * Calculate Issue node position (left column, vertical)
   * Formula: x = 120, y = i × 200 + 120 (updated for better spacing)
   */
  calculateIssuePosition(index: number, _totalIssues: number): Position {
    return {
      x: 120, // Slightly more padding from left
      y: index * this.config.issueSpacing + 120,
    };
  }

  /**
   * Calculate Coordinator node position (center, vertically centered)
   * Formula: x = 480, y = (totalIssues / 2) × 200 + 120 (updated)
   */
  calculateCoordinatorPosition(totalIssues: number): Position {
    return {
      x: 480, // Positioned between issues and specialists
      y: totalIssues > 0
        ? (totalIssues - 1) * this.config.issueSpacing / 2 + 120
        : 300,
    };
  }

  /**
   * Calculate Specialist Agent position (2×3 grid)
   * Formula:
   *   x = 700 + (i % 2) × 350
   *   y = 100 + floor(i / 2) × 300
   */
  calculateSpecialistPosition(index: number): Position {
    return {
      x: 700 + (index % 2) * this.config.agentSpacing.horizontal,
      y: 100 + Math.floor(index / 2) * this.config.agentSpacing.vertical,
    };
  }

  /**
   * Calculate State node position (right column, vertical)
   * Formula: x = 1500, y = i × 180 + 120 (updated for better spacing)
   */
  calculateStatePosition(index: number): Position {
    return {
      x: 1500, // Moved further right for better separation
      y: index * this.config.stateSpacing + 120,
    };
  }

  // ==========================================================================
  // Collision Detection (AABB algorithm)
  // ==========================================================================

  /**
   * Detect collisions between all nodes using AABB
   * (Axis-Aligned Bounding Box)
   */
  detectCollisions(nodes: GraphNode[]): Collision[] {
    const collisions: Collision[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];

        const collision = this.checkCollision(nodeA, nodeB);
        if (collision) {
          collisions.push(collision);
        }
      }
    }

    return collisions;
  }

  /**
   * Check collision between two nodes
   */
  private checkCollision(
    nodeA: GraphNode,
    nodeB: GraphNode
  ): Collision | null {
    const { collisionMargin } = this.config;

    // Get node dimensions
    const widthA = this.getNodeWidth(nodeA);
    const heightA = this.getNodeHeight(nodeA);
    const widthB = this.getNodeWidth(nodeB);
    const heightB = this.getNodeHeight(nodeB);

    // Calculate distances
    const dx = Math.abs(nodeA.position.x - nodeB.position.x);
    const dy = Math.abs(nodeA.position.y - nodeB.position.y);

    // Minimum distances (half-widths + margin)
    const minDistX = (widthA + widthB) / 2 + collisionMargin;
    const minDistY = (heightA + heightB) / 2 + collisionMargin;

    // Check for collision
    if (dx < minDistX && dy < minDistY) {
      const overlapX = minDistX - dx;
      const overlapY = minDistY - dy;

      return {
        nodeA: nodeA.id,
        nodeB: nodeB.id,
        overlap: Math.min(overlapX, overlapY),
        axis: overlapX < overlapY ? 'x' : 'y',
      };
    }

    return null;
  }

  // ==========================================================================
  // Collision Resolution
  // ==========================================================================

  /**
   * Resolve collisions by moving nodes
   * Strategy: Move the lower/right node down/right
   */
  resolveCollisions(
    nodes: GraphNode[],
    collisions: Collision[]
  ): GraphNode[] {
    const resolved = nodes.map(n => ({ ...n }));

    for (const collision of collisions) {
      const nodeA = resolved.find(n => n.id === collision.nodeA);
      const nodeB = resolved.find(n => n.id === collision.nodeB);

      if (!nodeA || !nodeB) continue;

      // Determine which node to move (prefer moving the one that's lower/right)
      const moveNode = nodeA.position.y < nodeB.position.y ? nodeB : nodeA;
      const adjustAmount = collision.overlap + 10; // Add 10px extra margin

      // Move along primary collision axis
      if (collision.axis === 'y') {
        moveNode.position.y += adjustAmount;
      } else {
        moveNode.position.x += adjustAmount;
      }
    }

    return resolved;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Get node width based on type
   */
  private getNodeWidth(node: GraphNode): number {
    switch (node.type) {
      case 'issue':
        return this.config.issueWidth;
      case 'agent':
        return this.config.agentWidth;
      case 'state':
        return this.config.stateWidth;
      default:
        return 180; // Default
    }
  }

  /**
   * Get node height based on type
   */
  private getNodeHeight(node: GraphNode): number {
    switch (node.type) {
      case 'issue':
        return this.config.issueHeight;
      case 'agent':
        return this.config.agentHeight;
      case 'state':
        return this.config.stateHeight;
      default:
        return 120; // Default
    }
  }

  /**
   * Calculate bounding box for all nodes
   */
  private calculateBounds(nodes: GraphNode[]): { width: number; height: number } {
    if (nodes.length === 0) {
      return { width: 0, height: 0 };
    }

    let maxX = 0;
    let maxY = 0;

    nodes.forEach(node => {
      const nodeWidth = this.getNodeWidth(node);
      const nodeHeight = this.getNodeHeight(node);

      const rightEdge = node.position.x + nodeWidth;
      const bottomEdge = node.position.y + nodeHeight;

      maxX = Math.max(maxX, rightEdge);
      maxY = Math.max(maxY, bottomEdge);
    });

    return {
      width: maxX + 100, // Add 100px padding
      height: maxY + 100,
    };
  }

  // ==========================================================================
  // Edge Creation Helpers
  // ==========================================================================

  /**
   * Create edges between nodes based on relationships
   * This is a helper method for graph building
   */
  static createEdges(nodes: GraphNode[]): GraphEdge[] {
    const edges: GraphEdge[] = [];

    // Find node types
    const issueNodes = nodes.filter(n => n.type === 'issue');
    const agentNodes = nodes.filter(n => n.type === 'agent');
    const stateNodes = nodes.filter(n => n.type === 'state');

    // Issue → Agent edges (assignment)
    issueNodes.forEach(issue => {
      const assignedAgents = (issue.data as any).assignedAgents || [];
      assignedAgents.forEach((agentId: string) => {
        const agent = agentNodes.find(a => (a.data as any).agentId === agentId);
        if (agent) {
          edges.push({
            id: `${issue.id}-to-${agent.id}`,
            source: issue.id,
            target: agent.id,
            type: 'default',
            data: {
              type: 'issue-to-agent',
              style: {
                stroke: '#8B5CF6',
                strokeWidth: 2,
              },
            },
          });
        }
      });
    });

    // Agent → State edges (transition)
    agentNodes.forEach(agent => {
      const currentState = (agent.data as any).currentState || 'idle';
      const state = stateNodes.find(s => (s.data as any).label.includes(currentState));
      if (state) {
        edges.push({
          id: `${agent.id}-to-${state.id}`,
          source: agent.id,
          target: state.id,
          type: 'default',
          animated: (agent.data as any).status === 'running',
          data: {
            type: 'agent-to-state',
            style: {
              stroke: '#10B981',
              strokeWidth: 2,
            },
          },
        });
      }
    });

    return edges;
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  /**
   * Validate that layout is correct
   */
  validateLayout(result: LayoutResult): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for remaining collisions
    if (result.collisions.length > 0) {
      errors.push(`${result.collisions.length} unresolved collisions`);
    }

    // Check for out-of-bounds nodes
    result.nodes.forEach(node => {
      if (node.position.x < 0 || node.position.y < 0) {
        errors.push(`Node ${node.id} has negative position`);
      }
    });

    // Check for NaN positions
    result.nodes.forEach(node => {
      if (isNaN(node.position.x) || isNaN(node.position.y)) {
        errors.push(`Node ${node.id} has NaN position`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// ============================================================================
// Singleton Instance (Optional)
// ============================================================================

let defaultInstance: LayoutEngine | null = null;

export function getLayoutEngine(config?: Partial<LayoutConfig>): LayoutEngine {
  if (!defaultInstance) {
    defaultInstance = new LayoutEngine(config);
  }
  return defaultInstance;
}

// ============================================================================
// Exports
// ============================================================================

export default LayoutEngine;
