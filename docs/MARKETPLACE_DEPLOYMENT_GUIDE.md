# Miyabi Marketplace Deployment Guide

**Version**: 1.0.0
**Last Updated**: 2025-10-11
**Status**: Production Deployment Specification

Complete deployment guide for launching the Miyabi Plugin Marketplace to production.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Database Deployment](#database-deployment)
4. [API Deployment](#api-deployment)
5. [Stripe Integration](#stripe-integration)
6. [CDN & Static Assets](#cdn--static-assets)
7. [Monitoring & Logging](#monitoring--logging)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Launch Checklist](#launch-checklist)

---

## Prerequisites

### Required Accounts
- ✅ **Vercel** account (for API hosting)
- ✅ **Supabase** account (for database)
- ✅ **Stripe** account (for payments)
- ✅ **GitHub** account (for repository & CI/CD)
- ✅ **Domain name** (e.g., miyabi.dev)
- ✅ **Cloudflare** account (optional, for CDN)

### Required Tools
```bash
# Node.js & pnpm
node --version  # v20.0.0+
pnpm --version  # v8.0.0+

# Vercel CLI
npm install -g vercel

# Supabase CLI
brew install supabase/tap/supabase

# Stripe CLI (for webhook testing)
brew install stripe/stripe-cli/stripe
```

---

## Infrastructure Setup

### Architecture Overview

```
                           ┌─────────────────┐
                           │   Cloudflare    │
                           │   DNS & CDN     │
                           └────────┬────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
         ┌──────────▼──────────┐       ┌───────────▼───────────┐
         │  Vercel Edge Fns    │       │    Supabase           │
         │  (API Endpoints)    │◄──────┤  (PostgreSQL DB)      │
         └──────────┬──────────┘       └───────────────────────┘
                    │
         ┌──────────▼──────────┐
         │    Stripe           │
         │  (Payment Gateway)  │
         └─────────────────────┘
```

### Domain Configuration

1. **Purchase domain** (e.g., miyabi.dev)
2. **Add to Cloudflare**:
   - Nameservers: `ns1.cloudflare.com`, `ns2.cloudflare.com`
   - SSL/TLS: Full (strict)
   - Always Use HTTPS: Enabled

3. **DNS Records**:
```
A     @              76.76.21.21    (Vercel)
CNAME www            cname.vercel-dns.com
CNAME api            cname.vercel-dns.com
CNAME marketplace    cname.vercel-dns.com
```

---

## Database Deployment

### Supabase Project Setup

1. **Create Project**:
```bash
# Navigate to https://supabase.com
# Click "New Project"
# Name: miyabi-marketplace-prod
# Region: us-east-1 (or closest to users)
# Database Password: [SECURE_PASSWORD]
```

2. **Run Migrations**:
```bash
# Copy schema from implementation guide
psql $DATABASE_URL < schema.sql

# Or use Supabase CLI
supabase db push
```

3. **Enable Row Level Security (RLS)**:
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own licenses"
  ON licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage"
  ON usage_events FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Anyone can view public plugins
CREATE POLICY "Anyone can view plugins"
  ON plugins FOR SELECT
  USING (true);
```

4. **Create Database Indexes**:
```sql
-- Performance indexes (see MARKETPLACE_IMPLEMENTATION_GUIDE.md)
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_usage_events_user_plugin ON usage_events(user_id, plugin_id, created_at);
CREATE INDEX idx_usage_aggregates_period ON usage_aggregates(user_id, plugin_id, period);
CREATE INDEX idx_licenses_user_plugin ON licenses(user_id, plugin_id);
```

5. **Seed Initial Data**:
```bash
# Import marketplace-business.json plugins
node scripts/seed-marketplace.ts
```

```typescript
// scripts/seed-marketplace.ts
import { createClient } from '@supabase/supabase-js';
import marketplaceData from '../marketplace-business.json';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service role key for admin operations
);

async function seedMarketplace() {
  for (const plugin of marketplaceData.plugins) {
    const { error } = await supabase.from('plugins').insert({
      id: plugin.name,
      name: plugin.name,
      display_name: plugin.displayName,
      version: plugin.version,
      tier: plugin.tier,
      price: plugin.price,
      currency: plugin.currency || 'USD',
      billing_period: plugin.billingPeriod,
      description: plugin.description,
      features: plugin.features,
      limitations: plugin.limitations,
      categories: plugin.categories,
      verified: plugin.verified,
      featured: plugin.featured
    });

    if (error) {
      console.error(`Failed to insert plugin ${plugin.name}:`, error);
    } else {
      console.log(`✅ Inserted plugin: ${plugin.name}`);
    }
  }
}

seedMarketplace();
```

---

## API Deployment

### Vercel Project Setup

1. **Create Vercel Project**:
```bash
cd /path/to/Autonomous-Operations
vercel login
vercel link
```

2. **Configure Environment Variables**:
```bash
# Vercel Dashboard → Settings → Environment Variables
# Or via CLI:
vercel env add SUPABASE_URL production
vercel env add SUPABASE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add JWT_SECRET production
vercel env add MIYABI_LICENSE_PRIVATE_KEY production
vercel env add MIYABI_LICENSE_PUBLIC_KEY production
```

**Environment Variables**:
```bash
# Supabase
SUPABASE_URL=https://xyz.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # For admin operations

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_SECURITY_ADDON_PRICE_ID=price_...
STRIPE_TEMPLATES_PRICE_ID=price_...

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# License Keys (RSA 2048-bit)
MIYABI_LICENSE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
MIYABI_LICENSE_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...

# Redis (for rate limiting)
REDIS_URL=redis://default:password@redis.example.com:6379
```

3. **Generate RSA Keys** (for license signing):
```bash
# Generate private key
openssl genrsa -out license_private.pem 2048

# Generate public key
openssl rsa -in license_private.pem -pubout -out license_public.pem

# Convert to single-line format for env vars
cat license_private.pem | tr '\n' '_' | sed 's/_/\\n/g'
cat license_public.pem | tr '\n' '_' | sed 's/_/\\n/g'
```

4. **Deploy to Production**:
```bash
vercel --prod
```

5. **Verify Deployment**:
```bash
curl https://api.miyabi.dev/v1/health
# Expected: {"status": "ok", "version": "1.0.0"}

curl https://api.miyabi.dev/v1/marketplace/plugins
# Expected: {"plugins": [...], "pagination": {...}}
```

### API Structure

```
api/
├── index.ts                    # Main entry point
├── routes/
│   ├── marketplace.ts          # Plugin listing, installation
│   ├── licenses.ts             # License verification
│   ├── usage.ts                # Usage tracking
│   ├── plugins.ts              # Third-party submissions
│   ├── reviews.ts              # Reviews & ratings
│   └── webhooks.ts             # Stripe webhooks
├── middleware/
│   ├── auth.ts                 # JWT authentication
│   ├── rate-limit.ts           # Rate limiting
│   └── error-handler.ts        # Error handling
└── services/
    ├── license-manager.ts
    ├── usage-tracker.ts
    ├── stripe-service.ts
    └── quality-checker.ts
```

---

## Stripe Integration

### Stripe Account Setup

1. **Activate Account**:
   - Navigate to https://dashboard.stripe.com
   - Complete business verification
   - Enable Live Mode

2. **Create Products**:

**Pro Tier**:
```bash
stripe products create \
  --name "Miyabi Operations - Pro" \
  --description "Professional tier with unlimited Issues"

stripe prices create \
  --product prod_XXX \
  --unit-amount 2900 \
  --currency usd \
  --recurring-interval month \
  --recurring-trial-period-days 14
```

**Security Scanner Add-on**:
```bash
stripe products create \
  --name "Miyabi Security Scanner" \
  --description "Advanced security vulnerability scanning"

stripe prices create \
  --product prod_YYY \
  --unit-amount 4900 \
  --currency usd \
  --recurring-interval month
```

**Workflow Templates (One-time)**:
```bash
stripe products create \
  --name "Miyabi Workflow Templates Pack" \
  --description "50+ pre-built workflow templates"

stripe prices create \
  --product prod_ZZZ \
  --unit-amount 1900 \
  --currency usd
```

3. **Setup Webhooks**:
```bash
# Add webhook endpoint
stripe webhook_endpoints create \
  --url https://api.miyabi.dev/v1/webhooks/stripe \
  --enabled-event customer.subscription.created \
  --enabled-event customer.subscription.updated \
  --enabled-event customer.subscription.deleted \
  --enabled-event invoice.payment_succeeded \
  --enabled-event invoice.payment_failed
```

**Webhook Events to Handle**:
- `customer.subscription.created` → Generate license, send email
- `customer.subscription.updated` → Update subscription status
- `customer.subscription.deleted` → Revoke license
- `invoice.payment_succeeded` → Send receipt, extend license
- `invoice.payment_failed` → Notify user, grace period

4. **Test Webhook Integration**:
```bash
# Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created
```

5. **Configure Stripe Connect** (for third-party payouts):
```bash
# Enable Connect in Dashboard
# Settings → Connect → Enable Connect
# Platform Settings → Application Information
# Redirect URI: https://marketplace.miyabi.dev/connect/callback
```

---

## CDN & Static Assets

### Cloudflare Setup

1. **Enable CDN**:
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
   - Always Online: Enabled

2. **Page Rules**:
```
https://api.miyabi.dev/*
  - Cache Level: Bypass

https://marketplace.miyabi.dev/assets/*
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 week

https://marketplace.miyabi.dev/*.json
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
```

3. **Security Settings**:
   - WAF: Enabled
   - DDoS Protection: Enabled
   - Rate Limiting: 100 req/min per IP

### Asset Storage (Supabase Storage)

```typescript
// Upload plugin screenshots
const { data, error } = await supabase.storage
  .from('plugin-assets')
  .upload('screenshots/miyabi-operations-pro/dashboard.png', file);

// Public URL
const url = supabase.storage
  .from('plugin-assets')
  .getPublicUrl('screenshots/miyabi-operations-pro/dashboard.png');
```

---

## Monitoring & Logging

### Application Monitoring

**Vercel Analytics**:
- Automatically enabled for all deployments
- View at: https://vercel.com/[team]/[project]/analytics

**Custom Metrics**:
```typescript
// api/lib/metrics.ts
import { track } from '@vercel/analytics';

export function trackPluginInstall(pluginId: string, tier: string) {
  track('plugin_install', { plugin_id: pluginId, tier });
}

export function trackSubscriptionCreated(tier: string, amount: number) {
  track('subscription_created', { tier, amount });
}
```

### Error Tracking (Sentry)

```bash
npm install @sentry/node @sentry/tracing
```

```typescript
// api/lib/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  tracesSampleRate: 0.1,
});

export default Sentry;
```

### Logging (Vercel + Supabase)

```typescript
// api/lib/logger.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function logEvent(event: {
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}) {
  await supabase.from('logs').insert({
    level: event.level,
    message: event.message,
    data: event.data,
    created_at: new Date()
  });

  console.log(`[${event.level.toUpperCase()}] ${event.message}`, event.data);
}
```

### Uptime Monitoring

**UptimeRobot** (Free tier):
- Monitor: https://api.miyabi.dev/health
- Interval: 5 minutes
- Alert: Email + Slack

**Health Check Endpoint**:
```typescript
// api/routes/health.ts
export async function healthCheck() {
  const checks = {
    database: await checkDatabase(),
    stripe: await checkStripe(),
    redis: await checkRedis()
  };

  const allHealthy = Object.values(checks).every(c => c.healthy);

  return {
    status: allHealthy ? 'ok' : 'degraded',
    version: '1.0.0',
    checks
  };
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Marketplace API

on:
  push:
    branches: [main]
    paths:
      - 'api/**'
      - 'marketplace-business.json'
      - '.github/workflows/deploy.yml'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install
      - run: pnpm test
      - run: pnpm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  seed-database:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: node scripts/seed-marketplace.ts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}

  smoke-test:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -f https://api.miyabi.dev/v1/health || exit 1
          curl -f https://api.miyabi.dev/v1/marketplace/plugins || exit 1
```

### Pre-deployment Checklist

```bash
# Run before deploying
npm run pre-deploy
```

```json
// package.json
{
  "scripts": {
    "pre-deploy": "npm run test && npm run lint && npm run build && npm run validate-env",
    "validate-env": "node scripts/validate-env.js"
  }
}
```

```javascript
// scripts/validate-env.js
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'STRIPE_SECRET_KEY',
  'JWT_SECRET',
  'MIYABI_LICENSE_PRIVATE_KEY',
  'MIYABI_LICENSE_PUBLIC_KEY'
];

for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

console.log('✅ All required environment variables are set');
```

---

## Launch Checklist

### Pre-Launch (1 week before)

- [ ] **Infrastructure**
  - [ ] Vercel project created and configured
  - [ ] Supabase project created and seeded
  - [ ] Stripe products and prices created
  - [ ] Domain configured with SSL
  - [ ] All environment variables set

- [ ] **Testing**
  - [ ] All API endpoints tested
  - [ ] License verification working
  - [ ] Stripe webhooks tested
  - [ ] Usage tracking validated
  - [ ] Load testing completed (1000 req/min)

- [ ] **Documentation**
  - [ ] API documentation published
  - [ ] Integration guide written
  - [ ] FAQ prepared
  - [ ] Support email set up

- [ ] **Monitoring**
  - [ ] Sentry error tracking enabled
  - [ ] Uptime monitoring configured
  - [ ] Log aggregation working
  - [ ] Alert notifications set up

### Launch Day

- [ ] **Final Verification**
  - [ ] All tests passing
  - [ ] Health check returning 200
  - [ ] Database migrations applied
  - [ ] Stripe webhooks receiving events

- [ ] **Deploy**
  - [ ] Deploy to production
  - [ ] Verify deployment successful
  - [ ] Smoke tests passing
  - [ ] DNS propagated

- [ ] **Announce**
  - [ ] Blog post published
  - [ ] Twitter announcement
  - [ ] GitHub README updated
  - [ ] Email to waitlist

### Post-Launch (First 24 hours)

- [ ] **Monitor**
  - [ ] Check error rates
  - [ ] Verify payment flows
  - [ ] Monitor response times
  - [ ] Check usage metrics

- [ ] **Support**
  - [ ] Respond to issues within 2 hours
  - [ ] Update FAQ based on questions
  - [ ] Document any bugs found

---

## Rollback Procedure

If critical issues arise after deployment:

```bash
# 1. Rollback Vercel deployment
vercel rollback

# 2. Restore database backup (if needed)
pg_restore -d $DATABASE_URL backup.sql

# 3. Notify users
# - Post incident status page
# - Email affected users
# - Twitter update

# 4. Investigate and fix
# - Review error logs
# - Identify root cause
# - Prepare hotfix

# 5. Redeploy
vercel --prod
```

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| API Response Time (p50) | < 100ms | TBD |
| API Response Time (p95) | < 500ms | TBD |
| Uptime | 99.9% | TBD |
| Database Query Time | < 50ms | TBD |
| License Verification | < 10ms | TBD |
| Stripe Webhook Processing | < 2s | TBD |

---

## Cost Estimates (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| Stripe | 2.9% + $0.30/txn | Variable |
| Cloudflare | Free | $0 |
| Sentry | Team | $26 |
| UptimeRobot | Free | $0 |
| **Total** | | **~$71/month + transaction fees** |

**Projected Revenue**:
- Month 1: $500 (10 Pro subscribers)
- Month 3: $2,000 (40 Pro subscribers)
- Month 6: $5,000 (100 Pro subscribers)
- Month 12: $15,000 (300 Pro subscribers)

**Break-even**: Month 1 (infrastructure costs < revenue)

---

## Security Audit Checklist

- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection (tokens)
- [ ] Rate limiting enabled
- [ ] JWT secret rotated
- [ ] HTTPS enforced
- [ ] API keys encrypted at rest
- [ ] License keys use RSA-2048
- [ ] Webhook signatures verified
- [ ] Row Level Security enabled (Supabase)
- [ ] Sensitive data redacted in logs
- [ ] CORS properly configured

---

## Support & Maintenance

### Daily Tasks
- Check error logs (Sentry)
- Monitor uptime (UptimeRobot)
- Review support emails

### Weekly Tasks
- Review usage metrics
- Check payment failures
- Update plugin catalog
- Review third-party submissions

### Monthly Tasks
- Database backup verification
- Security audit
- Performance review
- Infrastructure cost review

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
