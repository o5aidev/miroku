/**
 * Event Validation Schemas
 *
 * Zod-based validation for all 10 Dashboard events.
 * Provides type-safe validation with detailed error messages.
 *
 * Based on: DASHBOARD_SPECIFICATION_V2.md Section 4
 */

import { z } from 'zod';

// ============================================================================
// Basic Schemas (Reusable components)
// ============================================================================

/**
 * Agent ID - Must be one of 7 valid agents
 */
export const AgentIdSchema = z.enum([
  'coordinator',
  'codegen',
  'review',
  'issue',
  'pr',
  'deployment',
  'test',
], {
  message: 'Invalid agentId. Must be one of: coordinator, codegen, review, issue, pr, deployment, test',
});

/**
 * Progress - Integer between 0 and 100
 */
export const ProgressSchema = z.number()
  .int('Progress must be an integer')
  .min(0, 'Progress must be >= 0')
  .max(100, 'Progress must be <= 100');

/**
 * Timestamp - ISO 8601 datetime string
 */
export const TimestampSchema = z.string()
  .datetime({ message: 'Invalid ISO 8601 timestamp. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ' });

/**
 * Issue Number - Positive integer
 */
export const IssueNumberSchema = z.number()
  .int('Issue number must be an integer')
  .positive('Issue number must be positive');

/**
 * Event Type - One of 10 valid event types
 */
export const EventTypeSchema = z.enum([
  'graph:update',
  'started',
  'progress',
  'completed',
  'error',
  'state:transition',
  'task:discovered',
  'coordinator:analyzing',
  'coordinator:decomposing',
  'coordinator:assigning',
]);

/**
 * State Type - One of 8 valid states
 */
export const StateTypeSchema = z.enum([
  'pending',
  'analyzing',
  'implementing',
  'reviewing',
  'testing',
  'done',
  'error',
  'blocked',
]);

/**
 * Priority - 4 levels
 */
export const PrioritySchema = z.enum([
  'P0-Critical',
  'P1-High',
  'P2-Medium',
  'P3-Low',
]);

/**
 * Severity - 3 levels for errors
 */
export const SeveritySchema = z.enum([
  'warning',
  'error',
  'critical',
]);

/**
 * Complexity - 4 levels
 */
export const ComplexitySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

// ============================================================================
// Event-Specific Schemas
// ============================================================================

/**
 * 1. graph:update Event
 * Purpose: Full graph reconstruction
 */
export const GraphUpdateEventSchema = z.object({
  eventType: z.literal('graph:update'),
  timestamp: TimestampSchema,
  nodes: z.array(z.object({
    id: z.string().min(1),
    type: z.enum(['issue', 'agent', 'state', 'entity', 'relation']),
    label: z.string().optional(),
    status: z.enum(['idle', 'running', 'completed', 'error']).optional(),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
    metadata: z.record(z.string(), z.any()).optional(),
  })),
  edges: z.array(z.object({
    id: z.string().min(1),
    source: z.string().min(1),
    target: z.string().min(1),
    type: z.string().optional(),
    animated: z.boolean().optional(),
    label: z.string().optional(),
  })),
});

/**
 * 2. agent:started Event
 * Purpose: Agent execution start notification
 */
export const AgentStartedEventSchema = z.object({
  eventType: z.literal('started'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  parameters: z.object({
    taskTitle: z.string().min(1).max(200),
    priority: PrioritySchema,
    estimatedDuration: z.number().int().positive().optional(),
    context: z.string().max(5000).optional(),
  }).optional(),
});

/**
 * 3. agent:progress Event
 * Purpose: Agent execution progress update
 */
export const AgentProgressEventSchema = z.object({
  eventType: z.literal('progress'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  progress: ProgressSchema,
  message: z.string().max(500).optional(),
  substeps: z.object({
    current: z.number().int().positive(),
    total: z.number().int().positive(),
    description: z.string().max(200),
  }).optional(),
});

/**
 * 4. agent:completed Event
 * Purpose: Agent execution completion notification
 */
export const AgentCompletedEventSchema = z.object({
  eventType: z.literal('completed'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  result: z.object({
    success: z.boolean(),
    duration: z.number().nonnegative(),
    outputSummary: z.string().max(1000),
    metrics: z.object({
      linesChanged: z.number().int().nonnegative().optional(),
      filesModified: z.number().int().nonnegative().optional(),
      qualityScore: z.number().min(0).max(100).optional(),
    }).optional(),
    artifacts: z.object({
      prUrl: z.string().url().optional(),
      deploymentUrl: z.string().url().optional(),
      reportUrl: z.string().url().optional(),
    }).optional(),
  }),
});

/**
 * 5. agent:error Event
 * Purpose: Agent execution error notification
 */
export const AgentErrorEventSchema = z.object({
  eventType: z.literal('error'),
  timestamp: TimestampSchema,
  agentId: AgentIdSchema,
  issueNumber: IssueNumberSchema,
  error: z.object({
    code: z.string().max(50),
    message: z.string().max(1000),
    severity: SeveritySchema,
    stack: z.string().optional(),
    context: z.record(z.string(), z.any()).optional(),
    recoverable: z.boolean(),
    suggestedAction: z.string().max(500).optional(),
  }),
});

/**
 * 6. state:transition Event
 * Purpose: Issue state transition notification
 */
export const StateTransitionEventSchema = z.object({
  eventType: z.literal('state:transition'),
  timestamp: TimestampSchema,
  issueNumber: IssueNumberSchema,
  fromState: StateTypeSchema,
  toState: StateTypeSchema,
  triggeredBy: z.object({
    agentId: AgentIdSchema.optional(),
    event: z.string().optional(),
    manual: z.boolean().optional(),
  }),
  metadata: z.object({
    reason: z.string().optional(),
    duration: z.number().nonnegative().optional(),
  }).optional(),
});

/**
 * 7. task:discovered Event
 * Purpose: New task discovery notification
 */
export const TaskDiscoveredEventSchema = z.object({
  eventType: z.literal('task:discovered'),
  timestamp: TimestampSchema,
  issueNumber: IssueNumberSchema,
  taskDetails: z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    priority: PrioritySchema,
    type: z.enum(['feature', 'bug', 'refactor', 'docs', 'test']),
    estimatedComplexity: ComplexitySchema,
    labels: z.array(z.string()).optional(),
  }),
});

/**
 * 8. coordinator:analyzing Event
 * Purpose: Coordinator analysis phase notification
 */
export const CoordinatorAnalyzingEventSchema = z.object({
  eventType: z.literal('coordinator:analyzing'),
  timestamp: TimestampSchema,
  issueNumber: IssueNumberSchema,
  analysisDetails: z.object({
    complexity: ComplexitySchema,
    requiredAgents: z.array(AgentIdSchema),
    estimatedDuration: z.number().nonnegative(),
    dependencies: z.array(IssueNumberSchema),
    risks: z.array(z.string()),
  }),
});

/**
 * 9. coordinator:decomposing Event
 * Purpose: Coordinator decomposition phase notification
 */
export const CoordinatorDecomposingEventSchema = z.object({
  eventType: z.literal('coordinator:decomposing'),
  timestamp: TimestampSchema,
  issueNumber: IssueNumberSchema,
  decomposition: z.object({
    subtasks: z.array(z.object({
      id: z.string().min(1),
      title: z.string().min(1).max(200),
      assignTo: AgentIdSchema,
      dependencies: z.array(z.string()),
      estimatedDuration: z.number().nonnegative(),
    })),
    parallelGroups: z.array(z.array(z.string())),
    criticalPath: z.array(z.string()),
  }),
});

/**
 * 10. coordinator:assigning Event
 * Purpose: Coordinator assignment phase notification
 */
export const CoordinatorAssigningEventSchema = z.object({
  eventType: z.literal('coordinator:assigning'),
  timestamp: TimestampSchema,
  issueNumber: IssueNumberSchema,
  assignments: z.array(z.object({
    subtaskId: z.string().min(1),
    agentId: AgentIdSchema,
    priority: z.number().int().min(1).max(10),
    scheduledStart: TimestampSchema,
  })),
});

// ============================================================================
// Discriminated Union (All Events)
// ============================================================================

/**
 * Dashboard Event Schema - Union of all 10 event types
 * Uses discriminatedUnion for optimal performance and error messages
 */
export const DashboardEventSchema = z.discriminatedUnion('eventType', [
  GraphUpdateEventSchema,
  AgentStartedEventSchema,
  AgentProgressEventSchema,
  AgentCompletedEventSchema,
  AgentErrorEventSchema,
  StateTransitionEventSchema,
  TaskDiscoveredEventSchema,
  CoordinatorAnalyzingEventSchema,
  CoordinatorDecomposingEventSchema,
  CoordinatorAssigningEventSchema,
]);

// ============================================================================
// TypeScript Types (Inferred from schemas)
// ============================================================================

export type AgentId = z.infer<typeof AgentIdSchema>;
export type Progress = z.infer<typeof ProgressSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
export type IssueNumber = z.infer<typeof IssueNumberSchema>;
export type EventType = z.infer<typeof EventTypeSchema>;
export type StateType = z.infer<typeof StateTypeSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type Severity = z.infer<typeof SeveritySchema>;
export type Complexity = z.infer<typeof ComplexitySchema>;

export type GraphUpdateEvent = z.infer<typeof GraphUpdateEventSchema>;
export type AgentStartedEvent = z.infer<typeof AgentStartedEventSchema>;
export type AgentProgressEvent = z.infer<typeof AgentProgressEventSchema>;
export type AgentCompletedEvent = z.infer<typeof AgentCompletedEventSchema>;
export type AgentErrorEvent = z.infer<typeof AgentErrorEventSchema>;
export type StateTransitionEvent = z.infer<typeof StateTransitionEventSchema>;
export type TaskDiscoveredEvent = z.infer<typeof TaskDiscoveredEventSchema>;
export type CoordinatorAnalyzingEvent = z.infer<typeof CoordinatorAnalyzingEventSchema>;
export type CoordinatorDecomposingEvent = z.infer<typeof CoordinatorDecomposingEventSchema>;
export type CoordinatorAssigningEvent = z.infer<typeof CoordinatorAssigningEventSchema>;

export type DashboardEvent = z.infer<typeof DashboardEventSchema>;

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validation result type
 */
export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    errors: Array<{
      field: string;
      message: string;
      received?: any;
    }>;
  };
}

/**
 * Validate a Dashboard event
 *
 * @param data - Unknown data to validate
 * @returns Validation result with typed data or errors
 */
export function validateDashboardEvent(data: unknown): ValidationResult<DashboardEvent> {
  const result = DashboardEventSchema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  // Format errors for better readability
  return {
    success: false,
    error: {
      message: 'Validation failed',
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        received: (issue as any).received,
      })),
    },
  };
}

/**
 * Validate specific event type
 *
 * @param data - Unknown data to validate
 * @param eventType - Expected event type
 * @returns Validation result
 */
export function validateEventType<T extends EventType>(
  data: unknown,
  eventType: T
): ValidationResult {
  // First check if eventType matches
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: {
        message: 'Data must be an object',
        errors: [{ field: 'root', message: 'Expected object, received ' + typeof data }],
      },
    };
  }

  const dataObj = data as Record<string, unknown>;
  if (dataObj.eventType !== eventType) {
    return {
      success: false,
      error: {
        message: 'Event type mismatch',
        errors: [
          {
            field: 'eventType',
            message: `Expected "${eventType}", received "${dataObj.eventType}"`,
            received: dataObj.eventType,
          },
        ],
      },
    };
  }

  // Validate with full schema
  return validateDashboardEvent(data);
}

/**
 * Validate agent ID
 */
export function validateAgentId(agentId: unknown): ValidationResult<AgentId> {
  const result = AgentIdSchema.safeParse(agentId);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: {
      message: 'Invalid agent ID',
      errors: result.error.issues.map(issue => ({
        field: 'agentId',
        message: issue.message,
        received: agentId,
      })),
    },
  };
}

/**
 * Validate progress value
 */
export function validateProgress(progress: unknown): ValidationResult<Progress> {
  const result = ProgressSchema.safeParse(progress);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: {
      message: 'Invalid progress value',
      errors: result.error.issues.map(issue => ({
        field: 'progress',
        message: issue.message,
        received: progress,
      })),
    },
  };
}

/**
 * Validate timestamp
 */
export function validateTimestamp(timestamp: unknown): ValidationResult<Timestamp> {
  const result = TimestampSchema.safeParse(timestamp);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: {
      message: 'Invalid timestamp',
      errors: result.error.issues.map(issue => ({
        field: 'timestamp',
        message: issue.message,
        received: timestamp,
      })),
    },
  };
}

/**
 * Validate issue number
 */
export function validateIssueNumber(issueNumber: unknown): ValidationResult<IssueNumber> {
  const result = IssueNumberSchema.safeParse(issueNumber);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: {
      message: 'Invalid issue number',
      errors: result.error.issues.map(issue => ({
        field: 'issueNumber',
        message: issue.message,
        received: issueNumber,
      })),
    },
  };
}

// ============================================================================
// Express Middleware
// ============================================================================

/**
 * Express middleware for validating dashboard events
 *
 * Usage:
 * ```typescript
 * app.post('/api/agent-event', validateDashboardEventMiddleware, (req, res) => {
 *   const event: DashboardEvent = req.body;
 *   // event is now type-safe and validated
 * });
 * ```
 */
export function validateDashboardEventMiddleware(
  req: any,
  res: any,
  next: any
): void {
  const validation = validateDashboardEvent(req.body);

  if (!validation.success) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      validationErrors: validation.error?.errors || [],
    });
    return;
  }

  // Store validated data
  req.validatedBody = validation.data;
  next();
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if data is a valid dashboard event (type guard)
 */
export function isDashboardEvent(data: unknown): data is DashboardEvent {
  return DashboardEventSchema.safeParse(data).success;
}

/**
 * Check if event is of specific type (type guard)
 */
export function isEventType<T extends EventType>(
  event: DashboardEvent,
  type: T
): boolean {
  return event.eventType === type;
}

/**
 * Get event type from unknown data (safe)
 */
export function getEventType(data: unknown): EventType | null {
  if (typeof data !== 'object' || data === null) return null;

  const dataObj = data as Record<string, unknown>;
  const eventType = dataObj.eventType;

  const result = EventTypeSchema.safeParse(eventType);
  return result.success ? result.data : null;
}

// ============================================================================
// Error Formatting
// ============================================================================

/**
 * Format validation errors for API response
 */
export function formatValidationErrors(errors: z.ZodIssue[]): Array<{
  field: string;
  message: string;
  code: string;
  received?: any;
}> {
  return errors.map(error => ({
    field: error.path.join('.') || 'root',
    message: error.message,
    code: error.code,
    received: (error as any).received,
  }));
}

/**
 * Create standard validation error response
 */
export function createValidationErrorResponse(errors: z.ZodIssue[]) {
  return {
    success: false,
    error: 'Validation failed',
    validationErrors: formatValidationErrors(errors),
    timestamp: new Date().toISOString(),
  };
}
