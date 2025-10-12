# Miyabi Label System - 完全ガイド

**自律型開発フレームワークの心臓部 - 53ラベル体系の完全理解**

---

## 📖 目次

1. [Label Systemとは](#label-systemとは)
2. [10のカテゴリ概要](#10のカテゴリ概要)
3. [詳細解説](#詳細解説)
4. [実践ガイド](#実践ガイド)
5. [自動化との連携](#自動化との連携)
6. [よくある質問](#よくある質問)

---

## Label Systemとは

### 🎯 基本思想

```
"Everything starts with an Issue. Labels define the state."
```

Miyabiでは、**Labelがオペレーティングシステムの状態管理機構**として機能します。
全ての自動化はLabelを確認してIssue/PRの状態を判断し、適切なアクションを実行します。

### 📊 状態遷移フロー

```
📥 pending → 🔍 analyzing → 🏗️ implementing → 👀 reviewing → ✅ done
```

このフローを中心に、53個のLabelが以下の10カテゴリに分類されています。

---

## 10のカテゴリ概要

| # | カテゴリ | 数 | 役割 | 例 |
|---|---------|---|------|-----|
| 1 | **STATE** | 8 | ライフサイクル管理 | `📥 state:pending`, `✅ state:done` |
| 2 | **AGENT** | 6 | Agent割り当て | `🤖 agent:coordinator`, `🤖 agent:codegen` |
| 3 | **PRIORITY** | 4 | 優先度管理 | `🔥 priority:P0-Critical`, `📝 priority:P3-Low` |
| 4 | **TYPE** | 7 | Issue分類 | `✨ type:feature`, `🐛 type:bug` |
| 5 | **SEVERITY** | 4 | 深刻度・エスカレーション | `🚨 severity:Sev.1-Critical` |
| 6 | **PHASE** | 5 | プロジェクトフェーズ | `🎯 phase:planning`, `🚀 phase:deployment` |
| 7 | **SPECIAL** | 7 | 特殊操作 | `🔐 security`, `💰 cost-watch` |
| 8 | **TRIGGER** | 4 | 自動化トリガー | `🤖 trigger:agent-execute` |
| 9 | **QUALITY** | 4 | 品質スコア | `⭐ quality:excellent`, `🔴 quality:poor` |
| 10 | **COMMUNITY** | 4 | コミュニティ | `👋 good-first-issue`, `🙏 help-wanted` |

**合計: 53ラベル**

---

## 詳細解説

### 1️⃣ STATE Labels (8個) - ライフサイクル管理

Issueの現在の状態を表す**最重要ラベル**。必ず1つ付与される。

#### `📥 state:pending`
- **色**: `#E4E4E4` (グレー)
- **意味**: Issue作成直後、トリアージ待ち
- **誰が付与**: 自動（Issue作成時）
- **次の状態**: `🔍 state:analyzing`
- **アクション**: CoordinatorAgentがトリアージ開始

#### `🔍 state:analyzing`
- **色**: `#0E8A16` (グリーン)
- **意味**: CoordinatorAgentが依存関係・複雑度を分析中
- **誰が付与**: CoordinatorAgent
- **次の状態**: `🏗️ state:implementing`
- **アクション**: DAG分解、Specialist Agent割り当て

#### `🏗️ state:implementing`
- **色**: `#1D76DB` (ブルー)
- **意味**: Specialist Agentが実装作業中
- **誰が付与**: CodeGenAgent / PRAgent
- **次の状態**: `👀 state:reviewing`
- **アクション**: コード生成、PR作成

#### `👀 state:reviewing`
- **色**: `#FBCA04` (イエロー)
- **意味**: ReviewAgentが品質チェック中
- **誰が付与**: ReviewAgent
- **次の状態**: `✅ state:done` または `🏗️ state:implementing` (再実装)
- **アクション**: 静的解析、セキュリティスキャン、品質スコアリング

#### `✅ state:done`
- **色**: `#2EA44F` (グリーン)
- **意味**: 完了、PRマージ済み
- **誰が付与**: 自動（PR merge時）
- **アクション**: Issueクローズ、メトリクス更新

#### `🔴 state:blocked`
- **色**: `#D73A4A` (レッド)
- **意味**: ブロック中 - Guardian介入が必要
- **誰が付与**: Agent（エラー検出時）
- **次の状態**: `🔍 state:analyzing` (Guardian解決後)
- **アクション**: Guardian通知、Slack/Discord通知

#### `🛑 state:failed`
- **色**: `#B60205` (ダークレッド)
- **意味**: 実行失敗 - エラー発生
- **誰が付与**: Agent（致命的エラー時）
- **アクション**: エラーログ記録、Guardian通知

#### `⏸️ state:paused`
- **色**: `#D4C5F9` (パープル)
- **意味**: 一時停止 - 依存関係または承認待ち
- **誰が付与**: Guardian または Agent
- **アクション**: 定期チェック、依存解決待ち

---

### 2️⃣ AGENT Labels (6個) - Agent割り当て

どのAgentが担当するかを示す。

#### `🤖 agent:coordinator`
- **担当Agent**: CoordinatorAgent
- **役割**: タスク統括、DAG分解、並列実行制御
- **いつ付与**: Issue作成直後（`state:pending` → `state:analyzing`）
- **作業内容**:
  - Issue本文からタスク抽出
  - 依存関係分析（DAG構築）
  - 複雑度推定（小/中/大/特大）
  - Specialist Agent割り当て

#### `🤖 agent:codegen`
- **担当Agent**: CodeGenAgent
- **役割**: AI駆動コード生成（Claude Sonnet 4使用）
- **いつ付与**: CoordinatorAgentがコード実装タスクと判断
- **作業内容**:
  - TypeScript/JavaScript/Python/Goコード生成
  - Strict mode完全対応
  - テストコード生成

#### `🤖 agent:review`
- **担当Agent**: ReviewAgent
- **役割**: コード品質判定
- **いつ付与**: PR作成後（`state:implementing` → `state:reviewing`）
- **作業内容**:
  - 静的解析（ESLint, TypeScript compiler）
  - セキュリティスキャン（npm audit, Snyk）
  - 品質スコアリング（100点満点、80点以上で合格）

#### `🤖 agent:issue`
- **担当Agent**: IssueAgent
- **役割**: Issue分析・ラベル管理
- **いつ付与**: Issue作成時（自動トリアージ）
- **作業内容**:
  - type/priority/severity自動推定
  - good-first-issue判定
  - 関連Issue検索

#### `🤖 agent:pr`
- **担当Agent**: PRAgent
- **役割**: Pull Request自動作成
- **いつ付与**: コード実装完了後
- **作業内容**:
  - Conventional Commits準拠のPRタイトル生成
  - PR本文自動生成（変更内容サマリ）
  - Draft PR作成

#### `🤖 agent:deployment`
- **担当Agent**: DeploymentAgent
- **役割**: CI/CDデプロイ自動化
- **いつ付与**: PRマージ後
- **作業内容**:
  - Firebase/Cloud自動デプロイ
  - ヘルスチェック
  - 自動Rollback（失敗時）

---

### 3️⃣ PRIORITY Labels (4個) - 優先度管理

タスクの重要度・緊急度を4段階で表現。

#### `🔥 priority:P0-Critical`
- **色**: `#B60205` (ダークレッド)
- **意味**: 最優先 - セキュリティ、本番障害、データ損失
- **SLA**: 24時間以内に着手
- **例**:
  - 本番環境でのデータベース障害
  - ゼロデイ脆弱性発見
  - ユーザーデータ流出

#### `⚠️ priority:P1-High`
- **色**: `#D93F0B` (オレンジ)
- **意味**: 高優先度 - 主要機能、重大なバグ
- **SLA**: 3日以内に着手
- **例**:
  - ログイン機能の障害
  - 決済システムのバグ
  - パフォーマンス劣化（50%以上）

#### `📊 priority:P2-Medium`
- **色**: `#FBCA04` (イエロー)
- **意味**: 中優先度 - 標準機能、通常バグ
- **SLA**: 1週間以内に着手
- **例**:
  - 新機能追加
  - UI改善
  - 小規模バグ修正

#### `📝 priority:P3-Low`
- **色**: `#0E8A16` (グリーン)
- **意味**: 低優先度 - Nice-to-have、軽微な改善
- **SLA**: 特になし（余力があれば対応）
- **例**:
  - ドキュメント誤字修正
  - コメント追加
  - リファクタリング提案

---

### 4️⃣ TYPE Labels (7個) - Issue分類

Issueの性質を分類。

#### `✨ type:feature`
- **意味**: 新機能追加・機能拡張
- **例**: ダークモード追加、検索機能実装

#### `🐛 type:bug`
- **意味**: バグ修正
- **例**: クラッシュ修正、計算ミス修正

#### `📚 type:docs`
- **意味**: ドキュメント改善
- **例**: README更新、API仕様書作成

#### `🔧 type:refactor`
- **意味**: コードリファクタリング（機能変更なし）
- **例**: 関数分割、変数名変更

#### `🧪 type:test`
- **意味**: テスト追加・改善
- **例**: ユニットテスト追加、E2Eテスト改善

#### `🏗️ type:architecture`
- **意味**: アーキテクチャ設計・システムレベル変更
- **例**: マイクロサービス化、DB移行

#### `🚀 type:deployment`
- **意味**: デプロイ・インフラ
- **例**: CI/CD改善、Docker設定

---

### 5️⃣ SEVERITY Labels (4個) - 深刻度・エスカレーション

問題の深刻度を表現。Guardian/TechLead/CISOへのエスカレーション判断に使用。

#### `🚨 severity:Sev.1-Critical`
- **意味**: 緊急 - Guardian即座に介入
- **エスカレーション**: Guardian + CISO + TechLead
- **例**: セキュリティ侵害、本番全停止

#### `⚠️ severity:Sev.2-High`
- **意味**: 高深刻度 - TechLead/CISO推奨
- **エスカレーション**: TechLead or CISO
- **例**: 主要機能停止、パフォーマンス劣化

#### `📊 severity:Sev.3-Medium`
- **意味**: 中深刻度 - 注意深く監視
- **エスカレーション**: なし（自動処理）
- **例**: 一部機能の不具合

#### `📝 severity:Sev.4-Low`
- **意味**: 低深刻度 - 通常処理
- **エスカレーション**: なし
- **例**: 軽微なUI不具合

---

### 6️⃣ PHASE Labels (5個) - プロジェクトフェーズ

プロジェクト管理のフェーズを表現。

#### `🎯 phase:planning`
- **意味**: 計画フェーズ
- **作業内容**: 要件定義、設計、見積もり

#### `🏗️ phase:implementation`
- **意味**: 実装フェーズ
- **作業内容**: コーディング、PR作成

#### `🧪 phase:testing`
- **意味**: テストフェーズ
- **作業内容**: ユニットテスト、E2Eテスト、QA

#### `🚀 phase:deployment`
- **意味**: デプロイフェーズ
- **作業内容**: staging → production デプロイ

#### `📊 phase:monitoring`
- **意味**: 監視フェーズ
- **作業内容**: パフォーマンス監視、エラー監視

---

### 7️⃣ SPECIAL Labels (7個) - 特殊操作

特別な処理が必要なIssueに付与。

#### `🔐 security`
- **意味**: セキュリティ関連 - CISO即座にエスカレーション
- **処理**: 非公開Issue推奨、セキュリティチーム通知

#### `💰 cost-watch`
- **意味**: 高コスト操作 - 予算監視
- **処理**: Claude API使用量監視、コスト上限チェック

#### `🔄 dependencies`
- **意味**: 依存関係あり - 先に解決必要
- **処理**: 依存Issueが`state:done`になるまで`state:paused`

#### `🎓 learning`
- **意味**: 学習タスク - 時間がかかる可能性
- **処理**: SLA緩和、進捗レポート頻度低下

#### `🔬 experiment`
- **意味**: 実験的 - 失敗の可能性あり
- **処理**: 失敗許容、Guardian事前承認

#### `🚫 wontfix`
- **意味**: 修正しない - クローズ
- **処理**: Issueクローズ、理由コメント

#### `🔁 duplicate`
- **意味**: 重複Issue
- **処理**: 元Issueへリンク、クローズ

---

### 8️⃣ TRIGGER Labels (4個) - 自動化トリガー

これらのLabelを付与すると、即座にGitHub Actionsがトリガーされる。

#### `🤖 trigger:agent-execute`
- **トリガー内容**: Autonomous Agentの実行
- **ワークフロー**: `.github/workflows/autonomous-agent.yml`
- **処理**: CoordinatorAgentがIssueを取得し、全自動処理開始

#### `📊 trigger:generate-report`
- **トリガー内容**: 週次レポート生成
- **ワークフロー**: `.github/workflows/weekly-kpi-report.yml`
- **処理**: KPIダッシュボード更新、PDFレポート生成

#### `🚀 trigger:deploy-staging`
- **トリガー内容**: stagingへデプロイ
- **ワークフロー**: `.github/workflows/deploy-pages.yml`
- **処理**: Firebase staging環境へデプロイ

#### `🚀 trigger:deploy-production`
- **トリガー内容**: productionへデプロイ（Guardian承認必須）
- **ワークフロー**: `.github/workflows/deploy-pages.yml`
- **処理**: Firebase production環境へデプロイ

---

### 9️⃣ QUALITY Labels (4個) - 品質スコア

ReviewAgentが自動付与する品質評価。

#### `⭐ quality:excellent`
- **スコア**: 90-100点
- **基準**: カバレッジ90%+、セキュリティ問題なし、Lintエラーゼロ

#### `✅ quality:good`
- **スコア**: 80-89点
- **基準**: カバレッジ80%+、セキュリティ問題なし、Lint警告のみ

#### `⚠️ quality:needs-improvement`
- **スコア**: 60-79点
- **基準**: カバレッジ不足、セキュリティ警告あり
- **処理**: CodeGenAgentが改善提案

#### `🔴 quality:poor`
- **スコア**: 0-59点
- **基準**: カバレッジ不足、セキュリティ脆弱性あり
- **処理**: PR reject、再実装要求

---

### 🔟 COMMUNITY Labels (4個) - コミュニティ

外部コントリビューター向けラベル。

#### `👋 good-first-issue`
- **意味**: 初心者向けタスク
- **基準**:
  - 実装時間 < 2時間
  - 依存関係なし
  - 明確な要件

#### `🙏 help-wanted`
- **意味**: コミュニティの助けが必要
- **例**: レビュー依頼、テスト協力

#### `❓ question`
- **意味**: 質問・相談
- **処理**: Discussion推奨

#### `💬 discussion`
- **意味**: オープンディスカッション
- **処理**: GitHub Discussions推奨

---

## 実践ガイド

### 🎯 Issue作成時のLabel付与フロー

#### **ケース1: 新機能追加のIssue**

```yaml
タイトル: ダークモード機能の追加
Labels:
  - 📥 state:pending       # 自動付与
  - ✨ type:feature        # 手動付与
  - ⚠️ priority:P1-High   # 手動付与
  - 🎯 phase:planning     # 手動付与
```

**自動化の流れ**:
1. Issue作成 → `state:pending` 自動付与
2. CoordinatorAgent起動 → `agent:coordinator` 付与、`state:analyzing` へ変更
3. 分析完了 → `agent:codegen` 付与、`state:implementing` へ変更
4. PR作成 → `agent:review` 付与、`state:reviewing` へ変更
5. 品質OK → `quality:excellent` 付与、`state:done` へ変更
6. Issueクローズ

#### **ケース2: セキュリティバグのIssue**

```yaml
タイトル: XSS脆弱性の修正
Labels:
  - 📥 state:pending                # 自動付与
  - 🐛 type:bug                     # 手動付与
  - 🔥 priority:P0-Critical         # 手動付与
  - 🚨 severity:Sev.1-Critical      # 手動付与
  - 🔐 security                     # 手動付与
  - 🤖 trigger:agent-execute       # 手動付与（即座に実行開始）
```

**自動化の流れ**:
1. `trigger:agent-execute` 検出 → Autonomous Agent即座に起動
2. `security` 検出 → CISO通知、非公開Issue化
3. `priority:P0-Critical` 検出 → 他タスク中断、最優先処理
4. 24時間以内に修正完了

#### **ケース3: コミュニティからのPR**

```yaml
タイトル: README typo fix
Labels:
  - 📥 state:pending         # 自動付与
  - 📚 type:docs             # 手動付与
  - 📝 priority:P3-Low       # 手動付与
  - 👋 good-first-issue      # 手動付与（初回コントリビューター）
```

---

### 🔄 状態遷移の具体例

#### **正常フロー**

```
📥 state:pending
  ↓ CoordinatorAgent起動
🔍 state:analyzing + 🤖 agent:coordinator
  ↓ 依存関係分析完了
🏗️ state:implementing + 🤖 agent:codegen
  ↓ PR作成
👀 state:reviewing + 🤖 agent:review
  ↓ 品質スコア85点
✅ state:done + ✅ quality:good
```

#### **エラーフロー**

```
📥 state:pending
  ↓
🔍 state:analyzing
  ↓
🏗️ state:implementing
  ↓ テスト失敗（カバレッジ40%）
🔴 state:blocked + 🔴 quality:poor
  ↓ Guardian介入、改善指示
🔍 state:analyzing（再分析）
  ↓
🏗️ state:implementing（再実装）
  ↓
👀 state:reviewing
  ↓ カバレッジ85%
✅ state:done + ✅ quality:good
```

---

## 自動化との連携

### GitHub Actions トリガー設定

```yaml
# .github/workflows/autonomous-agent.yml
name: Autonomous Agent Execution

on:
  issues:
    types: [labeled]

jobs:
  execute:
    if: contains(github.event.label.name, 'trigger:agent-execute')
    runs-on: ubuntu-latest
    steps:
      - name: CoordinatorAgent起動
        run: |
          npm run agents:parallel:exec -- \
            --issue=${{ github.event.issue.number }} \
            --concurrency=3
```

### Label同期

```yaml
# .github/workflows/label-sync.yml
name: Label Sync

on:
  push:
    paths:
      - '.github/labels.yml'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: micnncim/action-label-syncer@v1
        with:
          manifest: .github/labels.yml
          token: ${{ secrets.GITHUB_TOKEN }}
```

---

## よくある質問

### Q1: Issueに付与すべきLabelの最小セットは？

**A**: 以下の3つは必須です：

1. **STATE** (1つ): 現在の状態（自動付与されるので手動不要）
2. **TYPE** (1つ): `type:feature`, `type:bug` など
3. **PRIORITY** (1つ): `priority:P0-Critical` など

**推奨**: さらに以下を追加
- **AGENT** (1つ以上): どのAgentが担当するか明示
- **PHASE** (1つ): プロジェクト管理用

### Q2: `priority` と `severity` の違いは？

**A**:
- **priority**: タスクの重要度・緊急度（ビジネス視点）
- **severity**: 問題の深刻度（技術視点）

**例**:
- `priority:P1-High` + `severity:Sev.3-Medium`
  → ビジネス的には重要だが、技術的影響は中程度
  → 例: 新機能追加（売上向上）

- `priority:P2-Medium` + `severity:Sev.1-Critical`
  → ビジネス的影響は中程度だが、技術的に緊急
  → 例: staging環境障害（本番に影響なし）

### Q3: `state:blocked` と `state:failed` の違いは？

**A**:
- **state:blocked**: 外部要因でブロック（依存Issue未完了、Guardian承認待ち）
  → 解決可能、再開可能

- **state:failed**: エラーで失敗（コンパイルエラー、テスト失敗）
  → 修正が必要、再実装

### Q4: `quality` Labelは手動で付与できる？

**A**: **いいえ、ReviewAgentのみ付与可能**です。

品質スコアは以下の要素から自動計算されます：
- テストカバレッジ (40%)
- Lintエラー/警告 (20%)
- セキュリティ脆弱性 (30%)
- コード複雑度 (10%)

### Q5: 複数の`type`を付与できる？

**A**: **基本的に1つのみ推奨**ですが、複数付与も可能です。

**例**: `type:feature` + `type:refactor`
→ 新機能追加しつつリファクタリングも実施

ただし、**主要な`type`を1つ明確にする**ことを推奨します。

### Q6: `trigger:agent-execute` を付与すると即座に実行される？

**A**: **はい、1分以内にGitHub Actionsが起動します**。

注意点:
- **Guardian承認なしで実行開始**
- **Claude APIコストが発生**
- **`cost-watch` Labelと併用推奨**

テスト用には `trigger:agent-execute` の代わりに手動実行を推奨：

```bash
npm run agents:parallel:exec -- --issue=123 --dry-run
```

### Q7: Labelが多すぎて覚えられない

**A**: **IssueAgentが自動推定します**ので、手動で全て付与する必要はありません。

最低限、以下だけ手動で付与してください：
1. `type:*` (feature/bug/docs)
2. `priority:*` (P0/P1/P2/P3)

その後、`trigger:agent-execute` を付与すれば、IssueAgentが以下を自動推定：
- `severity:*`
- `phase:*`
- `good-first-issue` (該当する場合)

---

## 📚 関連ドキュメント

- [AGENT_OPERATIONS_MANUAL.md](./AGENT_OPERATIONS_MANUAL.md) - Agent運用マニュアル
- [GITHUB_OS_INTEGRATION.md](./GITHUB_OS_INTEGRATION.md) - GitHub OS統合ガイド
- [.github/labels.yml](../.github/labels.yml) - Label定義ファイル（YAML）

---

## 🎯 まとめ

### 覚えておくべき5つのポイント

1. **STATE Labels が最重要** - 全自動化の起点
2. **TRIGGER Labels で即座に実行** - `trigger:agent-execute`
3. **PRIORITY と SEVERITY は別物** - ビジネス視点 vs 技術視点
4. **QUALITY Labels は自動付与** - ReviewAgentのみ
5. **最小3ラベルでOK** - STATE, TYPE, PRIORITY

### 初心者向けクイックガイド

**新しいIssueを作成したら：**

1. **手動で付与**:
   - `✨ type:feature` または `🐛 type:bug`
   - `⚠️ priority:P1-High` など

2. **自動化開始**:
   - `🤖 trigger:agent-execute` を付与

3. **あとは待つだけ！**
   - CoordinatorAgent → CodeGenAgent → ReviewAgent → PR作成 → マージ
   - 全て自動実行されます 🎉

---

**Miyabi Label System** - Beauty in Autonomous Development 🌸

