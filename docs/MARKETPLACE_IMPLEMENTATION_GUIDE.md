# Miyabi Marketplace Implementation Guide

**Version**: 1.0.0
**Last Updated**: 2025-10-11
**Status**: Implementation Specification

Complete technical implementation guide for the Miyabi Plugin Marketplace business model, including licensing, billing, usage tracking, and third-party integration.

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Plugin Licensing System](#plugin-licensing-system)
3. [Usage Tracking & Quota Management](#usage-tracking--quota-management)
4. [Billing Integration (Stripe)](#billing-integration-stripe)
5. [Third-Party Plugin Submission](#third-party-plugin-submission)
6. [API Specification](#api-specification)
7. [Database Schema](#database-schema)
8. [Security & Authentication](#security--authentication)

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code Client                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Plugin SDK  │  │ License Mgr  │  │ Usage Tracker │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          │ HTTPS            │ HTTPS            │ HTTPS
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│              Miyabi Marketplace API                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Plugin Store │  │ License API  │  │  Usage API   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │          PostgreSQL Database (Supabase)             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Stripe Connect│  │   Webhooks   │  │  Analytics   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Payments**: Stripe Connect
- **Auth**: Supabase Auth + JWT
- **Storage**: Supabase Storage (plugin packages)
- **Analytics**: Mixpanel / PostHog
- **Hosting**: Vercel Edge Functions

---

## Plugin Licensing System

### License Key Format

License keys use JWT (JSON Web Tokens) for secure, self-contained verification:

```typescript
interface LicensePayload {
  sub: string;           // User ID
  plugin_id: string;     // Plugin name (e.g., "miyabi-operations-pro")
  tier: "free" | "pro" | "enterprise";
  iat: number;           // Issued at (Unix timestamp)
  exp: number;           // Expiration (Unix timestamp)
  features: string[];    // Enabled features
  limitations: {
    monthly_issues: number;      // -1 = unlimited
    concurrency: number;
    claude_api_tokens: number;
  };
}

// Example License Key (JWT):
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsInBsdWdpbl9pZCI6Im1peWFiaS1vcGVyYXRpb25zLXBybyIsInRpZXIiOiJwcm8iLCJpYXQiOjE3MzEwMjQwMDAsImV4cCI6MTczMzYxNjAwMCwiZmVhdHVyZXMiOlsiYWR2YW5jZWQtYW5hbHl0aWNzIiwicHJpdmF0ZS1yZXBvcyJdLCJsaW1pdGF0aW9ucyI6eyJtb250aGx5X2lzc3VlcyI6LTEsImNvbmN1cnJlbmN5IjozLCJjbGF1ZGVfYXBpX3Rva2VucyI6MTAwMDAwfX0.SIGNATURE
```

### License Verification Flow

```typescript
// File: agents/license-manager.ts

import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const MARKETPLACE_API = 'https://api.miyabi.dev/v1';
const LICENSE_PUBLIC_KEY = process.env.MIYABI_LICENSE_PUBLIC_KEY;

export class LicenseManager {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  /**
   * Verify license key and return decoded payload
   */
  async verifyLicense(licenseKey: string): Promise<LicensePayload | null> {
    try {
      // Step 1: Verify JWT signature
      const decoded = jwt.verify(licenseKey, LICENSE_PUBLIC_KEY, {
        algorithms: ['RS256']
      }) as LicensePayload;

      // Step 2: Check expiration
      if (decoded.exp * 1000 < Date.now()) {
        console.error('License expired');
        return null;
      }

      // Step 3: Check revocation list (online)
      const { data: revoked } = await this.supabase
        .from('revoked_licenses')
        .select('license_key')
        .eq('license_key', licenseKey)
        .single();

      if (revoked) {
        console.error('License revoked');
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('License verification failed:', error);
      return null;
    }
  }

  /**
   * Check if feature is enabled for license
   */
  hasFeature(license: LicensePayload, feature: string): boolean {
    return license.features.includes(feature);
  }

  /**
   * Get tier limitations
   */
  getLimitations(license: LicensePayload) {
    return license.limitations;
  }

  /**
   * Store license locally (encrypted)
   */
  async storeLicense(licenseKey: string): Promise<void> {
    const configPath = path.join(os.homedir(), '.config', 'claude', 'licenses.json');
    const licenses = JSON.parse(await fs.readFile(configPath, 'utf-8') || '{}');

    // Encrypt license key before storage
    const encrypted = this.encrypt(licenseKey);
    licenses[this.getPluginId(licenseKey)] = encrypted;

    await fs.writeFile(configPath, JSON.stringify(licenses, null, 2));
  }

  private encrypt(text: string): string {
    // Use AES-256-GCM for encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, IV);
    return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  }
}
```

### Trial Period Management

```typescript
// File: agents/trial-manager.ts

export class TrialManager {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  /**
   * Start 14-day trial for Pro tier
   */
  async startTrial(userId: string, pluginId: string): Promise<string> {
    // Check if user already used trial
    const { data: existingTrial } = await this.supabase
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .single();

    if (existingTrial) {
      throw new Error('Trial already used for this plugin');
    }

    // Generate trial license (14 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const licensePayload: LicensePayload = {
      sub: userId,
      plugin_id: pluginId,
      tier: 'pro',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(expiresAt.getTime() / 1000),
      features: ['all-pro-features'],
      limitations: {
        monthly_issues: -1,
        concurrency: 3,
        claude_api_tokens: 100000
      }
    };

    const licenseKey = jwt.sign(licensePayload, LICENSE_PRIVATE_KEY, {
      algorithm: 'RS256'
    });

    // Record trial in database
    await this.supabase.from('trials').insert({
      user_id: userId,
      plugin_id: pluginId,
      started_at: new Date(),
      expires_at: expiresAt,
      license_key: licenseKey
    });

    return licenseKey;
  }

  /**
   * Check trial status
   */
  async getTrialStatus(userId: string, pluginId: string) {
    const { data: trial } = await this.supabase
      .from('trials')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .single();

    if (!trial) {
      return { eligible: true, status: 'available' };
    }

    const now = new Date();
    const expiresAt = new Date(trial.expires_at);

    if (now > expiresAt) {
      return {
        eligible: false,
        status: 'expired',
        expiredAt: expiresAt
      };
    }

    return {
      eligible: false,
      status: 'active',
      daysRemaining: Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    };
  }
}
```

---

## Usage Tracking & Quota Management

### Usage Tracking Implementation

```typescript
// File: agents/usage-tracker.ts

export class UsageTracker {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
  );

  /**
   * Track Issue processing
   */
  async trackIssueProcessed(
    userId: string,
    pluginId: string,
    issueNumber: number,
    metadata: {
      repository: string;
      agentsUsed: string[];
      tokensConsumed: number;
      durationMs: number;
    }
  ): Promise<void> {
    await this.supabase.from('usage_events').insert({
      user_id: userId,
      plugin_id: pluginId,
      event_type: 'issue_processed',
      event_data: {
        issue_number: issueNumber,
        ...metadata
      },
      created_at: new Date()
    });

    // Update monthly aggregates
    await this.updateMonthlyUsage(userId, pluginId, 'issues', 1);
    await this.updateMonthlyUsage(userId, pluginId, 'tokens', metadata.tokensConsumed);
  }

  /**
   * Check if user has quota remaining
   */
  async checkQuota(
    userId: string,
    pluginId: string,
    license: LicensePayload
  ): Promise<{ allowed: boolean; remaining?: number; message?: string }> {
    const { monthly_issues, claude_api_tokens } = license.limitations;

    // Unlimited tier
    if (monthly_issues === -1) {
      return { allowed: true };
    }

    // Get current month's usage
    const usage = await this.getMonthlyUsage(userId, pluginId);

    // Check Issue quota
    if (usage.issues >= monthly_issues) {
      return {
        allowed: false,
        remaining: 0,
        message: `Monthly limit reached (${monthly_issues} Issues). Upgrade to Pro for unlimited Issues.`
      };
    }

    // Check token quota
    if (usage.tokens >= claude_api_tokens) {
      return {
        allowed: false,
        remaining: 0,
        message: `API token limit reached (${claude_api_tokens} tokens). Upgrade to Pro for 10x more tokens.`
      };
    }

    return {
      allowed: true,
      remaining: monthly_issues - usage.issues
    };
  }

  /**
   * Get monthly usage stats
   */
  private async getMonthlyUsage(userId: string, pluginId: string) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await this.supabase
      .from('usage_aggregates')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .eq('period', startOfMonth.toISOString().slice(0, 7)) // "YYYY-MM"
      .single();

    return data || { issues: 0, tokens: 0 };
  }

  /**
   * Update monthly usage aggregates
   */
  private async updateMonthlyUsage(
    userId: string,
    pluginId: string,
    metric: 'issues' | 'tokens',
    increment: number
  ) {
    const period = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    await this.supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_plugin_id: pluginId,
      p_period: period,
      p_metric: metric,
      p_increment: increment
    });
  }

  /**
   * Generate usage report
   */
  async generateUsageReport(userId: string, pluginId: string, month: string) {
    const { data: events } = await this.supabase
      .from('usage_events')
      .select('*')
      .eq('user_id', userId)
      .eq('plugin_id', pluginId)
      .gte('created_at', `${month}-01`)
      .lt('created_at', `${month}-31`);

    const summary = {
      total_issues: events?.length || 0,
      total_tokens: events?.reduce((sum, e) => sum + (e.event_data.tokensConsumed || 0), 0) || 0,
      agents_breakdown: this.aggregateAgents(events || []),
      daily_usage: this.aggregateDaily(events || [])
    };

    return summary;
  }

  private aggregateAgents(events: any[]) {
    const agentCounts: Record<string, number> = {};
    events.forEach(event => {
      event.event_data.agentsUsed?.forEach((agent: string) => {
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      });
    });
    return agentCounts;
  }

  private aggregateDaily(events: any[]) {
    const dailyCounts: Record<string, number> = {};
    events.forEach(event => {
      const date = new Date(event.created_at).toISOString().slice(0, 10);
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    return dailyCounts;
  }
}
```

### Command-Level Quota Enforcement

```typescript
// File: commands/agent-run.md (hook integration)

/**
 * Before executing /agent-run command, check quota
 */
async function beforeAgentRun(issues: number[], license: LicensePayload, userId: string) {
  const tracker = new UsageTracker();
  const quotaCheck = await tracker.checkQuota(userId, license.plugin_id, license);

  if (!quotaCheck.allowed) {
    console.error(`❌ ${quotaCheck.message}`);
    console.log(`\n💡 Upgrade to Pro: https://marketplace.miyabi.dev/upgrade`);
    process.exit(1);
  }

  if (quotaCheck.remaining !== undefined && quotaCheck.remaining < 10) {
    console.warn(`⚠️  Warning: ${quotaCheck.remaining} Issues remaining this month`);
  }
}
```

---

## Billing Integration (Stripe)

### Stripe Connect Setup

```typescript
// File: api/billing/stripe-setup.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

/**
 * Create Stripe customer for user
 */
export async function createCustomer(user: {
  id: string;
  email: string;
  name: string;
}) {
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name,
    metadata: {
      user_id: user.id
    }
  });

  return customer.id;
}

/**
 * Create subscription for Pro tier
 */
export async function createProSubscription(
  customerId: string,
  priceId: string = process.env.STRIPE_PRO_PRICE_ID!
) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    trial_period_days: 14 // 14-day trial
  });

  return subscription;
}

/**
 * Create Checkout Session for one-time addon purchase
 */
export async function createCheckoutSession(
  customerId: string,
  pluginId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'payment', // One-time payment
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plugin_id: pluginId
    }
  });

  return session;
}

/**
 * Handle Stripe webhooks
 */
export async function handleWebhook(req: any, res: any) {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  const userId = (customer as any).metadata.user_id;

  // Generate Pro license
  const licenseManager = new LicenseManager();
  const licenseKey = await licenseManager.generateProLicense(userId);

  // Store in database
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: customerId,
    status: subscription.status,
    tier: 'pro',
    license_key: licenseKey,
    current_period_start: new Date(subscription.current_period_start * 1000),
    current_period_end: new Date(subscription.current_period_end * 1000)
  });

  // Send license key via email
  await sendLicenseEmail(userId, licenseKey);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Update subscription status
  // Send receipt email
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.error('Payment failed:', invoice.id);
  // Notify user
  // Grace period: 3 days before downgrade
}
```

### Pricing Configuration

```typescript
// File: api/config/pricing.ts

export const PRICING_TIERS = {
  free: {
    id: 'miyabi-operations-free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    stripe_price_id: null,
    limitations: {
      monthly_issues: 100,
      concurrency: 1,
      claude_api_tokens: 10000,
      support: 'community'
    },
    features: [
      'verify-command',
      'agent-run-command',
      'deploy-command',
      'coordinator-agent',
      'codegen-agent',
      'review-agent'
    ]
  },
  pro: {
    id: 'miyabi-operations-pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    billing_period: 'monthly',
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID,
    trial_days: 14,
    limitations: {
      monthly_issues: -1, // unlimited
      concurrency: 3,
      claude_api_tokens: 100000,
      support: 'priority'
    },
    features: [
      'all-commands',
      'all-agents',
      'advanced-analytics',
      'private-repos',
      'custom-workflows'
    ]
  },
  enterprise: {
    id: 'miyabi-operations-enterprise',
    name: 'Enterprise',
    price: 5000,
    currency: 'USD',
    billing_period: 'monthly',
    stripe_price_id: null, // Contact sales
    limitations: {
      monthly_issues: -1,
      concurrency: -1,
      claude_api_tokens: -1,
      support: 'dedicated'
    },
    features: [
      'all-pro-features',
      'on-premise-deployment',
      'custom-agents',
      'sso-saml',
      'audit-logs',
      'training-workshops'
    ]
  }
};

export const ADDON_PRICING = {
  security_scanner: {
    id: 'miyabi-security-scanner',
    name: 'Security Scanner',
    price: 49,
    currency: 'USD',
    billing_period: 'monthly',
    stripe_price_id: process.env.STRIPE_SECURITY_ADDON_PRICE_ID,
    requires_tier: 'pro'
  },
  workflow_templates: {
    id: 'miyabi-workflow-templates',
    name: 'Workflow Templates Pack',
    price: 19,
    currency: 'USD',
    billing_period: 'one-time',
    stripe_price_id: process.env.STRIPE_TEMPLATES_PRICE_ID,
    requires_tier: 'pro'
  }
};
```

---

## Third-Party Plugin Submission

### Submission API

```typescript
// File: api/plugins/submit.ts

import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/v1/plugins/submit
 * Submit new plugin to marketplace
 */
router.post(
  '/submit',
  requireAuth,
  [
    body('name').isString().matches(/^[a-z0-9-]+$/),
    body('displayName').isString().notEmpty(),
    body('source').matches(/^[A-Za-z0-9-_]+\/[A-Za-z0-9-_]+$/), // GitHub: user/repo
    body('version').matches(/^\d+\.\d+\.\d+$/),
    body('description').isString().notEmpty(),
    body('license').isIn(['MIT', 'Apache-2.0', 'Proprietary']),
    body('tier').isIn(['free', 'paid']),
    body('price').isInt({ min: 0 }),
    body('features').isArray(),
    body('categories').isArray()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const pluginData = req.body;

    try {
      // Step 1: Validate GitHub repository exists
      const repoExists = await validateGitHubRepo(pluginData.source);
      if (!repoExists) {
        return res.status(400).json({ error: 'GitHub repository not found' });
      }

      // Step 2: Clone and validate plugin structure
      const validation = await validatePluginStructure(pluginData.source);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid plugin structure',
          details: validation.errors
        });
      }

      // Step 3: Run quality checks
      const qualityScore = await runQualityChecks(pluginData.source);
      if (qualityScore < 80) {
        return res.status(400).json({
          error: 'Quality score below minimum (80)',
          score: qualityScore,
          details: validation.qualityReport
        });
      }

      // Step 4: Security scan
      const securityScan = await runSecurityScan(pluginData.source);
      if (securityScan.critical > 0) {
        return res.status(400).json({
          error: 'Critical security vulnerabilities found',
          vulnerabilities: securityScan.critical
        });
      }

      // Step 5: Create submission record
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
      const { data: submission } = await supabase.from('plugin_submissions').insert({
        user_id: userId,
        plugin_data: pluginData,
        quality_score: qualityScore,
        security_scan: securityScan,
        status: 'pending_review',
        submitted_at: new Date()
      }).select().single();

      // Step 6: Notify review team
      await notifyReviewTeam(submission.id);

      res.json({
        success: true,
        submission_id: submission.id,
        status: 'pending_review',
        estimated_review_time: '3-5 business days',
        quality_score: qualityScore
      });
    } catch (error) {
      console.error('Plugin submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/v1/plugins/submissions/:id
 * Check submission status
 */
router.get('/submissions/:id', requireAuth, async (req, res) => {
  const submissionId = req.params.id;
  const userId = req.user.id;

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  const { data: submission } = await supabase
    .from('plugin_submissions')
    .select('*')
    .eq('id', submissionId)
    .eq('user_id', userId)
    .single();

  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  res.json(submission);
});

export default router;
```

### Quality Validation

```typescript
// File: api/plugins/quality-checker.ts

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export async function runQualityChecks(repoSource: string) {
  const tmpDir = `/tmp/plugin-validation-${Date.now()}`;

  try {
    // Clone repository
    await execAsync(`git clone https://github.com/${repoSource} ${tmpDir}`);

    // Run checks in parallel
    const [
      eslintScore,
      typescriptScore,
      testScore,
      docScore
    ] = await Promise.all([
      checkESLint(tmpDir),
      checkTypeScript(tmpDir),
      checkTestCoverage(tmpDir),
      checkDocumentation(tmpDir)
    ]);

    // Quality formula (100-point scale)
    const qualityScore = Math.floor(
      eslintScore * 0.25 +
      typescriptScore * 0.25 +
      testScore * 0.35 +
      docScore * 0.15
    );

    return qualityScore;
  } finally {
    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

async function checkESLint(dir: string): Promise<number> {
  try {
    await execAsync('npm install', { cwd: dir });
    const { stdout } = await execAsync('npx eslint . --format json', { cwd: dir });
    const results = JSON.parse(stdout);

    const errorCount = results.reduce((sum: number, r: any) => sum + r.errorCount, 0);
    const warningCount = results.reduce((sum: number, r: any) => sum + r.warningCount, 0);

    // Score: 100 - (errors × 5 + warnings × 2)
    return Math.max(0, 100 - (errorCount * 5 + warningCount * 2));
  } catch {
    return 0;
  }
}

async function checkTypeScript(dir: string): Promise<number> {
  try {
    const { stdout } = await execAsync('npx tsc --noEmit --pretty false', { cwd: dir });
    const errorCount = (stdout.match(/error TS/g) || []).length;

    // Score: 100 - (TS errors × 10)
    return Math.max(0, 100 - (errorCount * 10));
  } catch {
    return 0;
  }
}

async function checkTestCoverage(dir: string): Promise<number> {
  try {
    await execAsync('npm test -- --coverage --json', { cwd: dir });
    const coverageFile = path.join(dir, 'coverage', 'coverage-summary.json');
    const coverage = JSON.parse(await fs.readFile(coverageFile, 'utf-8'));

    const totalCoverage = coverage.total.lines.pct;
    return totalCoverage; // 0-100
  } catch {
    return 0;
  }
}

async function checkDocumentation(dir: string): Promise<number> {
  let score = 0;

  // Check README
  if (await fileExists(path.join(dir, 'README.md'))) score += 40;

  // Check plugin manifest
  if (await fileExists(path.join(dir, '.claude-plugin', 'plugin.json'))) score += 30;

  // Check examples
  if (await fileExists(path.join(dir, 'examples'))) score += 15;

  // Check changelog
  if (await fileExists(path.join(dir, 'CHANGELOG.md'))) score += 15;

  return score;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
```

---

## API Specification

### Marketplace API Endpoints

```
Base URL: https://api.miyabi.dev/v1
```

#### Authentication

All API requests require authentication via Bearer token:

```
Authorization: Bearer <JWT_TOKEN>
```

#### Endpoints

**1. List Plugins**

```
GET /marketplace/plugins
Query Parameters:
  - category: string (optional)
  - tier: "free" | "pro" | "enterprise" (optional)
  - search: string (optional)
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)

Response:
{
  "plugins": [
    {
      "id": "miyabi-operations-pro",
      "name": "Miyabi Operations - Pro",
      "version": "1.0.0",
      "tier": "pro",
      "price": 29,
      "description": "...",
      "features": [...],
      "downloads": 1500,
      "rating": 4.8,
      "verified": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

**2. Get Plugin Details**

```
GET /marketplace/plugins/:pluginId

Response:
{
  "id": "miyabi-operations-pro",
  "name": "Miyabi Operations - Pro",
  "version": "1.0.0",
  "tier": "pro",
  "price": 29,
  "description": "...",
  "features": [...],
  "requirements": {...},
  "downloads": 1500,
  "rating": 4.8,
  "reviews": [...],
  "changelog": [...],
  "author": {...},
  "verified": true
}
```

**3. Purchase/Subscribe**

```
POST /marketplace/plugins/:pluginId/purchase
Body:
{
  "tier": "pro",
  "payment_method_id": "pm_123456",
  "billing_cycle": "monthly"
}

Response:
{
  "subscription_id": "sub_123456",
  "license_key": "eyJhbGc...",
  "status": "active",
  "trial_ends_at": "2025-10-25T00:00:00Z"
}
```

**4. Verify License**

```
POST /licenses/verify
Body:
{
  "license_key": "eyJhbGc..."
}

Response:
{
  "valid": true,
  "plugin_id": "miyabi-operations-pro",
  "tier": "pro",
  "expires_at": "2025-11-01T00:00:00Z",
  "features": [...],
  "limitations": {...}
}
```

**5. Usage Stats**

```
GET /usage/stats?period=2025-10

Response:
{
  "period": "2025-10",
  "usage": {
    "issues_processed": 45,
    "tokens_consumed": 25000,
    "agents_executed": {
      "coordinator": 45,
      "codegen": 38,
      "review": 42
    }
  },
  "quota": {
    "issues_limit": -1,
    "issues_remaining": -1,
    "tokens_limit": 100000,
    "tokens_remaining": 75000
  }
}
```

---

## Database Schema

### PostgreSQL Tables (Supabase)

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plugins table
CREATE TABLE plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  version TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise', 'addon')),
  price INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'one-time')),
  author_id UUID REFERENCES users(id),
  description TEXT,
  features JSONB,
  limitations JSONB,
  categories TEXT[],
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  downloads INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL,
  license_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trial')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plugin_id)
);

-- Licenses table
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL,
  features JSONB,
  limitations JSONB,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ
);

-- Usage events table
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage aggregates table (monthly rollups)
CREATE TABLE usage_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  period TEXT NOT NULL, -- "YYYY-MM"
  issues INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  agent_executions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plugin_id, period)
);

-- Trials table
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  license_key TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, plugin_id)
);

-- Revoked licenses table
CREATE TABLE revoked_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_key TEXT UNIQUE NOT NULL,
  reason TEXT,
  revoked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plugin submissions table
CREATE TABLE plugin_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_data JSONB NOT NULL,
  quality_score INTEGER,
  security_scan JSONB,
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'approved', 'rejected')),
  review_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Plugin reviews table
CREATE TABLE plugin_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_events_user_plugin ON usage_events(user_id, plugin_id, created_at);
CREATE INDEX idx_usage_aggregates_period ON usage_aggregates(user_id, plugin_id, period);
CREATE INDEX idx_licenses_user_plugin ON licenses(user_id, plugin_id);

-- RPC function for atomic usage increment
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_plugin_id TEXT,
  p_period TEXT,
  p_metric TEXT,
  p_increment INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_aggregates (user_id, plugin_id, period, issues, tokens)
  VALUES (p_user_id, p_plugin_id, p_period,
    CASE WHEN p_metric = 'issues' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric = 'tokens' THEN p_increment ELSE 0 END)
  ON CONFLICT (user_id, plugin_id, period)
  DO UPDATE SET
    issues = usage_aggregates.issues + (CASE WHEN p_metric = 'issues' THEN p_increment ELSE 0 END),
    tokens = usage_aggregates.tokens + (CASE WHEN p_metric = 'tokens' THEN p_increment ELSE 0 END),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

---

## Security & Authentication

### JWT Authentication

```typescript
// File: api/middleware/auth.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Rate Limiting

```typescript
// File: api/middleware/rate-limit.ts

import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rate_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

export const purchaseLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'purchase_limit:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 purchases per hour
  message: 'Too many purchase attempts'
});
```

---

## Implementation Timeline

### Phase 1: Core Infrastructure (Weeks 1-2)
- Database schema setup (Supabase)
- Authentication system (JWT)
- License generation & verification
- Basic usage tracking

### Phase 2: Billing Integration (Weeks 3-4)
- Stripe Connect setup
- Subscription management
- Webhook handlers
- Payment flow (checkout, invoicing)

### Phase 3: Plugin Submission (Weeks 5-6)
- Submission API
- Quality checks automation
- Security scanning
- Review workflow

### Phase 4: Marketplace API (Weeks 7-8)
- Plugin listing API
- Search & filtering
- Reviews & ratings
- Analytics dashboard

### Phase 5: Testing & Launch (Weeks 9-10)
- Integration testing
- Load testing
- Security audit
- Public beta launch

---

**Total Implementation Time**: 10 weeks (2.5 months)

**Team Required**:
- 1 Backend Engineer (Node.js/TypeScript)
- 1 Database Engineer (PostgreSQL)
- 1 DevOps Engineer (Vercel/Supabase)
- 1 QA Engineer (Testing)

**Budget Estimate**:
- Development: $80K (10 weeks × $8K/week)
- Infrastructure: $500/month (Supabase + Vercel)
- Stripe fees: 2.9% + $0.30 per transaction
- Total: ~$85K initial investment

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
