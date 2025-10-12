#!/bin/bash
# Miyabi Marketplace Database Migration Script
# Runs all SQL migrations in order
# Version: 1.0.0

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║         Miyabi Marketplace Database Migrations              ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
  echo ""
  echo "Please set it to your Supabase database URL:"
  echo "  export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
  echo ""
  echo "Or get it from Supabase dashboard:"
  echo "  Project Settings → Database → Connection string (URI)"
  exit 1
fi

echo -e "${YELLOW}Database:${NC} $DATABASE_URL"
echo ""

# Parse command line arguments
DRY_RUN=false
ROLLBACK=false
SEED=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --rollback)
      ROLLBACK=true
      shift
      ;;
    --seed)
      SEED=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}🔍 DRY RUN MODE - No changes will be made${NC}"
  echo ""
fi

if [ "$ROLLBACK" = true ]; then
  echo -e "${YELLOW}⚠️  ROLLBACK MODE - This will drop all tables!${NC}"
  echo -e "${YELLOW}Are you sure? (yes/no)${NC}"
  read -r confirm
  if [ "$confirm" != "yes" ]; then
    echo "Cancelled."
    exit 0
  fi

  echo -e "${BLUE}Rolling back database...${NC}"

  if [ "$DRY_RUN" = false ]; then
    psql "$DATABASE_URL" << 'EOF'
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS plugin_reviews CASCADE;
DROP TABLE IF EXISTS plugin_submissions CASCADE;
DROP TABLE IF EXISTS revoked_licenses CASCADE;
DROP TABLE IF EXISTS trials CASCADE;
DROP TABLE IF EXISTS usage_aggregates CASCADE;
DROP TABLE IF EXISTS usage_events CASCADE;
DROP TABLE IF EXISTS licenses CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS plugins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS increment_usage CASCADE;
DROP FUNCTION IF EXISTS increment_agent_execution CASCADE;
DROP FUNCTION IF EXISTS increment_downloads CASCADE;
DROP FUNCTION IF EXISTS update_plugin_rating CASCADE;
DROP FUNCTION IF EXISTS trigger_update_plugin_rating CASCADE;
DROP FUNCTION IF EXISTS trigger_set_updated_at CASCADE;

DROP EXTENSION IF EXISTS "uuid-ossp";
EOF
    echo -e "${GREEN}✅ Rollback complete${NC}"
  else
    echo -e "${YELLOW}Would drop all tables and functions${NC}"
  fi

  exit 0
fi

# Run migrations
echo -e "${BLUE}📋 Running migrations...${NC}"
echo ""

MIGRATION_DIR="$(dirname "$0")/migrations"
SEED_DIR="$(dirname "$0")/seeds"

if [ ! -d "$MIGRATION_DIR" ]; then
  echo -e "${RED}❌ Error: Migrations directory not found: $MIGRATION_DIR${NC}"
  exit 1
fi

# Get list of migration files
MIGRATIONS=$(find "$MIGRATION_DIR" -name "*.sql" | sort)

if [ -z "$MIGRATIONS" ]; then
  echo -e "${YELLOW}⚠️  No migration files found${NC}"
  exit 0
fi

# Execute each migration
for migration in $MIGRATIONS; do
  filename=$(basename "$migration")
  echo -e "${BLUE}→ Running migration: ${NC}$filename"

  if [ "$DRY_RUN" = false ]; then
    if psql "$DATABASE_URL" -f "$migration"; then
      echo -e "${GREEN}  ✅ Success${NC}"
    else
      echo -e "${RED}  ❌ Failed${NC}"
      exit 1
    fi
  else
    echo -e "${YELLOW}  Would execute: $migration${NC}"
  fi

  echo ""
done

echo -e "${GREEN}✅ All migrations completed successfully${NC}"
echo ""

# Run seeds if requested
if [ "$SEED" = true ]; then
  echo -e "${BLUE}🌱 Seeding database...${NC}"
  echo ""

  if [ ! -d "$SEED_DIR" ]; then
    echo -e "${YELLOW}⚠️  Seeds directory not found: $SEED_DIR${NC}"
  else
    SEEDS=$(find "$SEED_DIR" -name "*.sql" | sort)

    if [ -z "$SEEDS" ]; then
      echo -e "${YELLOW}⚠️  No seed files found${NC}"
    else
      for seed in $SEEDS; do
        filename=$(basename "$seed")
        echo -e "${BLUE}→ Running seed: ${NC}$filename"

        if [ "$DRY_RUN" = false ]; then
          if psql "$DATABASE_URL" -f "$seed"; then
            echo -e "${GREEN}  ✅ Success${NC}"
          else
            echo -e "${RED}  ❌ Failed${NC}"
            exit 1
          fi
        else
          echo -e "${YELLOW}  Would execute: $seed${NC}"
        fi

        echo ""
      done

      echo -e "${GREEN}✅ All seeds completed successfully${NC}"
      echo ""
    fi
  fi
fi

# Verify database
echo -e "${BLUE}🔍 Verifying database...${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
  TABLE_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';")
  FUNCTION_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM pg_proc WHERE pronamespace = 'public'::regnamespace;")

  echo -e "${GREEN}📊 Database Statistics:${NC}"
  echo -e "   Tables: $TABLE_COUNT"
  echo -e "   Functions: $FUNCTION_COUNT"

  if [ "$SEED" = true ]; then
    PLUGIN_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM plugins;")
    USER_COUNT=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM users;")
    echo -e "   Plugins: $PLUGIN_COUNT"
    echo -e "   Users: $USER_COUNT"
  fi

  echo ""
fi

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}║              ✅ Migration Complete!                          ║${NC}"
echo -e "${BLUE}║                                                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ "$DRY_RUN" = false ]; then
  echo -e "${GREEN}Your database is ready for use!${NC}"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. Configure api/.env with SUPABASE_URL and SUPABASE_KEY"
  echo "  2. cd api && pnpm install"
  echo "  3. pnpm dev"
  echo ""
fi
