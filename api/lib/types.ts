/**
 * Miyabi Marketplace API Types
 * Core type definitions for the marketplace backend
 */

export interface LicensePayload {
  sub: string;                    // User ID
  plugin_id: string;              // Plugin identifier
  tier: 'free' | 'pro' | 'enterprise' | 'addon';
  iat: number;                    // Issued at (Unix timestamp)
  exp: number;                    // Expiration (Unix timestamp)
  features: string[];             // Enabled features
  limitations: {
    monthly_issues: number;       // -1 = unlimited
    concurrency: number;          // Max parallel executions
    claude_api_tokens: number;    // API token limit
    support: 'community' | 'priority' | 'dedicated';
  };
}

export interface Plugin {
  id: string;
  name: string;
  display_name: string;
  source: string;                 // GitHub: user/repo
  version: string;
  tier: 'free' | 'pro' | 'enterprise' | 'addon';
  price: number;
  currency: string;
  billing_period?: 'monthly' | 'yearly' | 'one-time';
  description: string;
  author: {
    name: string;
    email: string;
    verified: boolean;
  };
  license: string;
  features: string[];
  limitations: LicensePayload['limitations'];
  categories: string[];
  downloads: number;
  rating: number;
  verified: boolean;
  featured: boolean;
  trial_period?: number;          // Days
  requires_plugin?: string;       // For add-ons
  created_at: Date;
  updated_at: Date;
}

export interface Subscription {
  id: string;
  user_id: string;
  plugin_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  tier: string;
  license_key: string;
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  current_period_start: Date;
  current_period_end: Date;
  trial_ends_at?: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UsageEvent {
  id: string;
  user_id: string;
  plugin_id: string;
  event_type: 'issue_processed' | 'agent_executed' | 'command_used';
  event_data: {
    issue_number?: number;
    repository?: string;
    agents_used?: string[];
    command?: string;
    tokens_consumed?: number;
    duration_ms?: number;
  };
  created_at: Date;
}

export interface UsageAggregate {
  id: string;
  user_id: string;
  plugin_id: string;
  period: string;                 // "YYYY-MM"
  issues: number;
  tokens: number;
  agent_executions: Record<string, number>;
  created_at: Date;
  updated_at: Date;
}

export interface Trial {
  id: string;
  user_id: string;
  plugin_id: string;
  license_key: string;
  started_at: Date;
  expires_at: Date;
}

export interface PluginSubmission {
  id: string;
  user_id: string;
  plugin_data: Partial<Plugin>;
  quality_score: number;
  security_scan: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  status: 'pending_review' | 'approved' | 'rejected';
  review_notes?: string;
  submitted_at: Date;
  reviewed_at?: Date;
}

export interface QuotaCheckResult {
  allowed: boolean;
  remaining?: number;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  details?: any;
  retry_after?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
