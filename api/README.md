# Miyabi Marketplace API

Backend API for the Miyabi Plugin Marketplace - handles licensing, billing, usage tracking, and plugin management.

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 20.0.0
- pnpm ≥ 8.0.0
- Supabase account
- Stripe account
- Redis (optional, for rate limiting)

### Installation

```bash
# Install dependencies
cd api
pnpm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### Generate License Keys

```bash
# Generate RSA private key
openssl genrsa -out license_private.pem 2048

# Generate public key
openssl rsa -in license_private.pem -pubout -out license_public.pem

# Convert to single-line format (for .env)
cat license_private.pem | tr '\n' '_' | sed 's/_/\\n/g'
cat license_public.pem | tr '\n' '_' | sed 's/_/\\n/g'
```

### Database Setup

```bash
# Run database migrations (see ../docs/MARKETPLACE_IMPLEMENTATION_GUIDE.md)
psql $SUPABASE_URL < schema.sql
```

### Development

```bash
# Start development server with hot reload
pnpm dev

# Server runs on http://localhost:3000
```

### Production Build

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

---

## 📁 Directory Structure

```
api/
├── lib/
│   └── types.ts              # TypeScript types
├── routes/
│   ├── marketplace.ts        # Plugin listing, installation, purchase
│   ├── licenses.ts           # License verification
│   └── usage.ts              # Usage tracking & analytics
├── services/
│   ├── license-manager.ts    # License generation & verification
│   └── usage-tracker.ts      # Usage tracking & quota enforcement
├── middleware/
│   ├── auth.ts               # JWT authentication
│   └── rate-limit.ts         # Rate limiting
├── index.ts                  # Main entry point
├── package.json
├── tsconfig.json
└── .env.example
```

---

## 🔌 API Endpoints

### Marketplace

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/marketplace/plugins` | List plugins | Optional |
| GET | `/v1/marketplace/plugins/:id` | Get plugin details | Optional |
| POST | `/v1/marketplace/plugins/:id/install` | Install free plugin | Required |
| POST | `/v1/marketplace/plugins/:id/purchase` | Purchase paid plugin | Required |
| POST | `/v1/marketplace/plugins/:id/trial` | Start free trial | Required |
| GET | `/v1/marketplace/subscriptions` | Get user's subscriptions | Required |
| DELETE | `/v1/marketplace/subscriptions/:id` | Cancel subscription | Required |

### Licenses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1/licenses/verify` | Verify license key | None |
| POST | `/v1/licenses/:key/revoke` | Revoke license | Admin |

### Usage

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1/usage/stats` | Get usage stats | Required |
| POST | `/v1/usage/track` | Track usage event | Required |
| GET | `/v1/usage/report` | Generate usage report | Required |

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.miyabi.dev/v1/marketplace/subscriptions
```

### Generate Token

```typescript
import { generateToken } from './middleware/auth';

const token = generateToken({
  id: 'user_123',
  email: 'user@example.com',
  role: 'user'
});
```

---

## 📊 Usage Examples

### Install Free Plugin

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-free/install
```

### Start Pro Trial

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-pro/trial
```

### Verify License

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"license_key": "eyJhbGc..."}' \
  https://api.miyabi.dev/v1/licenses/verify
```

### Track Usage

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plugin_id": "miyabi-operations-pro",
    "event_type": "issue_processed",
    "event_data": {
      "issue_number": 270,
      "repository": "ShunsukeHayashi/Miyabi",
      "agents_used": ["coordinator", "codegen"],
      "tokens_consumed": 1250,
      "duration_ms": 45000
    }
  }' \
  https://api.miyabi.dev/v1/usage/track
```

### Get Usage Stats

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/usage/stats?plugin_id=miyabi-operations-pro&period=2025-10"
```

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for all required environment variables.

**Critical Variables**:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key
- `JWT_SECRET` - Secret for JWT signing
- `MIYABI_LICENSE_PRIVATE_KEY` - RSA private key (for signing licenses)
- `MIYABI_LICENSE_PUBLIC_KEY` - RSA public key (for verifying licenses)
- `STRIPE_SECRET_KEY` - Stripe secret key

### Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 req | 15 min |
| License Verification | 1000 req | 15 min |
| Usage Tracking | 500 req | 15 min |
| Purchase | 5 req | 1 hour |
| Plugin Submission | 3 req | 24 hours |

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run linter
pnpm lint

# Type checking
pnpm typecheck
```

---

## 📚 Documentation

- [Implementation Guide](../docs/MARKETPLACE_IMPLEMENTATION_GUIDE.md) - Complete technical guide
- [API Reference](../docs/MARKETPLACE_API_REFERENCE.md) - Full API specification
- [Deployment Guide](../docs/MARKETPLACE_DEPLOYMENT_GUIDE.md) - Production deployment

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd api
vercel --prod
```

### Manual Deployment

```bash
# Build
pnpm build

# Start with PM2
pm2 start dist/index.js --name miyabi-api

# Or with Docker
docker build -t miyabi-api .
docker run -p 3000:3000 miyabi-api
```

---

## 🔍 Monitoring

### Health Check

```bash
curl https://api.miyabi.dev/health
```

Response:
```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2025-10-11T12:00:00.000Z"
}
```

### Logging

- Development: Console logs
- Production: Sentry (if `SENTRY_DSN` is configured)

---

## 🐛 Troubleshooting

### License Verification Fails

**Symptom**: `License key is invalid or expired`

**Solutions**:
1. Check `MIYABI_LICENSE_PUBLIC_KEY` is set correctly
2. Ensure license hasn't been revoked
3. Verify license expiration date

### Database Connection Errors

**Symptom**: `Failed to connect to Supabase`

**Solutions**:
1. Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
2. Check Supabase project status
3. Verify network connectivity

### Rate Limit Issues

**Symptom**: `rate_limit_exceeded`

**Solutions**:
1. Wait for rate limit window to reset
2. If using Redis, check Redis connection
3. Increase rate limits in `middleware/rate-limit.ts` (dev only)

---

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

## 🙏 Acknowledgments

- **Supabase**: Database & Auth
- **Stripe**: Payment processing
- **Vercel**: Hosting
- **Express**: Web framework

---

**Status**: ✅ Core backend implementation complete

**Last Updated**: 2025-10-11
**Version**: 1.0.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
