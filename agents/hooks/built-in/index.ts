/**
 * Built-in Hooks
 *
 * Provides commonly used hooks for agent lifecycle management
 */

export { EnvironmentCheckHook } from './environment-check-hook.js';
export { DependencyCheckHook } from './dependency-check-hook.js';
export { CleanupHook } from './cleanup-hook.js';
export { NotificationHook, type NotificationConfig } from './notification-hook.js';
export { DashboardWebhookHook, type DashboardWebhookConfig } from './dashboard-webhook-hook.js';
