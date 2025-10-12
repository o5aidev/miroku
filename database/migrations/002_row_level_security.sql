-- Miyabi Marketplace Database - Row Level Security Policies
-- Migration 002: RLS policies for all tables
-- Version: 1.0.0
-- Created: 2025-10-11

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE revoked_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own data
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "users_select_admin"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PLUGINS TABLE POLICIES
-- ============================================================================

-- Anyone can view public plugins (for marketplace browsing)
CREATE POLICY "plugins_select_all"
  ON plugins FOR SELECT
  USING (true);

-- Plugin authors can update their own plugins
CREATE POLICY "plugins_update_author"
  ON plugins FOR UPDATE
  USING (auth.uid() = author_id);

-- Admins can do anything with plugins
CREATE POLICY "plugins_all_admin"
  ON plugins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own subscriptions
CREATE POLICY "subscriptions_select_own"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own subscriptions (for cancellation)
CREATE POLICY "subscriptions_update_own"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can insert subscriptions (for purchase flow)
CREATE POLICY "subscriptions_insert_service"
  ON subscriptions FOR INSERT
  WITH CHECK (true);

-- Admins can view all subscriptions
CREATE POLICY "subscriptions_select_admin"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- LICENSES TABLE POLICIES
-- ============================================================================

-- Users can view their own licenses
CREATE POLICY "licenses_select_own"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert licenses (for license generation)
CREATE POLICY "licenses_insert_service"
  ON licenses FOR INSERT
  WITH CHECK (true);

-- Admins can update licenses (for revocation)
CREATE POLICY "licenses_update_admin"
  ON licenses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- USAGE_EVENTS TABLE POLICIES
-- ============================================================================

-- Users can view their own usage events
CREATE POLICY "usage_events_select_own"
  ON usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage events (for tracking)
CREATE POLICY "usage_events_insert_service"
  ON usage_events FOR INSERT
  WITH CHECK (true);

-- Admins can view all usage events
CREATE POLICY "usage_events_select_admin"
  ON usage_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- USAGE_AGGREGATES TABLE POLICIES
-- ============================================================================

-- Users can view their own usage aggregates
CREATE POLICY "usage_aggregates_select_own"
  ON usage_aggregates FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert/update usage aggregates (for tracking)
CREATE POLICY "usage_aggregates_insert_service"
  ON usage_aggregates FOR INSERT
  WITH CHECK (true);

CREATE POLICY "usage_aggregates_update_service"
  ON usage_aggregates FOR UPDATE
  USING (true);

-- Admins can view all usage aggregates
CREATE POLICY "usage_aggregates_select_admin"
  ON usage_aggregates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- TRIALS TABLE POLICIES
-- ============================================================================

-- Users can view their own trials
CREATE POLICY "trials_select_own"
  ON trials FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert trials (for trial activation)
CREATE POLICY "trials_insert_service"
  ON trials FOR INSERT
  WITH CHECK (true);

-- Admins can view all trials
CREATE POLICY "trials_select_admin"
  ON trials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- REVOKED_LICENSES TABLE POLICIES
-- ============================================================================

-- Anyone can check if a license is revoked (for verification)
CREATE POLICY "revoked_licenses_select_all"
  ON revoked_licenses FOR SELECT
  USING (true);

-- Only admins can revoke licenses
CREATE POLICY "revoked_licenses_insert_admin"
  ON revoked_licenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PLUGIN_SUBMISSIONS TABLE POLICIES
-- ============================================================================

-- Users can view their own submissions
CREATE POLICY "plugin_submissions_select_own"
  ON plugin_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "plugin_submissions_insert_own"
  ON plugin_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view and update all submissions
CREATE POLICY "plugin_submissions_select_admin"
  ON plugin_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "plugin_submissions_update_admin"
  ON plugin_submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- PLUGIN_REVIEWS TABLE POLICIES
-- ============================================================================

-- Anyone can view reviews (for plugin marketplace)
CREATE POLICY "plugin_reviews_select_all"
  ON plugin_reviews FOR SELECT
  USING (true);

-- Users can insert their own reviews
CREATE POLICY "plugin_reviews_insert_own"
  ON plugin_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update/delete their own reviews
CREATE POLICY "plugin_reviews_update_own"
  ON plugin_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "plugin_reviews_delete_own"
  ON plugin_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can delete any review (moderation)
CREATE POLICY "plugin_reviews_delete_admin"
  ON plugin_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- LOGS TABLE POLICIES
-- ============================================================================

-- Service role can insert logs
CREATE POLICY "logs_insert_service"
  ON logs FOR INSERT
  WITH CHECK (true);

-- Admins can view logs
CREATE POLICY "logs_select_admin"
  ON logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant select on all tables to authenticated users (RLS will filter)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant insert/update/delete where appropriate (RLS will filter)
GRANT INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT INSERT, UPDATE ON subscriptions TO authenticated;
GRANT INSERT ON plugin_submissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON plugin_reviews TO authenticated;

-- ============================================================================
-- GRANT PERMISSIONS TO SERVICE ROLE (bypass RLS)
-- ============================================================================

-- Service role needs full access for API operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
INSERT INTO logs (level, message, data)
VALUES ('info', 'Migration 002_row_level_security completed', jsonb_build_object('version', '1.0.0', 'policies', 34));
