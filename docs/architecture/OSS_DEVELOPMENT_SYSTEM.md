# OSS継続開発システム設計書

**Version**: 1.0.0
**Date**: 2025-10-08
**Status**: 🚀 Active Development
**Philosophy**: AGENTS.md憲法準拠 + Claude Code前提

---

## 🎯 システムゴール

**「完全に自律的な価値創造システム」として、コミュニティと共に進化し続けるOSSテンプレートの構築**

### 3つの自律性レベル

```
Level 1: Internal Autonomy (内部自律性)
└─ プロジェクト自身がAGENTS.mdに基づき自己進化

Level 2: Community Autonomy (コミュニティ自律性)
└─ コントリビューターがClaude Codeで効率的に貢献

Level 3: Ecosystem Autonomy (エコシステム自律性)
└─ 他プロジェクトがこのテンプレートを活用し成長
```

---

## 📐 アーキテクチャ全体図

```
┌─────────────────────────────────────────────────────────────┐
│                    OSS Development Lifecycle                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌────────────┐ │
│  │ User Feedback│─────▶│ Issue System │─────▶│ Triage Bot │ │
│  │ (GitHub/Form)│      │ (Auto-Label) │      │ (Priority) │ │
│  └──────────────┘      └──────────────┘      └────────────┘ │
│          │                     │                     │        │
│          ▼                     ▼                     ▼        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         CoordinatorAgent (AGENTS.md準拠)            │   │
│  │  - Issue分解 → TaskDAG構築 → Agent割り当て          │   │
│  └──────────────────────────────────────────────────────┘   │
│          │                                                    │
│          ├─────────────┬─────────────┬─────────────┐        │
│          ▼             ▼             ▼             ▼        │
│  ┌─────────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ CodeGenAgent│ │ReviewAgent│ │IssueAgent│ │  PRAgent │   │
│  └─────────────┘ └──────────┘ └──────────┘ └──────────┘   │
│          │             │             │             │        │
│          └─────────────┴─────────────┴─────────────┘        │
│                         │                                    │
│                         ▼                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Quality Gate (80点基準)                 │   │
│  │  - TypeScript: 0 errors                              │   │
│  │  - Tests: Coverage ≥80%                              │   │
│  │  - Security: 0 vulnerabilities                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│          ┌──────────────┴──────────────┐                    │
│          ▼ PASS                        ▼ FAIL               │
│  ┌─────────────┐              ┌──────────────────┐         │
│  │  Auto-Merge │              │  Escalation to   │         │
│  │  (Draft→PR) │              │  Human Guardian  │         │
│  └─────────────┘              └──────────────────┘         │
│          │                             │                    │
│          ▼                             ▼                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Knowledge Base Update                      │   │
│  │  - Vector DB (Pinecone/Weaviate)                     │   │
│  │  - Post-Mortem (.ai/knowledge/)                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧬 AGENTS.md憲法の実装マッピング

### Part 1: Core Governance (ガバナンス)

#### 1.1 The Three Laws of Autonomy

| 法則 | 実装 | 検証方法 |
|------|------|----------|
| **第一条: Objectivity**<br>感情排除、データ駆動 | `quality_score` 算出<br>ESLint/TypeScript/Security<br>スコア化 | GitHub Actions<br>`quality-check.yml` |
| **第二条: Self-Sufficiency**<br>人間介入の最小化 | Auto-merge on 80+ score<br>`human-intervention-required`<br>ラベル自動付与 | Escalation rate<br>≤5% 目標 |
| **第三条: Traceability**<br>全行動をGitHub記録 | LDD形式ログ<br>`.ai/logs/YYYY-MM-DD.md`<br>全Agent行動記録 | Audit log完全性<br>100% |

#### 1.2 Economic Governance Protocol (経済的自律性)

**実装**:

```yaml
# .github/workflows/economic-circuit-breaker.yml
name: Economic Circuit Breaker

on:
  schedule:
    - cron: '0 * * * *'  # 1時間ごと

jobs:
  monitor-costs:
    runs-on: ubuntu-latest
    steps:
      - name: Check Anthropic API usage
        run: |
          USAGE=$(curl -H "x-api-key: ${{ secrets.ANTHROPIC_API_KEY }}" \
                       https://api.anthropic.com/v1/usage)
          BUDGET_LIMIT=${{ vars.MONTHLY_AI_BUDGET }}

          if [ $(echo "$USAGE > $BUDGET_LIMIT * 1.5" | bc) -eq 1 ]; then
            gh api -X POST /repos/${{ github.repository }}/actions/workflows/agent-runner.yml/disable
            gh issue create \
              --title "🚨 Economic Circuit Breaker Triggered" \
              --body "AI API usage exceeded 150% of budget. All agent workflows disabled." \
              --label "🤖AI-エスカレーション,🔥Sev.1-Critical"
          fi
```

**監視対象**:
- Anthropic API usage (Claude Sonnet 4)
- GitHub Actions minutes
- Firebase hosting bandwidth

**予算定義**: `BUDGET.yml`

```yaml
monthly_budget:
  anthropic_api: 500  # USD
  github_actions: 3000  # minutes (Free tierで十分)
  firebase: 10  # GB bandwidth

thresholds:
  warning: 0.8   # 80%で警告
  emergency: 1.5  # 150%で緊急停止
```

#### 1.3 Automated Prioritization Protocol

**組織設計Label体系との統合**:

```typescript
// scripts/auto-prioritize.ts
interface PriorityCalculation {
  severity: 'Sev.1' | 'Sev.2' | 'Sev.3' | 'Sev.4' | 'Sev.5';
  impact: 'Critical' | 'High' | 'Medium' | 'Low';
  assignee: 'AI' | 'TechLead' | 'PO' | 'Guardian';
}

function calculatePriority(issue: Issue): PriorityCalculation {
  const keywords = {
    critical: ['crash', 'data loss', 'security breach'],
    high: ['cannot', 'broken', 'fails'],
    medium: ['should', 'improve', 'enhance'],
    low: ['typo', 'cosmetic', 'refactor'],
  };

  // キーワードマッチング + ML分類器
  const severity = classifySeverity(issue.body, keywords);
  const impact = estimateImpact(issue.labels);
  const assignee = determineAssignee(severity, impact);

  return { severity, impact, assignee };
}
```

### Part 2: Development & Release Cycle

#### 2.1 Knowledge Persistence Layer (ナレッジ永続化)

**実装**:

```
autonomous-operations-knowledge/  # 別リポジトリ
├── incidents/
│   ├── 2025-10-08-api-rate-limit.md
│   └── 2025-10-09-typescript-error.md
├── postmortems/
│   └── 2025-10-critical-deployment-failure.md
├── rfcs/
│   ├── 001-mcp-server-architecture.md
│   └── 002-multi-agent-coordination.md
└── best-practices/
    ├── claude-code-workflows.md
    └── agent-prompt-engineering.md
```

**Vector DB統合**:

```typescript
// agents/base-agent.ts
async searchKnowledge(query: string): Promise<KnowledgeEntry[]> {
  const embedding = await this.createEmbedding(query);

  const results = await pinecone.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
  });

  return results.matches.map(m => ({
    content: m.metadata.content,
    similarity: m.score,
    source: m.metadata.source,
  }));
}
```

**自動学習フロー**:

```yaml
# .github/workflows/knowledge-indexing.yml
name: Knowledge Base Indexing

on:
  push:
    branches: [main]
    paths:
      - 'autonomous-operations-knowledge/**'

jobs:
  index:
    runs-on: ubuntu-latest
    steps:
      - name: Chunk and Embed
        run: |
          python scripts/chunk-markdown.py
          python scripts/create-embeddings.py --provider anthropic
          python scripts/upload-to-pinecone.py
```

#### 2.2 Zero-Human Approval Protocol

**実装済み**: 品質スコア80点以上で自動マージ

```typescript
// agents/review-agent.ts
async evaluateQuality(pr: PullRequest): Promise<QualityReport> {
  let score = 100;

  const eslintErrors = await runESLint(pr.files);
  score -= eslintErrors.length * 20;

  const tsErrors = await runTypeScript(pr.files);
  score -= tsErrors.length * 30;

  const vulnerabilities = await runSecurityScan(pr.files);
  score -= vulnerabilities.critical * 40;

  const testCoverage = await getTestCoverage(pr.files);
  if (testCoverage < 80) score -= (80 - testCoverage) * 2;

  return {
    score,
    passed: score >= 80,
    breakdown: { eslintErrors, tsErrors, vulnerabilities, testCoverage },
  };
}
```

### Part 3: Self-Healing & Human Interface

#### 3.1 Graceful Degradation Protocol

**実装**:

```yaml
# .github/workflows/incident-response.yml
name: Incident Response

on:
  workflow_dispatch:
    inputs:
      incident_type:
        required: true
        type: choice
        options:
          - deployment_failure
          - security_breach
          - api_outage

jobs:
  assess:
    runs-on: ubuntu-latest
    steps:
      - name: Attempt automated recovery
        id: recovery
        run: |
          for i in {1..3}; do
            if ./scripts/auto-recover.sh; then
              echo "recovered=true" >> $GITHUB_OUTPUT
              exit 0
            fi
            sleep 60
          done
          echo "recovered=false" >> $GITHUB_OUTPUT

      - name: Execute Handshake Protocol
        if: steps.recovery.outputs.recovered == 'false'
        uses: actions/github-script@v6
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🤖🆘 HANDSHAKE PROTOCOL: Autonomous Recovery Failed',
              body: `
## System Status
- Incident Type: ${{ github.event.inputs.incident_type }}
- Recovery Attempts: 3/3 FAILED
- Affected Systems: [Auto-detected list]

## Actions Taken
1. Attempted rollback: FAILED
2. Attempted service restart: FAILED
3. Attempted failover: FAILED

## Current State
- System in degraded mode
- Feature flags disabled: [List]
- Monitoring active

**🆘 Requesting Guardian intervention.**

@ShunsukeHayashi @kinoshitaifr
              `,
              labels: ['human-intervention-required', '🔥Sev.1-Critical'],
            });
```

### Part 4: Systemic Integrity

#### 4.1 Automation Infrastructure Security

**HashiCorp Vault統合** (Future):

```yaml
# .github/workflows/secure-agent-run.yml
jobs:
  run_agent:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # OIDC token取得
    steps:
      - name: Get Vault Token
        id: vault
        run: |
          VAULT_TOKEN=$(vault write -field=token auth/jwt/login \
            role=github-actions \
            jwt=${{ github.token }})
          echo "::add-mask::$VAULT_TOKEN"
          echo "token=$VAULT_TOKEN" >> $GITHUB_OUTPUT

      - name: Get Dynamic GitHub Token
        run: |
          GITHUB_APP_TOKEN=$(vault read -field=token secret/github/app)
          # 有効期限15分の短期トークン
```

#### 4.2 Agent Onboarding Protocol

**新Agentの自動登録**:

```yaml
# .github/workflows/agent-onboarding.yml
name: Agent Onboarding

on:
  push:
    paths:
      - 'agents/**/*.ts'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Compliance Check
        run: |
          # 1. Secretsスキャン
          trufflehog filesystem agents/ --json

      - name: Interface Validation
        run: |
          # 2. BaseAgent継承確認
          npx ts-node scripts/validate-agent-interface.ts

      - name: Unit Tests
        run: |
          # 3. Agent単体テスト実行
          npm test -- agents/

      - name: Register Agent
        if: success()
        run: |
          # 4. CODEOWNERS更新
          echo "agents/new-agent/** @ShunsukeHayashi" >> .github/CODEOWNERS

          # 5. CoordinatorAgentのタスクマッピングに追加
          node scripts/register-agent.js --name NewAgent
```

#### 4.3 Disaster Recovery (システム復旧)

**Infrastructure as Code**:

```
system-as-code/  # 別リポジトリ
├── terraform/
│   ├── github-repo.tf
│   ├── github-actions.tf
│   ├── github-labels.tf
│   └── github-secrets.tf
├── workflows/
│   └── *.yml (全Workflowのバックアップ)
└── bootstrap.sh
```

**完全破壊からの復旧**:

```bash
#!/bin/bash
# bootstrap.sh - システム完全復旧スクリプト

cd system-as-code/terraform
terraform init
terraform apply -auto-approve

# Workflow再配置
cp -r ../workflows/* ../../.github/workflows/

# Label同期
node ../../scripts/sync-github-labels.cjs

echo "✅ System restored from Genesis Configuration"
```

---

## 🌍 OSSコミュニティ統合

### コントリビューター体験の設計

#### 1. First-Time Contributor (初回貢献者)

**オンボーディングフロー**:

```
1. Fork & Clone
   └─ README.md内の"Contributing"リンクをクリック

2. Setup (自動化)
   └─ ./scripts/init-project.sh 実行
   └─ Claude Code統合確認

3. Issue選択
   └─ `good-first-issue` ラベル付きを推奨
   └─ Claude Codeで /create-issue --template good-first-issue

4. 開発
   └─ Claude Codeが自動でブランチ作成・コミット
   └─ ローカルでテスト実行

5. PR作成
   └─ ReviewAgentが自動レビュー
   └─ 品質スコア表示

6. マージ
   └─ 80点以上で自動承認
   └─ Contributorsリストに自動追加
```

#### 2. Regular Contributor (定常貢献者)

**レベルアップシステム**:

```typescript
// scripts/contributor-levels.ts
enum ContributorLevel {
  Newcomer = 0,      // 1-5 PRs
  Contributor = 1,   // 6-20 PRs
  ActiveContributor = 2,  // 21-50 PRs
  CoreContributor = 3,    // 51+ PRs or maintainer nomination
}

interface ContributorBadge {
  level: ContributorLevel;
  specialties: string[];  // ['TypeScript', 'Documentation', 'Testing']
  privileges: string[];   // ['auto-merge', 'label-management', 'issue-triage']
}
```

**権限の自動付与**:

```yaml
# .github/workflows/contributor-promotion.yml
name: Contributor Promotion

on:
  pull_request:
    types: [closed]

jobs:
  check_promotion:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - name: Count merged PRs
        id: count
        run: |
          AUTHOR=${{ github.event.pull_request.user.login }}
          COUNT=$(gh pr list --author $AUTHOR --state merged --json number | jq 'length')
          echo "count=$COUNT" >> $GITHUB_OUTPUT

      - name: Promote to Contributor
        if: steps.count.outputs.count == 6
        run: |
          gh api /repos/${{ github.repository }}/collaborators/$AUTHOR \
            -X PUT -f permission=triage

          gh issue create \
            --title "🎉 @$AUTHOR promoted to Contributor!" \
            --body "Congratulations on your 6th merged PR!"
```

### Issue Triage Bot (自動振り分け)

```typescript
// .github/actions/triage-bot/index.ts
export async function triageIssue(issue: Issue): Promise<void> {
  // 1. 既存Issueとの重複チェック
  const duplicates = await searchDuplicates(issue.title, issue.body);
  if (duplicates.length > 0) {
    await addLabel(issue, 'duplicate');
    await addComment(issue, `Possible duplicate of #${duplicates[0].number}`);
    return;
  }

  // 2. カテゴリー分類
  const category = await classifyCategory(issue.body);
  await addLabel(issue, category);  // 'bug', 'feature', 'docs', etc.

  // 3. 優先度判定 (AGENTS.md準拠)
  const priority = await calculatePriority(issue);
  await addLabel(issue, priority.severity);  // 'Sev.1-Critical', etc.
  await addLabel(issue, priority.impact);    // '📊影響度-High', etc.

  // 4. Agent割り当て判定
  if (priority.severity === 'Sev.1-Critical') {
    await addLabel(issue, '👨‍💻人間必須');
    await mentionGuardian(issue);
  } else if (await isAutomatable(issue)) {
    await addLabel(issue, '🤖担当-AI Agent');
  } else {
    await addLabel(issue, '👥担当-テックリード');
  }

  // 5. テンプレート準拠確認
  if (!hasRequiredSections(issue.body)) {
    await addLabel(issue, 'needs-information');
    await addComment(issue, TEMPLATE_GUIDANCE);
  }
}
```

### Community Health Files

```
.github/
├── CODE_OF_CONDUCT.md          # 行動規範
├── CONTRIBUTING.md              # 貢献ガイド (既存)
├── SECURITY.md                  # セキュリティポリシー
├── SUPPORT.md                   # サポート情報
├── GOVERNANCE.md                # プロジェクト統治
└── ISSUE_TEMPLATE/
    ├── bug_report.yml
    ├── feature_request.yml
    ├── good_first_issue.yml     # 初心者向け
    └── agent_task.yml           # Agent実行用 (既存)
```

---

## 📊 メトリクス & ダッシュボード

### Public Dashboard (公開ダッシュボード)

**実装**: GitHub Pages + Chart.js

```
docs/dashboard/
├── index.html                   # メインダッシュボード
├── metrics.json                 # 日次更新データ
└── charts/
    ├── agent-performance.js
    ├── community-growth.js
    └── quality-trends.js
```

**表示メトリクス**:

| カテゴリ | メトリクス | 更新頻度 |
|---------|-----------|---------|
| **Agent Performance** | Task成功率<br>平均実行時間<br>品質スコア平均 | 1時間ごと |
| **Community** | Active contributors<br>New contributors (30日)<br>PR merge率 | 日次 |
| **Quality** | Test coverage<br>TypeScript errors<br>Security score | コミットごと |
| **Economic** | API usage<br>GitHub Actions分数<br>予算消費率 | 1時間ごと |

**自動更新**:

```yaml
# .github/workflows/update-dashboard.yml
name: Update Public Dashboard

on:
  schedule:
    - cron: '0 * * * *'  # 毎時

jobs:
  collect_metrics:
    runs-on: ubuntu-latest
    steps:
      - name: Collect Agent Metrics
        run: |
          node scripts/collect-agent-metrics.js > docs/dashboard/metrics.json

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/dashboard
```

---

## 🔄 継続的改善ループ

### Self-Evolution Protocol (自己進化プロトコル)

**AGENTS.md自体の改訂プロセス**:

```
1. Agent/Humanが改善提案Issueを起票
   └─ タイトル: "[CONSTITUTIONAL AMENDMENT] ..."
   └─ Label: '🔴決裁権限', '🎯担当-PM'

2. Community Discussion (7日間)
   └─ 影響分析レポート自動生成
   └─ 互換性チェック

3. Guardian Review
   └─ @ShunsukeHayashiが最終承認

4. 憲法改正Merge
   └─ AGENTS.mdバージョンアップ
   └─ 全Agentの再ビルド

5. Post-Mortem
   └─ 改正の効果測定 (30日後)
```

**改正提案テンプレート**:

```markdown
---
name: Constitutional Amendment Proposal
about: Propose changes to AGENTS.md
title: '[CONSTITUTIONAL AMENDMENT] '
labels: '🔴決裁権限, constitutional-change'
---

## 📜 Proposed Change

### Current Text (行番号)
```text
(現在の条文)
```

### Proposed Text
```text
(改正案)
```

## 🎯 Motivation

(なぜこの改正が必要か)

## 📊 Impact Analysis

- Affected Agents: [List]
- Affected Workflows: [List]
- Breaking Changes: Yes/No
- Migration Path: [Description]

## 🧪 Validation Plan

(この改正が正しく機能することをどう検証するか)

## 📅 Timeline

- Discussion Period: 7 days
- Implementation: TBD
- Rollout: TBD
```

---

## 🚀 Phase Rollout Plan

### Phase 1: Foundation (Week 1-2) ✅ DONE

- [x] プロジェクト初期化システム
- [x] MCP統合
- [x] Claude Codeコマンド
- [x] Agent定義
- [x] ドキュメント

### Phase 2: Community Infrastructure (Week 3-4)

- [ ] CODE_OF_CONDUCT.md
- [ ] SECURITY.md
- [ ] GOVERNANCE.md
- [ ] Triage Bot実装
- [ ] Contributor Levels実装
- [ ] Public Dashboard

### Phase 3: Self-Healing (Week 5-6)

- [ ] Knowledge Base Repository
- [ ] Vector DB統合 (Pinecone)
- [ ] Economic Circuit Breaker
- [ ] Graceful Degradation実装
- [ ] Disaster Recovery Terraform

### Phase 4: OSS Launch (Week 7-8)

- [ ] GitHub Template Repository公開
- [ ] Hacker News投稿
- [ ] Product Hunt掲載
- [ ] Twitter/X告知
- [ ] Documentation翻訳 (EN)

### Phase 5: Ecosystem Growth (Week 9+)

- [ ] Example Projects (3-5種類)
- [ ] Integration Guides (Vercel, Railway, etc.)
- [ ] Community Workshops
- [ ] Agent Marketplace構想

---

## 📋 即座に着手すべきタスク

### 優先度: 🔥 Critical

1. **AGENTS.md実装ギャップ解消**
   - [ ] Economic Circuit Breaker実装
   - [ ] Knowledge Base Repository作成
   - [ ] Disaster Recovery Terraform

2. **Community Health Files**
   - [ ] CODE_OF_CONDUCT.md
   - [ ] SECURITY.md
   - [ ] GOVERNANCE.md

3. **Triage Bot**
   - [ ] Issue自動ラベリング
   - [ ] 重複検出
   - [ ] 優先度判定

### 優先度: ⭐ High

4. **Contributor Experience**
   - [ ] Contributor Levels
   - [ ] Auto-promotion
   - [ ] CONTRIBUTORS.md自動更新

5. **Public Dashboard**
   - [ ] メトリクス収集スクリプト
   - [ ] GitHub Pages UI
   - [ ] 自動更新Workflow

---

## 🤖 Claude Code Usage Guidelines

**このプロジェクトでのClaude Code運用方針**:

### 1. Issue Driven Development

```bash
# 1. Issueから開始
/create-issue

# 2. Agentに任せる
# (GitHub Actionsが自動実行)

# 3. PRレビュー
gh pr view [NUMBER]

# 4. マージ
gh pr merge [NUMBER]
```

### 2. Local Development

```bash
# 1. ブランチ作成
git checkout -b feature/[issue-number]-description

# 2. Claude Code起動
claude

# 3. コマンド活用
/test
/typecheck
/agent-run

# 4. PR作成
/create-pr
```

### 3. Debugging

```bash
# Agent実行ログ確認
cat .ai/logs/$(date +%Y-%m-%d).md

# 品質レポート確認
cat .ai/parallel-reports/report-issue-*.json | jq

# エラートレース
/security-scan
/generate-docs
```

---

## 📞 Guardian Contact

**人間介入が必要な場合**:

| Severity | Contact | Response Time |
|----------|---------|---------------|
| Sev.1-Critical | @ShunsukeHayashi<br>@kinoshitaifr | 1 hour |
| Sev.2-High | @ShunsukeHayashi | 24 hours |
| Sev.3-Medium | GitHub Issue | 48 hours |

**Escalation Path**:

```
Agent (自動対応失敗)
  ↓
Guardian Review (手動レビュー)
  ↓
Community Discussion (コミュニティ議論)
  ↓
Constitutional Amendment (憲法改正)
```

---

**🎉 このシステムにより、Autonomous Operationsは完全に自律的なOSSプロジェクトとして成長を続けます。**

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
