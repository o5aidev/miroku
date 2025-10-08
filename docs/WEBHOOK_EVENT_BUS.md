# Webhook Event Bus

**Issue**: #5 Phase B
**Status**: Implemented
**Version**: 1.0.0

---

## 🎯 Overview

The Webhook Event Bus implements GitHub webhooks as an **Event-Driven Architecture** for the Agentic OS. This system automatically routes GitHub events (Issues, PRs, Pushes, Comments) to the appropriate AI agents for autonomous processing.

**OS Concept**: **Inter-Process Communication (IPC) / Event Bus**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Events                        │
├─────────────────────────────────────────────────────────┤
│  Issues    PRs    Pushes    Comments    Labels          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Webhook Event Router  │
        │  (Event Bus)           │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │   Routing Rules Engine  │
        │   - Priority sorting    │
        │   - Condition matching  │
        │   - Agent selection     │
        └────────────┬───────────┘
                     │
        ┌────────────┴────────────────────────────┐
        │                                         │
        ▼                                         ▼
┌───────────────┐                     ┌─────────────────┐
│ CoordinatorAgent                    │ SpecialistAgents│
│ - Command parsing                   │ - IssueAgent    │
│ - Task orchestration                │ - ReviewAgent   │
│ - Agent selection                   │ - PRAgent       │
└───────────────┘                     │ - DeployAgent   │
                                      └─────────────────┘
```

---

## 📋 Supported Events

### 1. **Issue Events**

| Event | Action | Agent | Priority | Description |
|-------|--------|-------|----------|-------------|
| `issues` | `opened` | IssueAgent | High | Analyze and auto-label new issue |
| `issues` | `labeled` (🤖agent-execute) | CoordinatorAgent | Critical | Execute autonomous task |
| `issues` | `assigned` | IssueAgent | High | Transition to implementing state |
| `issues` | `closed` | IssueAgent | Medium | Transition to done state |
| `issues` | `reopened` | IssueAgent | Low | Re-analyze and update state |

### 2. **Pull Request Events**

| Event | Action | Agent | Priority | Description |
|-------|--------|-------|----------|-------------|
| `pull_request` | `opened` | ReviewAgent | High | Run quality checks |
| `pull_request` | `ready_for_review` | ReviewAgent | High | Run quality checks and request review |
| `pull_request` | `review_requested` | ReviewAgent | High | Perform automated review |
| `pull_request` | `closed` (merged) | DeploymentAgent | Medium | Trigger deployment pipeline |

### 3. **Push Events**

| Event | Branch | Agent | Priority | Description |
|-------|--------|-------|----------|-------------|
| `push` | `main` | DeploymentAgent | Medium | Deploy to production |
| `push` | `feat/**` | - | - | No action (feature branch) |
| `push` | `fix/**` | - | - | No action (fix branch) |

### 4. **Comment Events**

| Event | Condition | Agent | Priority | Description |
|-------|-----------|-------|----------|-------------|
| `issue_comment` | Starts with `/agent` | CoordinatorAgent | Critical | Parse and execute command |

---

## 🔧 Implementation

### GitHub Actions Workflow

**File**: `.github/workflows/webhook-event-router.yml`

**Triggers**:
- `issues`: opened, labeled, closed, reopened, assigned
- `pull_request`: opened, closed, reopened, review_requested, ready_for_review
- `push`: main, feat/**, fix/**
- `issue_comment`: created

**Permissions**:
```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
```

### Webhook Router Script

**File**: `scripts/webhook-router.ts`

**Key Components**:

1. **EventPayload Type**
   ```typescript
   interface EventPayload {
     type: 'issue' | 'pr' | 'push' | 'comment';
     action: string;
     number?: number;
     labels?: string[];
     author?: string;
     branch?: string;
   }
   ```

2. **RoutingRule Type**
   ```typescript
   interface RoutingRule {
     condition: (payload: EventPayload) => boolean;
     agent: string;
     priority: 'critical' | 'high' | 'medium' | 'low';
     action: string;
   }
   ```

3. **WebhookEventRouter Class**
   - `route(payload)`: Main routing logic
   - `triggerAgent(agent, payload, action)`: Execute agent
   - `createRoutingComment(issueNumber, agent, action)`: Document routing decision

---

## 📊 Routing Rules

### Rule Priority

```
Critical → High → Medium → Low
```

### Example Rules

**Critical: Agent Execution Request**
```typescript
{
  condition: (p) => p.type === 'issue' && p.labels?.includes('🤖agent-execute'),
  agent: 'CoordinatorAgent',
  priority: 'critical',
  action: 'Execute autonomous task',
}
```

**High: New Issue Analysis**
```typescript
{
  condition: (p) => p.type === 'issue' && p.action === 'opened',
  agent: 'IssueAgent',
  priority: 'high',
  action: 'Analyze and auto-label issue',
}
```

**Medium: Production Deployment**
```typescript
{
  condition: (p) => p.type === 'push' && p.branch === 'main',
  agent: 'DeploymentAgent',
  priority: 'medium',
  action: 'Deploy to production',
}
```

---

## 🚀 Usage

### Automatic Triggering

The webhook router runs automatically on GitHub events. No manual intervention required.

### Manual Testing (Local)

```bash
# Test issue opened event
GITHUB_TOKEN=ghp_xxx \
ISSUE_TITLE="Test Issue" \
ISSUE_LABELS='[{"name":"bug"}]' \
node scripts/webhook-router.js issue opened 123

# Test PR review requested
GITHUB_TOKEN=ghp_xxx \
PR_TITLE="Test PR" \
node scripts/webhook-router.js pr review_requested 45

# Test push to main
GITHUB_TOKEN=ghp_xxx \
node scripts/webhook-router.js push main abc123

# Test agent command comment
GITHUB_TOKEN=ghp_xxx \
COMMENT_BODY="/agent analyze" \
COMMENT_AUTHOR="user" \
node scripts/webhook-router.js comment 123 user
```

### npm Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "webhook:test:issue": "tsx scripts/webhook-router.ts issue opened 123",
    "webhook:test:pr": "tsx scripts/webhook-router.ts pr opened 45",
    "webhook:test:push": "tsx scripts/webhook-router.ts push main abc123"
  }
}
```

---

## 📝 Event Flow Example

### Scenario: New Issue Created

```
1. User creates Issue #123 "Add authentication"
   ↓
2. GitHub triggers 'issues.opened' event
   ↓
3. Workflow 'webhook-event-router.yml' starts
   ↓
4. Runs: node scripts/webhook-router.js issue opened 123
   ↓
5. Router matches rule: "New issue → IssueAgent (High)"
   ↓
6. Router calls: triggerAgent('IssueAgent', payload, 'Analyze and auto-label')
   ↓
7. Router creates comment on #123:
   "🤖 Event Router
    Agent: IssueAgent
    Action: Analyze and auto-label issue"
   ↓
8. IssueAgent (future): Analyzes issue and adds labels
```

---

## 🔒 Security

### Webhook Signature Verification

**Status**: ⚠️ Not yet implemented

**Future Enhancement**:
```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### Permissions

The workflow requires:
- `contents: write` - Push code changes
- `issues: write` - Create comments, update labels
- `pull-requests: write` - Review PRs, merge

---

## 📊 Monitoring

### Routing Decision Logging

Every routing decision is logged as an Issue comment:

```markdown
## 🤖 Event Router

**Agent**: IssueAgent
**Action**: Analyze and auto-label issue
**Timestamp**: 2025-10-08T12:00:00Z

---

*Automated by Webhook Event Router (Issue #5 Phase B)*
```

### GitHub Actions Logs

View detailed routing logs:
1. Navigate to **Actions** tab
2. Select **Webhook Event Router** workflow
3. View logs for each event

---

## 🎯 Future Enhancements

### Phase B.1: Advanced Routing

- [ ] Support for regex patterns in routing rules
- [ ] Dynamic rule loading from config file
- [ ] A/B testing for routing strategies
- [ ] Machine learning-based routing optimization

### Phase B.2: External Webhooks

- [ ] External webhook endpoint (Cloudflare Workers / Vercel)
- [ ] Webhook signature verification
- [ ] Rate limiting and DDoS protection
- [ ] Webhook retry mechanism

### Phase B.3: Event Replay

- [ ] Store all events in database
- [ ] Replay failed events
- [ ] Event audit trail
- [ ] Time-travel debugging

### Phase B.4: Agent Execution

- [ ] Actual agent invocation (currently placeholder)
- [ ] Agent execution queue
- [ ] Parallel agent execution
- [ ] Agent result aggregation

---

## 🧪 Testing

### Unit Tests (Future)

```typescript
describe('WebhookEventRouter', () => {
  it('should route issue opened event to IssueAgent', async () => {
    const router = new WebhookEventRouter();
    const payload = { type: 'issue', action: 'opened', number: 123 };

    const rules = await router.route(payload);

    expect(rules).toHaveLength(1);
    expect(rules[0].agent).toBe('IssueAgent');
  });
});
```

### Integration Tests (Future)

```bash
# Trigger real GitHub event via gh CLI
gh issue create --title "Test Issue" --label "🤖agent-execute"

# Verify webhook was triggered
gh run list --workflow="webhook-event-router.yml" --limit 1
```

---

## 📚 References

- **Issue #5**: GitHub as Operating System - Full Integration
- **AGENTIC_OS.md**: Vision document
- **.github/AGENTS.md**: Agent hierarchy and responsibilities
- **GitHub Webhooks Documentation**: https://docs.github.com/en/webhooks

---

## 🤝 Contributing

To add new routing rules:

1. Edit `scripts/webhook-router.ts`
2. Add new rule to `ROUTING_RULES` array
3. Update this documentation
4. Test locally with manual trigger
5. Create PR for review

---

**Created**: 2025-10-08
**Version**: 1.0.0
**Status**: ✅ Implemented (Phase B of Issue #5)
**Next**: Phase C - GitHub Discussions (Message Queue)
