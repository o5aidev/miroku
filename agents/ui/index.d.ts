/**
 * Agentic OS UI System — Unified Exports
 *
 * Addresses Issue #4 - Rich CLI Output Styling
 *
 * Usage:
 * ```typescript
 * import { logger, theme } from './agents/ui/index.js';
 *
 * logger.header('Agentic OS');
 * logger.agent('CoordinatorAgent', 'Starting execution...');
 * logger.success('Task completed!');
 * ```
 */
export { RichLogger, logger } from './logger.js';
export { theme, agentColors, severityColors, phaseColors } from './theme.js';
export type { Theme, AgentName, SeverityLevel, PhaseLevel } from './theme.js';
export type { LogOptions, BoxOptions } from './logger.js';
export * from './table.js';
export * from './box.js';
export * from './progress.js';
export * from './tree.js';
export type { Ora } from 'ora';
//# sourceMappingURL=index.d.ts.map