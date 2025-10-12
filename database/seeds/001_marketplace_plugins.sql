-- Miyabi Marketplace Database - Seed Data
-- Initial marketplace plugins from marketplace-business.json
-- Version: 1.0.0
-- Created: 2025-10-11

-- ============================================================================
-- CREATE ADMIN USER (for plugin authorship)
-- ============================================================================

INSERT INTO users (id, email, name, role, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'supernovasyun@gmail.com',
  'Shunsuke Hayashi',
  'admin',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SEED PLUGINS FROM MARKETPLACE-BUSINESS.JSON
-- ============================================================================

-- 1. Miyabi Operations - Free
INSERT INTO plugins (
  id,
  name,
  display_name,
  source,
  version,
  tier,
  price,
  currency,
  billing_period,
  author_id,
  description,
  features,
  limitations,
  categories,
  verified,
  featured,
  trial_period
) VALUES (
  'miyabi-operations-free',
  'miyabi-operations-free',
  'Miyabi Operations - Free',
  'ShunsukeHayashi/Miyabi',
  '1.0.0',
  'free',
  0,
  'USD',
  NULL,
  '00000000-0000-0000-0000-000000000001',
  'Free tier with basic autonomous operations (100 Issues/month)',
  '["3 slash commands (/verify, /agent-run, /deploy)", "3 autonomous agents (Coordinator, CodeGen, Review)", "Monthly limit: 100 Issues", "Parallel execution: 1 concurrent task", "Community support (GitHub Discussions)"]'::jsonb,
  '{"monthly_issues": 100, "concurrency": 1, "claude_api_tokens": 10000, "support": "community"}'::jsonb,
  ARRAY['Free', 'Automation', 'GitHub'],
  true,
  true,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 2. Miyabi Operations - Pro
INSERT INTO plugins (
  id,
  name,
  display_name,
  source,
  version,
  tier,
  price,
  currency,
  billing_period,
  author_id,
  description,
  features,
  limitations,
  categories,
  verified,
  featured,
  trial_period
) VALUES (
  'miyabi-operations-pro',
  'miyabi-operations-pro',
  'Miyabi Operations - Pro',
  'ShunsukeHayashi/Miyabi',
  '1.0.0',
  'pro',
  2900,
  'USD',
  'monthly',
  '00000000-0000-0000-0000-000000000001',
  'Professional tier with unlimited Issues and priority support',
  '["8 slash commands (all features)", "6 autonomous agents (full suite)", "Unlimited Issues per month", "Parallel execution: 3 concurrent tasks", "Priority support (Email, 24h response)", "Private repository support", "Custom workflows (5 max)", "Advanced analytics dashboard"]'::jsonb,
  '{"monthly_issues": -1, "concurrency": 3, "claude_api_tokens": 100000, "support": "priority"}'::jsonb,
  ARRAY['Premium', 'Automation', 'GitHub', 'Enterprise'],
  true,
  true,
  14
) ON CONFLICT (id) DO NOTHING;

-- 3. Miyabi Operations - Enterprise
INSERT INTO plugins (
  id,
  name,
  display_name,
  source,
  version,
  tier,
  price,
  currency,
  billing_period,
  author_id,
  description,
  features,
  limitations,
  categories,
  verified,
  featured,
  trial_period
) VALUES (
  'miyabi-operations-enterprise',
  'miyabi-operations-enterprise',
  'Miyabi Operations - Enterprise',
  'ShunsukeHayashi/Miyabi',
  '1.0.0',
  'enterprise',
  500000,
  'USD',
  'monthly',
  '00000000-0000-0000-0000-000000000001',
  'Enterprise tier with on-premise deployment and dedicated support',
  '["All Pro features", "Unlimited users", "Unlimited concurrent execution", "On-premise / Private Cloud deployment", "Custom agent development", "Dedicated support team (1h response)", "SLA: 99.9% uptime", "SSO/SAML authentication", "Audit logs (unlimited retention)", "Training & workshops (4x/year)"]'::jsonb,
  '{"monthly_issues": -1, "concurrency": -1, "claude_api_tokens": -1, "support": "dedicated"}'::jsonb,
  ARRAY['Enterprise', 'Automation', 'GitHub', 'On-Premise'],
  true,
  true,
  NULL
) ON CONFLICT (id) DO NOTHING;

-- 4. Miyabi Security Scanner (Add-on)
INSERT INTO plugins (
  id,
  name,
  display_name,
  source,
  version,
  tier,
  price,
  currency,
  billing_period,
  author_id,
  description,
  features,
  limitations,
  categories,
  verified,
  featured,
  requires_plugin
) VALUES (
  'miyabi-security-scanner',
  'miyabi-security-scanner',
  'Miyabi Security Scanner',
  'ShunsukeHayashi/miyabi-security',
  '1.0.0',
  'addon',
  4900,
  'USD',
  'monthly',
  '00000000-0000-0000-0000-000000000001',
  'Advanced security vulnerability scanning with SAST/DAST',
  '["SAST (Static Application Security Testing)", "DAST (Dynamic Application Security Testing)", "Dependency vulnerability scanning", "Secret detection", "Compliance reports (SOC2, GDPR)", "Security score dashboard", "Automatic CVE monitoring"]'::jsonb,
  '{}'::jsonb,
  ARRAY['Security', 'Add-on', 'Premium'],
  true,
  false,
  'miyabi-operations-pro'
) ON CONFLICT (id) DO NOTHING;

-- 5. Miyabi Workflow Templates Pack (Add-on)
INSERT INTO plugins (
  id,
  name,
  display_name,
  source,
  version,
  tier,
  price,
  currency,
  billing_period,
  author_id,
  description,
  features,
  limitations,
  categories,
  verified,
  featured,
  requires_plugin
) VALUES (
  'miyabi-workflow-templates',
  'miyabi-workflow-templates',
  'Miyabi Workflow Templates Pack',
  'ShunsukeHayashi/miyabi-workflows',
  '1.0.0',
  'addon',
  1900,
  'USD',
  'one-time',
  '00000000-0000-0000-0000-000000000001',
  'Pre-built workflow templates for common use cases (SaaS, E-commerce, Fintech)',
  '["50+ pre-built workflow templates", "Industry-specific templates (SaaS, E-commerce, Fintech)", "Best practices embedded", "Customizable templates", "Regular updates"]'::jsonb,
  '{}'::jsonb,
  ARRAY['Templates', 'Add-on', 'Premium'],
  true,
  false,
  'miyabi-operations-pro'
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- VERIFY SEED DATA
-- ============================================================================

-- Count plugins
DO $$
DECLARE
  plugin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO plugin_count FROM plugins;
  RAISE NOTICE 'Seeded % plugins', plugin_count;
END $$;

-- ============================================================================
-- LOG SEED COMPLETION
-- ============================================================================

INSERT INTO logs (level, message, data)
VALUES ('info', 'Seed 001_marketplace_plugins completed', jsonb_build_object('plugins', 5, 'admin_user', 1));
