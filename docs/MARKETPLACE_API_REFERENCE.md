# Miyabi Marketplace API Reference

**Version**: 1.0.0
**Base URL**: `https://api.miyabi.dev/v1`
**Last Updated**: 2025-10-11

Complete API reference for the Miyabi Plugin Marketplace.

---

## Authentication

All API requests (except public endpoints) require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://api.miyabi.dev/v1/marketplace/plugins
```

### Obtaining an API Token

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600
}
```

---

## Marketplace Endpoints

### 1. List All Plugins

```
GET /marketplace/plugins
```

**Query Parameters**:
- `category` (string, optional): Filter by category
- `tier` (string, optional): Filter by tier (`free`, `pro`, `enterprise`)
- `search` (string, optional): Search query
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 20, max: 100): Results per page
- `sort` (string, optional): Sort order (`downloads`, `rating`, `created_at`)
- `verified` (boolean, optional): Show only verified plugins

**Example Request**:
```bash
curl "https://api.miyabi.dev/v1/marketplace/plugins?category=Automation&tier=pro&page=1&limit=10"
```

**Response** (200 OK):
```json
{
  "plugins": [
    {
      "id": "miyabi-operations-pro",
      "name": "miyabi-operations-pro",
      "displayName": "Miyabi Operations - Pro",
      "version": "1.0.0",
      "tier": "pro",
      "price": 29,
      "currency": "USD",
      "billingPeriod": "monthly",
      "description": "Professional tier with unlimited Issues and priority support",
      "author": {
        "name": "Shunsuke Hayashi",
        "email": "supernovasyun@gmail.com",
        "verified": true
      },
      "categories": ["Premium", "Automation", "GitHub", "Enterprise"],
      "downloads": 1500,
      "rating": 4.8,
      "verified": true,
      "featured": true,
      "trialPeriod": 14
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 2. Get Plugin Details

```
GET /marketplace/plugins/:pluginId
```

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier

**Example Request**:
```bash
curl "https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-pro"
```

**Response** (200 OK):
```json
{
  "id": "miyabi-operations-pro",
  "name": "miyabi-operations-pro",
  "displayName": "Miyabi Operations - Pro",
  "source": "ShunsukeHayashi/Miyabi",
  "version": "1.0.0",
  "tier": "pro",
  "price": 29,
  "currency": "USD",
  "billingPeriod": "monthly",
  "description": "Professional tier with unlimited Issues and priority support",
  "features": [
    "8 slash commands (all features)",
    "6 autonomous agents (full suite)",
    "Unlimited Issues per month",
    "Parallel execution: 3 concurrent tasks",
    "Priority support (Email, 24h response)"
  ],
  "limitations": {
    "monthly_issues": -1,
    "concurrency": 3,
    "claude_api_tokens": 100000,
    "support": "priority"
  },
  "requirements": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0",
    "git": ">=2.40.0"
  },
  "author": {
    "name": "Shunsuke Hayashi",
    "email": "supernovasyun@gmail.com",
    "url": "https://github.com/ShunsukeHayashi",
    "verified": true
  },
  "categories": ["Premium", "Automation", "GitHub", "Enterprise"],
  "downloads": 1500,
  "rating": 4.8,
  "reviewCount": 42,
  "verified": true,
  "featured": true,
  "trialPeriod": 14,
  "screenshots": [
    "https://example.com/screenshot1.png",
    "https://example.com/screenshot2.png"
  ],
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-10-01",
      "changes": ["Initial release"]
    }
  ],
  "createdAt": "2025-10-01T00:00:00Z",
  "updatedAt": "2025-10-11T00:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Plugin not found

---

### 3. Install Plugin (Free Tier)

```
POST /marketplace/plugins/:pluginId/install
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier

**Example Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-free/install"
```

**Response** (200 OK):
```json
{
  "success": true,
  "plugin_id": "miyabi-operations-free",
  "tier": "free",
  "license_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Plugin installed successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Plugin not found
- `409 Conflict`: Plugin already installed

---

### 4. Purchase Plugin (Paid Tier)

```
POST /marketplace/plugins/:pluginId/purchase
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)
- `Content-Type: application/json`

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier

**Request Body**:
```json
{
  "payment_method_id": "pm_1234567890",
  "billing_cycle": "monthly"
}
```

**Example Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"payment_method_id": "pm_1234567890", "billing_cycle": "monthly"}' \
  "https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-pro/purchase"
```

**Response** (200 OK):
```json
{
  "success": true,
  "subscription_id": "sub_1234567890",
  "plugin_id": "miyabi-operations-pro",
  "tier": "pro",
  "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": "active",
  "trial_ends_at": "2025-10-25T00:00:00Z",
  "current_period_start": "2025-10-11T00:00:00Z",
  "current_period_end": "2025-11-11T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid payment method
- `402 Payment Required`: Payment failed
- `409 Conflict`: Already subscribed

---

### 5. Start Free Trial

```
POST /marketplace/plugins/:pluginId/trial
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier (must support trials)

**Example Request**:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-pro/trial"
```

**Response** (200 OK):
```json
{
  "success": true,
  "plugin_id": "miyabi-operations-pro",
  "tier": "pro",
  "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "status": "trial",
  "trial_started_at": "2025-10-11T00:00:00Z",
  "trial_ends_at": "2025-10-25T00:00:00Z",
  "trial_days_remaining": 14,
  "message": "14-day free trial started. No credit card required."
}
```

**Error Responses**:
- `400 Bad Request`: Plugin doesn't support trials
- `409 Conflict`: Trial already used

---

### 6. Get My Subscriptions

```
GET /marketplace/subscriptions
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Example Request**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/marketplace/subscriptions"
```

**Response** (200 OK):
```json
{
  "subscriptions": [
    {
      "id": "sub_1234567890",
      "plugin_id": "miyabi-operations-pro",
      "plugin_name": "Miyabi Operations - Pro",
      "tier": "pro",
      "status": "active",
      "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "current_period_start": "2025-10-11T00:00:00Z",
      "current_period_end": "2025-11-11T00:00:00Z",
      "cancel_at_period_end": false,
      "trial_ends_at": null
    },
    {
      "id": "sub_0987654321",
      "plugin_id": "miyabi-security-scanner",
      "plugin_name": "Miyabi Security Scanner",
      "tier": "addon",
      "status": "active",
      "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
      "current_period_start": "2025-10-11T00:00:00Z",
      "current_period_end": "2025-11-11T00:00:00Z",
      "cancel_at_period_end": false
    }
  ]
}
```

---

### 7. Cancel Subscription

```
DELETE /marketplace/subscriptions/:subscriptionId
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Path Parameters**:
- `subscriptionId` (string, required): Subscription ID

**Query Parameters**:
- `immediately` (boolean, optional, default: false): Cancel immediately vs. at period end

**Example Request**:
```bash
# Cancel at period end (default)
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/marketplace/subscriptions/sub_1234567890"

# Cancel immediately
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/marketplace/subscriptions/sub_1234567890?immediately=true"
```

**Response** (200 OK):
```json
{
  "success": true,
  "subscription_id": "sub_1234567890",
  "status": "canceled",
  "canceled_at": "2025-10-11T12:00:00Z",
  "ends_at": "2025-11-11T00:00:00Z",
  "message": "Subscription will be canceled at the end of the billing period"
}
```

---

## License Management

### 8. Verify License

```
POST /licenses/verify
```

**Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Request**:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."}' \
  "https://api.miyabi.dev/v1/licenses/verify"
```

**Response** (200 OK):
```json
{
  "valid": true,
  "plugin_id": "miyabi-operations-pro",
  "tier": "pro",
  "expires_at": "2025-11-11T00:00:00Z",
  "features": [
    "all-commands",
    "all-agents",
    "advanced-analytics",
    "private-repos"
  ],
  "limitations": {
    "monthly_issues": -1,
    "concurrency": 3,
    "claude_api_tokens": 100000,
    "support": "priority"
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "valid": false,
  "error": "License expired",
  "expired_at": "2025-10-01T00:00:00Z"
}
```

---

### 9. Revoke License

```
POST /licenses/:licenseKey/revoke
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required, admin only)
- `Content-Type: application/json`

**Path Parameters**:
- `licenseKey` (string, required): License key to revoke

**Request Body**:
```json
{
  "reason": "Violation of terms of service"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "license_key": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "revoked_at": "2025-10-11T12:00:00Z",
  "reason": "Violation of terms of service"
}
```

---

## Usage Tracking

### 10. Get Usage Stats

```
GET /usage/stats
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Query Parameters**:
- `plugin_id` (string, optional): Filter by plugin
- `period` (string, optional, format: YYYY-MM): Month to query (default: current month)

**Example Request**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/usage/stats?plugin_id=miyabi-operations-pro&period=2025-10"
```

**Response** (200 OK):
```json
{
  "plugin_id": "miyabi-operations-pro",
  "period": "2025-10",
  "usage": {
    "issues_processed": 45,
    "tokens_consumed": 25000,
    "agents_executed": {
      "coordinator": 45,
      "codegen": 38,
      "review": 42,
      "issue": 40,
      "pr": 35,
      "deployment": 30
    },
    "commands_used": {
      "/verify": 10,
      "/agent-run": 45,
      "/deploy": 30,
      "/miyabi-auto": 5
    }
  },
  "quota": {
    "issues_limit": -1,
    "issues_remaining": -1,
    "tokens_limit": 100000,
    "tokens_remaining": 75000
  },
  "projections": {
    "estimated_monthly_issues": 90,
    "estimated_monthly_tokens": 50000
  }
}
```

---

### 11. Track Usage Event

```
POST /usage/track
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)
- `Content-Type: application/json`

**Request Body**:
```json
{
  "plugin_id": "miyabi-operations-pro",
  "event_type": "issue_processed",
  "event_data": {
    "issue_number": 270,
    "repository": "ShunsukeHayashi/Miyabi",
    "agents_used": ["coordinator", "codegen", "review"],
    "tokens_consumed": 1250,
    "duration_ms": 45000
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "event_id": "evt_1234567890",
  "tracked_at": "2025-10-11T12:00:00Z"
}
```

---

## Plugin Submission (Third-Party Developers)

### 12. Submit Plugin

```
POST /plugins/submit
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)
- `Content-Type: application/json`

**Request Body**:
```json
{
  "name": "my-awesome-plugin",
  "displayName": "My Awesome Plugin",
  "source": "username/repo",
  "version": "1.0.0",
  "tier": "paid",
  "price": 19,
  "currency": "USD",
  "billingPeriod": "monthly",
  "description": "An awesome plugin for Claude Code",
  "license": "MIT",
  "features": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ],
  "categories": ["Automation", "CI/CD"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "submission_id": "sub_abc123",
  "status": "pending_review",
  "quality_score": 85,
  "estimated_review_time": "3-5 business days",
  "submitted_at": "2025-10-11T12:00:00Z"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Quality score below minimum (80)",
  "score": 72,
  "details": {
    "eslint_errors": 15,
    "typescript_errors": 3,
    "test_coverage": 65
  }
}
```

---

### 13. Check Submission Status

```
GET /plugins/submissions/:submissionId
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)

**Path Parameters**:
- `submissionId` (string, required): Submission ID

**Example Request**:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "https://api.miyabi.dev/v1/plugins/submissions/sub_abc123"
```

**Response** (200 OK):
```json
{
  "submission_id": "sub_abc123",
  "plugin_name": "my-awesome-plugin",
  "status": "approved",
  "quality_score": 85,
  "security_scan": {
    "critical": 0,
    "high": 0,
    "medium": 2,
    "low": 5
  },
  "review_notes": "Great plugin! Minor suggestions in the review comments.",
  "submitted_at": "2025-10-11T12:00:00Z",
  "reviewed_at": "2025-10-13T10:00:00Z",
  "approved_at": "2025-10-13T10:00:00Z"
}
```

---

## Reviews & Ratings

### 14. Submit Review

```
POST /marketplace/plugins/:pluginId/reviews
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)
- `Content-Type: application/json`

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier

**Request Body**:
```json
{
  "rating": 5,
  "comment": "Excellent plugin! Saved me hours of work."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "review_id": "rev_1234567890",
  "plugin_id": "miyabi-operations-pro",
  "rating": 5,
  "comment": "Excellent plugin! Saved me hours of work.",
  "created_at": "2025-10-11T12:00:00Z"
}
```

---

### 15. Get Plugin Reviews

```
GET /marketplace/plugins/:pluginId/reviews
```

**Path Parameters**:
- `pluginId` (string, required): Plugin identifier

**Query Parameters**:
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 20, max: 100)
- `sort` (string, optional): Sort order (`rating`, `created_at`)

**Example Request**:
```bash
curl "https://api.miyabi.dev/v1/marketplace/plugins/miyabi-operations-pro/reviews?page=1&limit=10"
```

**Response** (200 OK):
```json
{
  "reviews": [
    {
      "id": "rev_1234567890",
      "user": {
        "name": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "rating": 5,
      "comment": "Excellent plugin! Saved me hours of work.",
      "created_at": "2025-10-11T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  },
  "summary": {
    "average_rating": 4.8,
    "total_reviews": 42,
    "rating_distribution": {
      "5": 30,
      "4": 8,
      "3": 3,
      "2": 1,
      "1": 0
    }
  }
}
```

---

## Webhooks

### 16. Register Webhook

```
POST /webhooks/register
```

**Headers**:
- `Authorization: Bearer YOUR_JWT_TOKEN` (required)
- `Content-Type: application/json`

**Request Body**:
```json
{
  "url": "https://your-server.com/webhooks/miyabi",
  "events": [
    "subscription.created",
    "subscription.updated",
    "subscription.deleted",
    "license.revoked",
    "usage.quota_exceeded"
  ],
  "secret": "your_webhook_secret"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "webhook_id": "wh_1234567890",
  "url": "https://your-server.com/webhooks/miyabi",
  "events": [
    "subscription.created",
    "subscription.updated",
    "subscription.deleted"
  ],
  "created_at": "2025-10-11T12:00:00Z"
}
```

---

### Webhook Event Payloads

**subscription.created**:
```json
{
  "event": "subscription.created",
  "timestamp": "2025-10-11T12:00:00Z",
  "data": {
    "subscription_id": "sub_1234567890",
    "user_id": "user_123",
    "plugin_id": "miyabi-operations-pro",
    "tier": "pro",
    "status": "active",
    "trial_ends_at": "2025-10-25T00:00:00Z"
  }
}
```

**usage.quota_exceeded**:
```json
{
  "event": "usage.quota_exceeded",
  "timestamp": "2025-10-11T12:00:00Z",
  "data": {
    "user_id": "user_123",
    "plugin_id": "miyabi-operations-free",
    "quota_type": "monthly_issues",
    "limit": 100,
    "current": 105
  }
}
```

---

## Rate Limits

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| `/marketplace/plugins` | 100 requests | 15 minutes |
| `/marketplace/plugins/:id/purchase` | 5 requests | 1 hour |
| `/licenses/verify` | 1000 requests | 15 minutes |
| `/usage/track` | 500 requests | 15 minutes |
| `/plugins/submit` | 3 requests | 24 hours |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699876543
```

---

## Error Codes

| Status Code | Error Code | Description |
|-------------|-----------|-------------|
| 400 | `bad_request` | Invalid request parameters |
| 401 | `unauthorized` | Missing or invalid authentication |
| 402 | `payment_required` | Payment failed or required |
| 403 | `forbidden` | Insufficient permissions |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource conflict (e.g., already exists) |
| 422 | `validation_error` | Request validation failed |
| 429 | `rate_limit_exceeded` | Too many requests |
| 500 | `internal_error` | Internal server error |
| 503 | `service_unavailable` | Service temporarily unavailable |

**Error Response Format**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests, please try again later",
  "retry_after": 900
}
```

---

## SDKs & Libraries

### Official SDK (TypeScript/JavaScript)

```bash
npm install @miyabi/marketplace-sdk
```

```typescript
import { MiyabiMarketplace } from '@miyabi/marketplace-sdk';

const marketplace = new MiyabiMarketplace({
  apiKey: 'YOUR_API_KEY'
});

// List plugins
const plugins = await marketplace.listPlugins({ tier: 'pro' });

// Install plugin
const result = await marketplace.installPlugin('miyabi-operations-pro');

// Verify license
const valid = await marketplace.verifyLicense('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...');

// Track usage
await marketplace.trackUsage({
  plugin_id: 'miyabi-operations-pro',
  event_type: 'issue_processed',
  event_data: { issue_number: 270 }
});
```

---

## Changelog

### v1.0.0 (2025-10-11)
- Initial API release
- Plugin listing, installation, purchase
- License management
- Usage tracking
- Third-party plugin submission
- Reviews & ratings

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
