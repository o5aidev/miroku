# Issue依存関係の可視化

## 概要

Miyabi Dashboardは、Issue間の依存関係を自動的にパースしてエンティティリレーションシップとして可視化します。

---

## サポートされる依存関係タイプ

### 1. **Depends On** (依存)

Issue本文に以下のキーワードを含めると、依存関係が自動検出されます：

```markdown
Depends on #47
Requires #52
Needs #58
Blocked by #42
Waiting for #56
```

**矢印の向き:** 依存元 ← 依存先

**表示:** オレンジの破線（`---->`）

**例:**
```
Issue #58 depends on #47
→ グラフ: #47 -----> #58 (オレンジ破線)
```

---

### 2. **Blocks** (ブロック)

このIssueが他のIssueをブロックしている場合：

```markdown
Blocks #56
Blocking #52
```

**矢印の向き:** ブロック元 → ブロック先

**表示:** 赤の太破線（`====>`）

**例:**
```
Issue #47 blocks #56
→ グラフ: #47 =====> #56 (赤破線)
```

---

### 3. **Related To** (関連)

関連するIssueを示す：

```markdown
Related to #52
See also #47
```

**矢印の向き:** 双方向（どちら向きでも可）

**表示:** グレーの点線（`......`）

**例:**
```
Issue #58 related to #52
→ グラフ: #58 ...... #52 (グレー点線)
```

---

## 使用例

### 例1: Feature実装の依存関係

**Issue #58:** 🐛 Bug: miyabi init creates incomplete project setup
```markdown
This bug blocks the following features:

Blocks #56
Blocks #52

To fix this, we need to:
Depends on #47 (security audit must be resolved first)
```

**グラフ表示:**
```
#47 (Security Audit)
  └─ depends on -----> #58 (Bug fix)
                         ├─ blocks =====> #56 (SaaS Platform)
                         └─ blocks =====> #52 (Discord Community)
```

---

### 例2: 並行開発の可視化

**Issue #56:** [STRATEGIC] Miyabi SaaS Platform Development & Market Launch
```markdown
This epic depends on multiple components:

Depends on #58 (project setup must work)
Depends on #47 (security audit must pass)
Related to #52 (community launch should be coordinated)
```

**グラフ表示:**
```
#47 (Security) -----> #56 (SaaS Platform)
#58 (Bug fix)  -----> #56 (SaaS Platform)
#52 (Community) ..... #56 (SaaS Platform)
```

---

## ダッシュボードでの表示

### Legend（凡例）

ダッシュボード右上に自動表示されます：

```
Edge Types
─────────── Assignment (Agent割り当て)
- - - - - - Depends on (依存関係)
= = = = = = Blocks (ブロック)
· · · · · · Related (関連)
```

### ノード配置

依存関係を持つIssueは自動的に階層レイアウトされます：

```
Level 1: 依存されているIssue（ルート）
  ↓
Level 2: 依存しているIssue
  ↓
Level 3: さらに依存しているIssue
```

---

## ベストプラクティス

### 1. Issue本文のテンプレート

```markdown
## Description
[Issue内容]

## Dependencies
Depends on #XX
Blocks #YY
Related to #ZZ

## Acceptance Criteria
- [ ] ...
```

### 2. 循環依存の回避

❌ **悪い例:**
```
Issue #47 depends on #58
Issue #58 depends on #47  ← 循環依存
```

✅ **良い例:**
```
Issue #47 depends on #58
Issue #58 blocks #47  ← 明確な方向性
```

### 3. 大規模プロジェクトの構造化

Epic → Story → Task の階層構造を使用：

```markdown
# Epic: SaaS Platform Launch (#56)
Depends on #57 (Infrastructure setup)
Depends on #58 (Bug fixes)
Blocks #59 (Marketing campaign)

## Story: User Authentication (#57)
Depends on #47 (Security audit)
Blocks #56 (Epic)

### Task: Implement OAuth (#60)
Depends on #57 (Story)
```

---

## GitHubとの統合

### Issue Templates

`.github/ISSUE_TEMPLATE/feature.md`:
```markdown
---
name: Feature Request
about: Propose a new feature
---

## Description
<!-- Describe the feature -->

## Dependencies
<!-- Use these keywords: -->
<!-- Depends on #XX -->
<!-- Blocks #YY -->
<!-- Related to #ZZ -->

## Acceptance Criteria
- [ ] ...
```

### Automation

GitHub Actionsで依存関係を自動チェック：

```yaml
name: Check Dependencies

on:
  issues:
    types: [opened, edited]

jobs:
  check-deps:
    runs-on: ubuntu-latest
    steps:
      - name: Parse dependencies
        run: |
          echo "Parsing issue body for dependencies..."
          # 依存関係を抽出してラベル追加
```

---

## トラブルシューティング

### 依存関係が表示されない

**原因1: Issue本文にキーワードがない**
```markdown
❌ "This needs issue 47"  → 検出されない
✅ "Depends on #47"       → 検出される
```

**原因2: Issueが閉じている**
- 閉じたIssueは表示されません
- オープンIssue間の依存関係のみ表示

**原因3: Issue番号が存在しない**
```markdown
❌ "Depends on #999"  → 存在しないIssue
✅ "Depends on #47"   → 既存のIssue
```

### グラフが複雑すぎる

**解決策1: Issueをフィルター**
```
# 特定のラベルのみ表示
GET /api/graph?labels=priority:P1-High
```

**解決策2: 単一Issueのグラフ**
```
GET /api/issues/56/flow
```

**解決策3: 依存関係レベルの制限**
（今後実装予定）

---

## API例

### 依存関係情報の取得

```bash
# 全Issueの依存関係グラフ
curl http://localhost:3001/api/graph

# 特定Issueの依存関係
curl http://localhost:3001/api/issues/56/flow
```

**レスポンス例:**
```json
{
  "nodes": [
    { "id": "issue-47", "type": "issue", "data": {...} },
    { "id": "issue-56", "type": "issue", "data": {...} }
  ],
  "edges": [
    {
      "id": "dep-56-depends-47",
      "source": "issue-47",
      "target": "issue-56",
      "type": "depends-on",
      "label": "depends on",
      "style": {
        "stroke": "#FB923C",
        "strokeWidth": 2,
        "strokeDasharray": "5,5"
      }
    }
  ]
}
```

---

## ロードマップ

### v1.1（計画中）
- [ ] GitHub Projects V2フィールド連携
- [ ] 循環依存の自動検出
- [ ] 依存関係レベルのフィルター

### v1.2（計画中）
- [ ] クリティカルパス分析
- [ ] ガントチャート表示
- [ ] 完了見込み日の自動計算

---

**関連ドキュメント:**
- [Agent Visualization Dashboard](./AGENT_VISUALIZATION_DASHBOARD.md)
- [Label System Guide](./LABEL_SYSTEM_GUIDE.md)
- [WebHook Setup](../packages/dashboard-server/WEBHOOK_SETUP.md)
