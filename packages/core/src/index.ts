/**
 * @agentic-os/core - Core agent system
 *
 * This is a placeholder implementation. Full implementation coming soon.
 */

export * from './agents/index.js';
export * from './types/index.js';

/**
 * Core package version
 */
export const VERSION = '0.1.0';

/**
 * Package metadata
 */
export const metadata = {
  name: '@agentic-os/core',
  version: VERSION,
  description: 'Core agent system for Agentic OS - Autonomous development framework',
} as const;
