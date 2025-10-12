# 🌍 GitHub OS Integration Plan — Maximum Utilization

**Issue**: #5
**Version**: 1.0.0
**Date**: 2025-10-08
**Status**: Planning Phase

---

## 🎯 Executive Summary

このドキュメントは、GitHubの**15のOS要素**を完全統合し、真の「GitHub as Operating System」を実現するための実装計画です。

**Goal**: GitHub機能を100%活用し、他の追随を許さないAgenticOSを構築

---

## 📊 Complete OS Mapping

| # | GitHub Feature | OS Concept | Current | Target | Priority |
|---|----------------|------------|---------|--------|----------|
| 1 | **Issues** | Process Control | ✅ 80% | 100% | 🔥 Critical |
| 2 | **Actions** | Execution Engine | ✅ 70% | 100% | 🔥 Critical |
| 3 | **Labels** | State Machine | ✅ 90% | 100% | ⚡ High |
| 4 | **Secrets** | Credential Store | ✅ 60% | 100% | ⚡ High |
| 5 | **Projects V2** | Database | ❌ 0% | 100% | 🔥 Critical |
| 6 | **Webhooks** | Event Bus | ❌ 0% | 100% | 🔥 Critical |
| 7 | **Discussions** | Message Queue | ❌ 0% | 90% | ⚡ High |
| 8 | **Packages** | Package Manager | ❌ 0% | 80% | ⚡ High |
| 9 | **Pages** | GUI/Dashboard | ❌ 0% | 100% | 🔥 Critical |
| 10 | **Security** | Firewall/SELinux | ⚠️ 30% | 100% | ⚡ High |
| 11 | **API** | System Calls | ⚠️ 40% | 100% | ⚡ High |
| 12 | **Environments** | Namespaces | ❌ 0% | 90% | ⚠️ Medium |
| 13 | **Releases** | Distribution | ❌ 0% | 80% | ⚠️ Medium |
| 14 | **Gists** | Shared Memory | ❌ 0% | 60% | 📝 Low |
| 15 | **Wiki** | Documentation FS | ❌ 0% | 70% | 📝 Low |

**Overall Completion**: 27% → Target: 93%

---

## 🚀 Phase A: GitHub Projects V2 — Data Persistence Layer

### 🎯 Goal
Issue/PR/Agent実行データをProjects V2で構造化し、完全な「データベース」として機能させる。

### 📋 Implementation

#### A1: Project Setup (30 min)

```bash
# GitHub UI or API
gh project create \
  --owner ShunsukeHayashi \
  --title "Autonomous Operations — Agent Task Board" \
  --format table

# Add custom fields via GraphQL
```

**Custom Fields**:
```yaml
Fields:
  - name: "Agent"
    type: single_select
    options: [CoordinatorAgent, CodeGenAgent, ReviewAgent, IssueAgent, PRAgent, DeploymentAgent]

  - name: "Status"
    type: single_select
    options: [Pending, In Progress, Blocked, Review, Done]

  - name: "Priority"
    type: single_select
    options: [P0-Critical, P1-High, P2-Medium, P3-Low]

  - name: "Estimated Hours"
    type: number

  - name: "Actual Hours"
    type: number

  - name: "Quality Score"
    type: number  # 0-100

  - name: "Cost (USD)"
    type: number

  - name: "Phase"
    type: single_select
    options: [Phase 6, Phase 7, Phase 8, Phase 9, Phase 10]
```

#### A2: Auto-add Issues to Project (60 min)

**Workflow**: `.github/workflows/project-sync.yml`

```yaml
name: Sync Issues to Project

on:
  issues:
    types: [opened, labeled, assigned]
  pull_request:
    types: [opened, ready_for_review]

jobs:
  add-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add to Project
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/ShunsukeHayashi/projects/1
          github-token: ${{ secrets.GH_PROJECT_TOKEN }}

      - name: Set Custom Fields
        uses: titoportas/update-project-fields@v0.1.0
        with:
          project-url: https://github.com/users/ShunsukeHayashi/projects/1
          github-token: ${{ secrets.GH_PROJECT_TOKEN }}
          item-id: ${{ github.event.issue.node_id }}
          field-keys: |
            Status
            Phase
            Priority
          field-values: |
            Pending
            Phase 7
            ${{ github.event.issue.labels[0].name == '🔥Critical' && 'P0-Critical' || 'P2-Medium' }}
```

#### A3: Update Project on PR State (45 min)

```yaml
name: Update Project on PR Events

on:
  pull_request:
    types: [opened, closed, merged, review_requested]

jobs:
  update-status:
    runs-on: ubuntu-latest
    steps:
      - name: Get linked Issue
        id: issue
        run: |
          ISSUE_NUM=$(gh pr view ${{ github.event.pull_request.number }} \
                      --json body --jq '.body' | grep -oP 'Closes #\K\d+')
          echo "issue_number=$ISSUE_NUM" >> $GITHUB_OUTPUT

      - name: Update Project Status
        run: |
          case "${{ github.event.action }}" in
            opened)
              STATUS="In Progress"
              ;;
            review_requested)
              STATUS="Review"
              ;;
            closed)
              if [ "${{ github.event.pull_request.merged }}" == "true" ]; then
                STATUS="Done"
              else
                STATUS="Blocked"
              fi
              ;;
          esac

          # GraphQL mutation to update Project item
          gh api graphql -f query='
            mutation {
              updateProjectV2ItemFieldValue(input: {
                projectId: "PVT_kwDOAB..."
                itemId: "${{ steps.issue.outputs.issue_number }}"
                fieldId: "PVTF_lADO..."
                value: {
                  singleSelectOptionId: "'$STATUS'"
                }
              }) {
                projectV2Item {
                  id
                }
              }
            }'
```

#### A4: GraphQL Query Library (90 min)

**File**: `agents/sdk/github-projects.ts`

```typescript
import { Octokit } from '@octokit/core';

export class GitHubProjectsOS {
  private octokit: Octokit;
  private projectId: string;

  constructor(token: string, projectId: string) {
    this.octokit = new Octokit({ auth: token });
    this.projectId = projectId;
  }

  /**
   * Get all items from Project
   */
  async getAllItems(): Promise<ProjectItem[]> {
    const query = `
      query($projectId: ID!) {
        node(id: $projectId) {
          ... on ProjectV2 {
            items(first: 100) {
              nodes {
                id
                content {
                  ... on Issue {
                    number
                    title
                    state
                    labels(first: 10) {
                      nodes {
                        name
                      }
                    }
                  }
                }
                fieldValues(first: 20) {
                  nodes {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                      field {
                        ... on ProjectV2SingleSelectField {
                          name
                        }
                      }
                    }
                    ... on ProjectV2ItemFieldNumberValue {
                      number
                      field {
                        ... on ProjectV2Field {
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.octokit.graphql<ProjectResponse>(query, {
      projectId: this.projectId,
    });

    return result.node.items.nodes;
  }

  /**
   * Calculate KPIs from Project data
   */
  async calculateKPIs(): Promise<KPIReport> {
    const items = await this.getAllItems();

    const completed = items.filter(i => i.status === 'Done');
    const totalHours = items.reduce((sum, i) => sum + (i.actualHours || 0), 0);
    const totalCost = items.reduce((sum, i) => sum + (i.cost || 0), 0);
    const avgQualityScore = items
      .filter(i => i.qualityScore)
      .reduce((sum, i, _, arr) => sum + i.qualityScore / arr.length, 0);

    return {
      totalTasks: items.length,
      completedTasks: completed.length,
      completionRate: (completed.length / items.length) * 100,
      totalHours,
      totalCost,
      avgQualityScore,
      byAgent: this.groupByAgent(items),
      byPhase: this.groupByPhase(items),
    };
  }

  /**
   * Update custom field value
   */
  async updateField(
    itemId: string,
    fieldName: string,
    value: string | number
  ): Promise<void> {
    const fieldId = await this.getFieldId(fieldName);

    const mutation = `
      mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
        updateProjectV2ItemFieldValue(input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $value }
        }) {
          projectV2Item {
            id
          }
        }
      }
    `;

    await this.octokit.graphql(mutation, {
      projectId: this.projectId,
      itemId,
      fieldId,
      value: value.toString(),
    });
  }
}
```

#### A5: Weekly Report Generation (60 min)

**Workflow**: `.github/workflows/weekly-report.yml`

```yaml
name: Generate Weekly Project Report

on:
  schedule:
    - cron: '0 0 * * 1'  # Every Monday at midnight
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Generate Report
        run: |
          npx ts-node scripts/generate-weekly-report.ts
        env:
          GITHUB_TOKEN: ${{ secrets.GH_PROJECT_TOKEN }}
          PROJECT_ID: ${{ secrets.PROJECT_ID }}

      - name: Post to Discussions
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            /repos/${{ github.repository }}/discussions \
            -f title="📊 Weekly Report: $(date +%Y-%m-%d)" \
            -f body="$(cat weekly-report.md)" \
            -f category_id="${{ secrets.DISCUSSION_CATEGORY_ID }}"
```

**Deliverables**:
- ✅ Project V2 created with 8 custom fields
- ✅ Auto-add Issues/PRs to Project
- ✅ Auto-update status on PR events
- ✅ GraphQL SDK for Project queries
- ✅ Weekly report automation

---

## 🔔 Phase B: GitHub Webhooks — Event Bus

### 🎯 Goal
Webhook経由でリアルタイムイベントを受信し、Agentを自動起動する完全な「Event-Driven Architecture」を実現。

### 📋 Implementation

#### B1: Webhook Endpoint Setup (90 min)

**Option 1: GitHub Actions as Webhook Consumer**

```yaml
# .github/workflows/webhook-handler.yml
name: Webhook Event Handler

on:
  issues:
    types: [opened, labeled, closed, assigned]
  pull_request:
    types: [opened, synchronize, closed]
  issue_comment:
    types: [created]
  push:
    branches: [main]

jobs:
  route-event:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Route to Agent
        run: |
          EVENT_TYPE="${{ github.event_name }}"
          ACTION="${{ github.event.action }}"

          case "$EVENT_TYPE-$ACTION" in
            issues-opened)
              echo "🤖 Triggering IssueAgent"
              gh workflow run issue-agent.yml \
                -f issue_number=${{ github.event.issue.number }}
              ;;
            issues-labeled)
              if echo "${{ github.event.label.name }}" | grep -q "🤖agent-execute"; then
                echo "🚀 Triggering CoordinatorAgent"
                gh workflow run agent-runner.yml \
                  -f issue_number=${{ github.event.issue.number }}
              fi
              ;;
            pull_request-opened)
              echo "📝 Triggering ReviewAgent"
              gh workflow run review-agent.yml \
                -f pr_number=${{ github.event.pull_request.number }}
              ;;
            issue_comment-created)
              if echo "${{ github.event.comment.body }}" | grep -q "/agent"; then
                echo "💬 Command detected, executing..."
                # Parse command and route
              fi
              ;;
          esac
```

**Option 2: External Webhook Server (Advanced)**

```typescript
// webhook-server/index.ts
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Verify GitHub webhook signature
function verifySignature(req: express.Request, secret: string): boolean {
  const signature = req.headers['x-hub-signature-256'] as string;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
  return signature === digest;
}

app.post('/webhook', async (req, res) => {
  if (!verifySignature(req, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.headers['x-github-event'];
  const action = req.body.action;

  console.log(`📥 Received: ${event}.${action}`);

  // Route to appropriate handler
  switch (`${event}.${action}`) {
    case 'issues.opened':
      await handleIssueOpened(req.body);
      break;
    case 'issues.labeled':
      await handleIssueLabeled(req.body);
      break;
    case 'pull_request.opened':
      await handlePROpened(req.body);
      break;
    // ... more handlers
  }

  res.status(200).send('OK');
});

async function handleIssueOpened(payload: any) {
  // Trigger CoordinatorAgent via GitHub API
  await octokit.actions.createWorkflowDispatch({
    owner: payload.repository.owner.login,
    repo: payload.repository.name,
    workflow_id: 'agent-runner.yml',
    ref: 'main',
    inputs: {
      issue_number: payload.issue.number.toString(),
    },
  });
}

app.listen(3000, () => {
  console.log('🔔 Webhook server listening on port 3000');
});
```

#### B2: Event Routing Matrix (30 min)

**Document**: `docs/EVENT_ROUTING.md`

```markdown
## Event Routing Matrix

| GitHub Event | Action | Target Agent | Priority |
|--------------|--------|--------------|----------|
| `issues.opened` | - | IssueAgent | P2-Medium |
| `issues.labeled` | `🤖agent-execute` | CoordinatorAgent | P1-High |
| `issues.assigned` | - | (Notification only) | P3-Low |
| `pull_request.opened` | - | ReviewAgent | P1-High |
| `pull_request.review_requested` | - | (Notify reviewer) | P2-Medium |
| `pull_request.closed` (merged) | - | DeploymentAgent | P0-Critical |
| `issue_comment.created` | `/agent` | CommandParser → Agent | P1-High |
| `push` (main branch) | - | CI/CD Pipeline | P0-Critical |
| `workflow_run.completed` (failed) | - | (Notify Guardian) | P0-Critical |
| `release.published` | - | (Community notification) | P3-Low |
```

#### B3: Agent Auto-Start Configuration (45 min)

**File**: `agents/triggers.json`

```json
{
  "triggers": [
    {
      "event": "issues.opened",
      "conditions": {
        "labels": ["🤖agent-task"],
        "body_contains": "[AGENT]"
      },
      "agent": "IssueAgent",
      "action": "analyze_and_label",
      "timeout_minutes": 5
    },
    {
      "event": "issues.labeled",
      "conditions": {
        "label": "🤖agent-execute"
      },
      "agent": "CoordinatorAgent",
      "action": "execute_full_workflow",
      "timeout_minutes": 30
    },
    {
      "event": "pull_request.opened",
      "conditions": {
        "draft": false
      },
      "agent": "ReviewAgent",
      "action": "quality_check",
      "timeout_minutes": 10
    },
    {
      "event": "issue_comment.created",
      "conditions": {
        "body_starts_with": "/agent"
      },
      "agent": "CommandParser",
      "action": "parse_and_route",
      "timeout_minutes": 2
    }
  ]
}
```

**Deliverables**:
- ✅ Webhook handler workflow
- ✅ Event routing matrix documented
- ✅ Agent auto-start triggers configured
- ✅ Signature verification implemented
- ✅ External webhook server (optional)

---

## 💬 Phase C: GitHub Discussions — Message Queue

### 🎯 Goal
GitHub Discussionsを非同期コミュニケーション・Q&A・アイデア共有の場として活用。

### 📋 Implementation

#### C1: Enable Discussions (5 min)

```bash
# Repository Settings → Features → Discussions (Enable)
# Or via API:
gh api \
  --method PATCH \
  -H "Accept: application/vnd.github+json" \
  /repos/ShunsukeHayashi/Autonomous-Operations \
  -f has_discussions=true
```

#### C2: Create Categories (15 min)

```yaml
Categories:
  - name: "📢 Announcements"
    description: "Official announcements from the Guardian"
    format: "announcement"

  - name: "💡 Ideas"
    description: "Feature requests & enhancement proposals"
    format: "discussion"

  - name: "❓ Q&A"
    description: "Questions about Agentic OS & Agent development"
    format: "question"

  - name: "🎉 Show & Tell"
    description: "Share your projects built with Agentic OS"
    format: "discussion"

  - name: "📊 Weekly Reports"
    description: "Automated weekly KPI & progress reports"
    format: "discussion"

  - name: "🗳️ Polls"
    description: "Community voting & decision-making"
    format: "poll"
```

#### C3: Discussion Bot (60 min)

**Workflow**: `.github/workflows/discussion-bot.yml`

```yaml
name: Discussion Bot

on:
  discussion:
    types: [created]
  discussion_comment:
    types: [created]

jobs:
  auto-response:
    runs-on: ubuntu-latest
    steps:
      - name: Welcome New Discussions
        if: github.event.action == 'created' && github.event.discussion.user.login != 'github-actions[bot]'
        run: |
          gh api \
            --method POST \
            -H "Accept: application/vnd.github+json" \
            /repos/${{ github.repository }}/discussions/${{ github.event.discussion.number }}/comments \
            -f body="👋 Welcome to Agentic OS Discussions!

          Thank you for starting a conversation. Our community and AI Agents monitor this space actively.

          - 💡 **Ideas**: Will be reviewed in the next planning session
          - ❓ **Q&A**: Expect a response within 24-48 hours
          - 🎉 **Show & Tell**: We'd love to feature your project!

          Meanwhile, check out:
          - [Getting Started Guide](../GETTING_STARTED.md)
          - [AGENTS.md Constitution](../.github/AGENTS.md)
          - [GitHub Discussions](https://github.com/ShunsukeHayashi/autonomous-operations/discussions)

          🤖 *This is an automated message from Discussion Bot*"

      - name: Link to Related Issues
        run: |
          # If discussion mentions "Issue #123", add a comment linking back
          # If discussion is in "Ideas" category, create draft Issue
```

#### C4: Weekly Digest (30 min)

**Script**: `scripts/discussion-digest.ts`

```typescript
import { Octokit } from '@octokit/core';

async function generateWeeklyDigest() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Get discussions from past week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: discussions } = await octokit.request(
    'GET /repos/{owner}/{repo}/discussions',
    {
      owner: 'ShunsukeHayashi',
      repo: 'Autonomous-Operations',
    }
  );

  const recentDiscussions = discussions.filter(
    (d) => new Date(d.created_at) > oneWeekAgo
  );

  const digest = `
# 📊 Weekly Discussion Digest

**Week of**: ${new Date().toLocaleDateString()}

## 💡 Top Ideas (${recentDiscussions.filter(d => d.category === 'Ideas').length})
${recentDiscussions
  .filter(d => d.category === 'Ideas')
  .map(d => `- [${d.title}](${d.url}) by @${d.user.login}`)
  .join('\n')}

## ❓ Q&A Highlights
${recentDiscussions
  .filter(d => d.category === 'Q&A' && d.answer_chosen_at)
  .map(d => `- [${d.title}](${d.url}) ✅ Answered`)
  .join('\n')}

## 🎉 Community Showcases
${recentDiscussions
  .filter(d => d.category === 'Show & Tell')
  .map(d => `- [${d.title}](${d.url}) by @${d.user.login}`)
  .join('\n')}

---
*Automated digest generated by AgenticOS*
  `;

  // Post to Discussions
  await octokit.request(
    'POST /repos/{owner}/{repo}/discussions',
    {
      owner: 'ShunsukeHayashi',
      repo: 'Autonomous-Operations',
      title: `📊 Weekly Digest: ${new Date().toLocaleDateString()}`,
      body: digest,
      category_id: '<weekly-reports-category-id>',
    }
  );
}
```

**Deliverables**:
- ✅ GitHub Discussions enabled
- ✅ 6 categories created
- ✅ Welcome bot for new discussions
- ✅ Weekly digest automation

---

## 📦 Phase D: GitHub Packages — Package Manager

*(Content continues with Phases D-J...)*

**Due to length, I'll create the remaining phases as separate sections.**

---

## 📊 Summary Dashboard

```
Current GitHub OS Integration: 27%
Target: 93%

Critical Phases (A, B, E): 3 phases
High Priority (C, D, F, G): 5 phases
Medium/Low (H, I, J): 5 phases

Estimated Total Time: 20-30 hours
Immediate Focus: Phases A → B → E (Critical Path)
```

---

**Next Steps**:
1. Guardian approval on approach
2. Start with Phase A (Projects V2)
3. Parallel work on Phase C (Discussions)
4. Proceed to Phase B (Webhooks)

---

**🤖 Generated with [Claude Code](https://claude.com/claude-code)**
**Co-Authored-By: Claude <noreply@anthropic.com>**
