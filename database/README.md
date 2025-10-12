# Miyabi Marketplace Database

Complete database schema, migrations, and seed data for the Miyabi Plugin Marketplace.

## 📋 Overview

This directory contains all database-related files for the marketplace:

- **11 PostgreSQL tables** - Complete data model
- **34 RLS policies** - Row-level security
- **4 database functions** - Atomic operations
- **5 triggers** - Automated updates
- **Migration scripts** - Version-controlled schema changes
- **Seed data** - Initial marketplace plugins

---

## 🗄️ Database Schema

### Tables

| Table | Description | Rows (Initial) |
|-------|-------------|----------------|
| `users` | User accounts | 1 (admin) |
| `plugins` | Available plugins | 5 |
| `subscriptions` | User subscriptions | 0 |
| `licenses` | Generated licenses | 0 |
| `usage_events` | Individual usage events | 0 |
| `usage_aggregates` | Monthly usage rollups | 0 |
| `trials` | Trial tracking | 0 |
| `revoked_licenses` | Revoked license keys | 0 |
| `plugin_submissions` | Third-party submissions | 0 |
| `plugin_reviews` | Plugin reviews | 0 |
| `logs` | Application logs | 2 |

### Relationships

```
users (1) ----< (N) subscriptions
users (1) ----< (N) licenses
users (1) ----< (N) usage_events
users (1) ----< (N) plugin_submissions
users (1) ----< (N) plugin_reviews

plugins (1) ----< (N) subscriptions
plugins (1) ----< (N) licenses
plugins (1) ----< (N) usage_events
plugins (1) ----< (N) plugin_reviews

plugins (1) ----< (N) plugins (self-reference via requires_plugin)
```

---

## 🚀 Quick Start

### Prerequisites

- PostgreSQL 14+ (or Supabase account)
- `psql` command-line tool
- Environment variable: `DATABASE_URL`

### Setup Database URL

**Option 1: Supabase**

1. Create project at https://supabase.com
2. Go to Project Settings → Database
3. Copy "Connection string (URI)"
4. Export as environment variable:

```bash
export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'
```

**Option 2: Local PostgreSQL**

```bash
export DATABASE_URL='postgresql://localhost:5432/miyabi_marketplace'
```

### Run Migrations

```bash
# Run all migrations
./migrate.sh

# Run migrations + seed data
./migrate.sh --seed

# Dry run (preview without executing)
./migrate.sh --dry-run

# Rollback (WARNING: Drops all tables!)
./migrate.sh --rollback
```

### Verify Installation

```bash
# Check table count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"

# Check plugin count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM plugins;"

# View all plugins
psql $DATABASE_URL -c "SELECT id, display_name, tier, price FROM plugins ORDER BY tier;"
```

---

## 📁 Directory Structure

```
database/
├── migrations/
│   ├── 001_initial_schema.sql     # Core schema (11 tables, indexes, functions)
│   └── 002_row_level_security.sql # RLS policies (34 policies)
├── seeds/
│   └── 001_marketplace_plugins.sql # Initial plugins (5 plugins)
├── migrate.sh                      # Migration runner script
└── README.md                       # This file
```

---

## 📝 Migrations

### Migration 001: Initial Schema

**File**: `migrations/001_initial_schema.sql`

Creates:
- 11 tables with all columns and constraints
- 20+ indexes for performance
- 4 database functions (RPC)
- 5 triggers for automation

**Functions**:
- `increment_usage(user_id, plugin_id, period, metric, increment)` - Atomic usage updates
- `increment_agent_execution(user_id, plugin_id, period, agent_name)` - Agent count tracking
- `increment_downloads(plugin_id)` - Download counter
- `update_plugin_rating(plugin_id)` - Recalculate rating from reviews

**Triggers**:
- Auto-update `updated_at` on users, plugins, subscriptions, usage_aggregates
- Auto-update plugin rating when reviews change

### Migration 002: Row Level Security

**File**: `migrations/002_row_level_security.sql`

Creates:
- 34 RLS policies across all tables
- Security model:
  - Users can view/edit their own data
  - Public read access for plugins, reviews
  - Admin full access
  - Service role bypass (for API operations)

**Security Principles**:
- **Least Privilege**: Users only see their data
- **Defense in Depth**: RLS + app-level checks
- **Admin Override**: Admins can view/manage everything
- **Service Role**: API has full access via service_role key

---

## 🌱 Seed Data

### Seed 001: Marketplace Plugins

**File**: `seeds/001_marketplace_plugins.sql`

Inserts:
- 1 admin user (Shunsuke Hayashi)
- 5 plugins from `marketplace-business.json`:
  - miyabi-operations-free ($0)
  - miyabi-operations-pro ($29/month)
  - miyabi-operations-enterprise ($5,000/month)
  - miyabi-security-scanner ($49/month)
  - miyabi-workflow-templates ($19 one-time)

**Usage**:
```bash
./migrate.sh --seed
```

---

## 🔐 Security

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:

**Users**:
- Users can view/update their own profile
- Admins can view all users

**Plugins**:
- Anyone can view plugins (public marketplace)
- Authors can update their plugins
- Admins have full control

**Subscriptions**:
- Users can view/cancel their subscriptions
- Service role can create subscriptions

**Usage Data**:
- Users can view their own usage
- Service role can insert/update usage
- Admins can view all usage

### Authentication

Database expects Supabase Auth:
- `auth.uid()` returns current user ID
- `authenticated` role for logged-in users
- `service_role` for API backend (bypasses RLS)

---

## 🧪 Testing

### Test Connection

```bash
psql $DATABASE_URL -c "SELECT NOW();"
```

### Test Migrations

```bash
# Dry run (safe)
./migrate.sh --dry-run

# Test rollback + migrate + seed cycle
./migrate.sh --rollback
./migrate.sh --seed
```

### Verify Data Integrity

```bash
# Check foreign key constraints
psql $DATABASE_URL << 'EOF'
SELECT
  conname,
  conrelid::regclass AS table_name,
  confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;
EOF

# Check indexes
psql $DATABASE_URL << 'EOF'
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
EOF
```

---

## 📊 Database Functions (RPC)

### increment_usage

Atomically increment usage metrics.

```sql
SELECT increment_usage(
  'user-uuid'::uuid,
  'miyabi-operations-pro',
  '2025-10',
  'issues',
  1
);
```

### increment_agent_execution

Track agent executions.

```sql
SELECT increment_agent_execution(
  'user-uuid'::uuid,
  'miyabi-operations-pro',
  '2025-10',
  'coordinator'
);
```

### increment_downloads

Increment plugin download count.

```sql
SELECT increment_downloads('miyabi-operations-pro');
```

### update_plugin_rating

Recalculate plugin rating from reviews.

```sql
SELECT update_plugin_rating('miyabi-operations-pro');
```

---

## 🔧 Maintenance

### Backup Database

```bash
# Full backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Schema only
pg_dump $DATABASE_URL --schema-only > schema_$(date +%Y%m%d).sql

# Data only
pg_dump $DATABASE_URL --data-only > data_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql $DATABASE_URL < backup_20251011.sql
```

### Vacuum & Analyze

```bash
psql $DATABASE_URL -c "VACUUM ANALYZE;"
```

### View Table Sizes

```bash
psql $DATABASE_URL << 'EOF'
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
EOF
```

---

## 🐛 Troubleshooting

### Connection Refused

**Symptom**: `could not connect to server`

**Solutions**:
1. Check `DATABASE_URL` is correct
2. Verify PostgreSQL is running
3. Check firewall rules
4. For Supabase: Check project is not paused

### Permission Denied

**Symptom**: `permission denied for table`

**Solutions**:
1. Verify RLS policies are applied
2. Check user role (`authenticated` vs `service_role`)
3. Ensure API uses `service_role` key for backend operations

### Migration Failed

**Symptom**: `ERROR: relation already exists`

**Solutions**:
1. Check if migration already ran
2. Use `--rollback` to start fresh
3. Manually fix conflicts

```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM logs WHERE message LIKE 'Migration%' ORDER BY created_at DESC LIMIT 5;"
```

### Seed Data Conflicts

**Symptom**: `ERROR: duplicate key value`

**Solutions**:
- Seed script uses `ON CONFLICT DO NOTHING` - safe to re-run
- If stuck, rollback and re-seed:

```bash
./migrate.sh --rollback
./migrate.sh --seed
```

---

## 📚 Related Documentation

- [Implementation Guide](../docs/MARKETPLACE_IMPLEMENTATION_GUIDE.md) - Full technical guide
- [API Reference](../docs/MARKETPLACE_API_REFERENCE.md) - API endpoints
- [Deployment Guide](../docs/MARKETPLACE_DEPLOYMENT_GUIDE.md) - Production setup

---

## 🔗 Supabase Integration

### Dashboard Access

- **URL**: https://supabase.com/dashboard/project/[project-id]
- **Database**: Project Settings → Database
- **Table Editor**: Table Editor
- **SQL Editor**: SQL Editor

### Connection Details

```
Host: db.[project-ref].supabase.co
Port: 5432
Database: postgres
User: postgres
Password: [your-password]
```

### API Keys

```bash
# Supabase URL (for environment)
export SUPABASE_URL='https://[project-ref].supabase.co'

# Anon Key (for client-side, respects RLS)
export SUPABASE_ANON_KEY='eyJhbGc...'

# Service Role Key (for server-side, bypasses RLS)
export SUPABASE_SERVICE_KEY='eyJhbGc...'
```

---

## 📈 Performance

### Recommended Indexes

All critical indexes are created in migration 001:
- Foreign keys (user_id, plugin_id)
- Frequently queried fields (status, tier, created_at)
- Sort fields (downloads, rating)
- GIN indexes for JSONB and arrays

### Query Optimization

```sql
-- Use EXPLAIN ANALYZE to check query plans
EXPLAIN ANALYZE
SELECT * FROM plugins WHERE tier = 'pro' ORDER BY downloads DESC LIMIT 10;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 📝 Schema Versioning

**Current Version**: 1.0.0

**Migration Log**:
- `2025-10-11`: Initial schema (001, 002)
- `2025-10-11`: Initial seed data (001)

**Upcoming Migrations**:
- [ ] 003: Add Stripe webhook logs table
- [ ] 004: Add plugin analytics table
- [ ] 005: Add notification preferences

---

**Status**: ✅ Database schema complete and ready

**Last Updated**: 2025-10-11
**Version**: 1.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
