-- Miyabi Marketplace Database Schema
-- Initial migration: Core tables, indexes, and functions
-- Version: 1.0.0
-- Created: 2025-10-11

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE users IS 'User accounts for marketplace';
COMMENT ON COLUMN users.role IS 'user or admin';
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';

-- ============================================================================
-- PLUGINS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS plugins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  source TEXT NOT NULL,
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
  requires_plugin TEXT,
  trial_period INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE plugins IS 'Available plugins in marketplace';
COMMENT ON COLUMN plugins.tier IS 'free, pro, enterprise, or addon';
COMMENT ON COLUMN plugins.price IS 'Price in cents';
COMMENT ON COLUMN plugins.features IS 'JSON array of feature strings';
COMMENT ON COLUMN plugins.limitations IS 'JSON object with quota limits';
COMMENT ON COLUMN plugins.trial_period IS 'Trial period in days';

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
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
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plugin_id)
);

COMMENT ON TABLE subscriptions IS 'User plugin subscriptions';
COMMENT ON COLUMN subscriptions.status IS 'active, canceled, past_due, or trial';
COMMENT ON COLUMN subscriptions.license_key IS 'JWT license key';

-- ============================================================================
-- LICENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS licenses (
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

COMMENT ON TABLE licenses IS 'Generated license keys';
COMMENT ON COLUMN licenses.license_key IS 'JWT license key';
COMMENT ON COLUMN licenses.revoked IS 'Whether license has been revoked';

-- ============================================================================
-- USAGE_EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE usage_events IS 'Individual usage events';
COMMENT ON COLUMN usage_events.event_type IS 'issue_processed, agent_executed, command_used';
COMMENT ON COLUMN usage_events.event_data IS 'JSON object with event-specific data';

-- ============================================================================
-- USAGE_AGGREGATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  period TEXT NOT NULL,
  issues INTEGER DEFAULT 0,
  tokens INTEGER DEFAULT 0,
  agent_executions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plugin_id, period)
);

COMMENT ON TABLE usage_aggregates IS 'Monthly usage aggregates';
COMMENT ON COLUMN usage_aggregates.period IS 'YYYY-MM format';
COMMENT ON COLUMN usage_aggregates.agent_executions IS 'JSON object with agent names as keys';

-- ============================================================================
-- TRIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  license_key TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, plugin_id)
);

COMMENT ON TABLE trials IS 'Trial period tracking';
COMMENT ON COLUMN trials.expires_at IS 'When trial expires';

-- ============================================================================
-- REVOKED_LICENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS revoked_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_key TEXT UNIQUE NOT NULL,
  reason TEXT,
  revoked_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE revoked_licenses IS 'Revoked license keys';
COMMENT ON COLUMN revoked_licenses.reason IS 'Reason for revocation';

-- ============================================================================
-- PLUGIN_SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS plugin_submissions (
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

COMMENT ON TABLE plugin_submissions IS 'Third-party plugin submissions';
COMMENT ON COLUMN plugin_submissions.quality_score IS 'Quality score out of 100';
COMMENT ON COLUMN plugin_submissions.security_scan IS 'Security scan results';

-- ============================================================================
-- PLUGIN_REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS plugin_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plugin_id TEXT REFERENCES plugins(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

COMMENT ON TABLE plugin_reviews IS 'Plugin reviews and ratings';
COMMENT ON COLUMN plugin_reviews.rating IS '1-5 stars';

-- ============================================================================
-- LOGS TABLE (for debugging and monitoring)
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE logs IS 'Application logs';
COMMENT ON COLUMN logs.level IS 'info, warn, or error';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Plugins
CREATE INDEX IF NOT EXISTS idx_plugins_tier ON plugins(tier);
CREATE INDEX IF NOT EXISTS idx_plugins_verified ON plugins(verified);
CREATE INDEX IF NOT EXISTS idx_plugins_featured ON plugins(featured);
CREATE INDEX IF NOT EXISTS idx_plugins_categories ON plugins USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_plugins_downloads ON plugins(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_plugins_rating ON plugins(rating DESC);

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plugin_id ON subscriptions(plugin_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Licenses
CREATE INDEX IF NOT EXISTS idx_licenses_user_plugin ON licenses(user_id, plugin_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);

-- Usage Events
CREATE INDEX IF NOT EXISTS idx_usage_events_user_plugin ON usage_events(user_id, plugin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_events_type ON usage_events(event_type);

-- Usage Aggregates
CREATE INDEX IF NOT EXISTS idx_usage_aggregates_period ON usage_aggregates(user_id, plugin_id, period);

-- Trials
CREATE INDEX IF NOT EXISTS idx_trials_user_plugin ON trials(user_id, plugin_id);
CREATE INDEX IF NOT EXISTS idx_trials_expires_at ON trials(expires_at);

-- Plugin Submissions
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON plugin_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON plugin_submissions(status);

-- Plugin Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_plugin_id ON plugin_reviews(plugin_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON plugin_reviews(rating);

-- Logs
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at DESC);

-- ============================================================================
-- DATABASE FUNCTIONS (RPC)
-- ============================================================================

-- Function: Increment usage (atomic)
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_plugin_id TEXT,
  p_period TEXT,
  p_metric TEXT,
  p_increment INTEGER
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_aggregates (user_id, plugin_id, period, issues, tokens)
  VALUES (
    p_user_id,
    p_plugin_id,
    p_period,
    CASE WHEN p_metric = 'issues' THEN p_increment ELSE 0 END,
    CASE WHEN p_metric = 'tokens' THEN p_increment ELSE 0 END
  )
  ON CONFLICT (user_id, plugin_id, period)
  DO UPDATE SET
    issues = usage_aggregates.issues + (CASE WHEN p_metric = 'issues' THEN p_increment ELSE 0 END),
    tokens = usage_aggregates.tokens + (CASE WHEN p_metric = 'tokens' THEN p_increment ELSE 0 END),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_usage IS 'Atomically increment usage metrics';

-- Function: Increment agent execution count
CREATE OR REPLACE FUNCTION increment_agent_execution(
  p_user_id UUID,
  p_plugin_id TEXT,
  p_period TEXT,
  p_agent_name TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_aggregates (user_id, plugin_id, period, agent_executions)
  VALUES (
    p_user_id,
    p_plugin_id,
    p_period,
    jsonb_build_object(p_agent_name, 1)
  )
  ON CONFLICT (user_id, plugin_id, period)
  DO UPDATE SET
    agent_executions = jsonb_set(
      COALESCE(usage_aggregates.agent_executions, '{}'::jsonb),
      ARRAY[p_agent_name],
      to_jsonb(COALESCE((usage_aggregates.agent_executions->>p_agent_name)::integer, 0) + 1)
    ),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_agent_execution IS 'Increment agent execution count in JSON object';

-- Function: Increment download count
CREATE OR REPLACE FUNCTION increment_downloads(
  p_plugin_id TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE plugins
  SET downloads = downloads + 1,
      updated_at = NOW()
  WHERE id = p_plugin_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_downloads IS 'Increment plugin download count';

-- Function: Update plugin rating (from reviews)
CREATE OR REPLACE FUNCTION update_plugin_rating(
  p_plugin_id TEXT
) RETURNS VOID AS $$
DECLARE
  v_avg_rating NUMERIC;
BEGIN
  SELECT AVG(rating) INTO v_avg_rating
  FROM plugin_reviews
  WHERE plugin_id = p_plugin_id;

  UPDATE plugins
  SET rating = COALESCE(v_avg_rating, 0),
      updated_at = NOW()
  WHERE id = p_plugin_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_plugin_rating IS 'Recalculate plugin rating from reviews';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update plugin rating after review insert/update/delete
CREATE OR REPLACE FUNCTION trigger_update_plugin_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_plugin_rating(OLD.plugin_id);
    RETURN OLD;
  ELSE
    PERFORM update_plugin_rating(NEW.plugin_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_plugin_review_rating ON plugin_reviews;
CREATE TRIGGER trg_plugin_review_rating
  AFTER INSERT OR UPDATE OR DELETE ON plugin_reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_plugin_rating();

COMMENT ON TRIGGER trg_plugin_review_rating ON plugin_reviews IS 'Auto-update plugin rating when review changes';

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_plugins_updated_at ON plugins;
CREATE TRIGGER trg_plugins_updated_at
  BEFORE UPDATE ON plugins
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

DROP TRIGGER IF EXISTS trg_usage_aggregates_updated_at ON usage_aggregates;
CREATE TRIGGER trg_usage_aggregates_updated_at
  BEFORE UPDATE ON usage_aggregates
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
INSERT INTO logs (level, message, data)
VALUES ('info', 'Migration 001_initial_schema completed', jsonb_build_object('version', '1.0.0', 'tables', 11));
