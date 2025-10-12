# 実装プランニング - Webhook + Log Server 分散実行アーキテクチャ

**Miyabi - 一般企業向け業務自動化プラットフォーム**

関連Issue: [#70](https://github.com/ShunsukeHayashi/Miyabi/issues/70)

---

## 📋 プランニング概要

このドキュメントは、Webhook + Log Server 分散実行アーキテクチャの実装計画を定義します。

### 実装範囲

**Phase 3**: データフロー・図表作成（4タスク）
**Phase 4**: 技術スタック選定（5タスク）
**Phase 5**: マイルストーン・リソース計画（5タスク）

**合計**: 14タスク

---

## Phase 3: データフロー・図表作成

### 3-1. アーキテクチャ全体図作成

**目的**: 新しい分散実行アーキテクチャの全体像を可視化

**形式**: PlantUML Component Diagram

**含まれる要素**:
```
- Task Frontend層（Email, Slack, Notion, etc.）
- Coordinator層（業務フロー管理）
- Webhook Server層（トンネル）
- Log Server層（監査証跡）
- Agent Pool層（営業/人事/経理/マーケ/サポート/開発）
- 外部システム連携層（Salesforce, freee, etc.）
```

**ファイル**: `docs/diagrams/webhook-logserver-architecture.puml`

**期間**: 2日

---

### 3-2. データフロー図作成

**目的**: タスクのライフサイクル全体のデータフローを可視化

**形式**: Mermaid Flowchart

**フロー**:
```
1. Task作成（Frontend）
2. Coordinatorでタスク分解
3. Webhook Serverにリクエスト送信
4. Agent Poolで実行
5. Log Serverにログ記録
6. Coordinatorが進捗確認（Flash Update）
7. 結果通知（Email/Slack）
```

**ファイル**: `docs/diagrams/data-flow.md` (Mermaid埋め込み)

**期間**: 1日

---

### 3-3. シーケンス図作成

**目的**: 各業務シナリオのシーケンスを詳細化

**形式**: PlantUML Sequence Diagram

**シナリオ**:
1. **営業シナリオ**: 見積書作成 → 契約書生成 → 請求書発行
2. **人事シナリオ**: 履歴書スクリーニング → 面接調整 → 採用通知
3. **経理シナリオ**: 経費精算 → 承認フロー → 支払い処理

**ファイル**:
- `docs/diagrams/sequence-sales.puml`
- `docs/diagrams/sequence-hr.puml`
- `docs/diagrams/sequence-accounting.puml`

**期間**: 3日

---

### 3-4. Entity-Relation拡張

**目的**: 業務Agent用の新しいEntityを追加

**追加Entity**:
```
E13: SalesTask - 営業タスク（見積書、契約書、請求書）
E14: HRTask - 人事タスク（履歴書、面接、採用）
E15: AccountingTask - 経理タスク（経費、承認、支払い）
E16: MarketingTask - マーケティングタスク（コンテンツ、投稿）
E17: SupportTask - サポートタスク（問い合わせ、FAQ）
E18: ApprovalFlow - 承認フロー
E19: Notification - 通知
E20: ExternalSystem - 外部システム連携
```

**ファイル**: `docs/diagrams/entity-relation-model-extended.puml`

**期間**: 2日

---

## Phase 4: 技術スタック選定

### 4-1. Webhook Server技術選定

**候補技術**:

| 技術 | 長所 | 短所 | スコア |
|------|------|------|--------|
| **Express.js** | - エコシステム豊富<br>- 学習コスト低<br>- ミドルウェア充実 | - パフォーマンス中程度<br>- 型安全性弱い | ⭐⭐⭐⭐ |
| **Fastify** | - 高速（2-3倍）<br>- 型安全<br>- スキーマ検証 | - エコシステム小<br>- 学習コスト中 | ⭐⭐⭐⭐⭐ |
| **Hono** | - 超軽量<br>- Edge対応<br>- TypeScript First | - 新しい（安定性？）<br>- エコシステム小 | ⭐⭐⭐ |

**推奨**: **Fastify**
- 理由: パフォーマンスと型安全性のバランスが最適
- 補足: WebSocket対応、スキーマ検証標準装備

**依存パッケージ**:
```json
{
  "fastify": "^4.25.0",
  "fastify-websocket": "^10.0.0",
  "@fastify/cors": "^8.4.0",
  "@fastify/helmet": "^11.1.0"
}
```

**期間**: 1日

---

### 4-2. Log Server技術選定

**候補技術**:

| 技術 | 長所 | 短所 | スコア |
|------|------|------|--------|
| **Redis** | - 超高速（メモリ）<br>- リアルタイム<br>- Pub/Sub対応 | - 永続化弱い<br>- メモリ制約 | ⭐⭐⭐⭐ |
| **PostgreSQL** | - ACID準拠<br>- 監査ログ向き<br>- JSON対応 | - 速度やや遅い<br>- スケーリング複雑 | ⭐⭐⭐⭐⭐ |
| **MongoDB** | - スキーマレス<br>- 水平拡張容易<br>- JSON Native | - ACID弱い<br>- 監査ログ向きでない | ⭐⭐⭐ |

**推奨**: **PostgreSQL + Redis（ハイブリッド）**
- **PostgreSQL**: 永続化ログ、監査証跡（7年保持）
- **Redis**: リアルタイムストリーミング、キャッシュ

**アーキテクチャ**:
```
Webhook Server → Redis (Stream) → Log Viewer (リアルタイム)
                ↓
           PostgreSQL (Persistent Storage)
```

**依存パッケージ**:
```json
{
  "pg": "^8.11.0",
  "ioredis": "^5.3.0",
  "drizzle-orm": "^0.29.0"
}
```

**期間**: 1日

---

### 4-3. 実行環境技術選定

**候補技術**:

| 技術 | 長所 | 短所 | 適用規模 |
|------|------|------|---------|
| **Docker** | - セットアップ簡単<br>- ローカル開発向き<br>- コスト低 | - スケーリング手動<br>- リソース管理弱い | 個人〜小規模 |
| **Kubernetes (K8s)** | - 自動スケーリング<br>- 本番運用向き<br>- エコシステム豊富 | - 学習コスト高<br>- 運用複雑 | 中規模〜大規模 |
| **Serverless (AWS Lambda)** | - 完全マネージド<br>- 従量課金<br>- スケーリング自動 | - Cold Start<br>- 実行時間制限 | 小〜中規模 |

**推奨**: **段階的アプローチ**
- **Phase 1 (MVP)**: Docker Compose（ローカル + 小規模クラウド）
- **Phase 2 (v1.0)**: Kubernetes（中規模展開）
- **Phase 3 (v2.0)**: Hybrid（K8s + Serverless）

**Docker Compose構成** (MVP):
```yaml
services:
  webhook-server:
    build: ./webhook-server
    ports: ["3000:3000"]

  log-server-redis:
    image: redis:7-alpine

  log-server-postgres:
    image: postgres:16-alpine

  agent-worker:
    build: ./agent-worker
    deploy:
      replicas: 3  # 並列実行数
```

**期間**: 2日

---

### 4-4. ダッシュボード技術選定

**候補技術**:

| 技術 | 長所 | 短所 | スコア |
|------|------|------|--------|
| **React + Vite** | - エコシステム最大<br>- 学習コスト低<br>- 柔軟性高 | - バンドルサイズ大<br>- ボイラープレート多 | ⭐⭐⭐⭐ |
| **Next.js** | - SSR/SSG対応<br>- API Routes<br>- SEO最適 | - 重い<br>- Vercel依存傾向 | ⭐⭐⭐⭐ |
| **Svelte** | - 軽量<br>- ランタイムなし<br>- シンプル | - エコシステム小<br>- 求人少ない | ⭐⭐⭐ |

**推奨**: **Next.js 14 (App Router)**
- 理由: SSR + API Routes で統合的に開発可能
- 補足: リアルタイム機能はWebSocket or Server-Sent Events

**技術スタック**:
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "tailwindcss": "^3.4.0",
  "shadcn/ui": "latest",
  "recharts": "^2.10.0",  // グラフ
  "socket.io-client": "^4.6.0"  // リアルタイム
}
```

**主要機能**:
- タスク進捗ダッシュボード
- リアルタイムログビューア
- Agent実行履歴
- 業務効率レポート
- コスト分析

**期間**: 2日

---

### 4-5. 通知システム技術選定

**統合対象**:

| サービス | 用途 | 優先度 |
|---------|------|--------|
| **Email** | - 重要通知<br>- レポート送信 | 🔴 必須 |
| **Slack** | - リアルタイム通知<br>- チーム共有 | 🔴 必須 |
| **LINE** | - 個人通知<br>- モバイル向け | 🟡 推奨 |
| **Discord** | - コミュニティ<br>- ログ共有 | 🟢 オプション |

**推奨ライブラリ**:
```json
{
  "nodemailer": "^6.9.0",  // Email
  "@slack/web-api": "^6.10.0",  // Slack
  "@line/bot-sdk": "^8.3.0",  // LINE
  "discord.js": "^14.14.0"  // Discord
}
```

**通知フロー**:
```
Task完了 → Coordinator判定 → 通知システム → 各チャネル
                             ↓
                      - Email (重要度: High)
                      - Slack (全通知)
                      - LINE (個人向け)
```

**期間**: 1日

---

## Phase 5: マイルストーン・リソース計画

### 5-1. MVP定義

**MVP (Minimum Viable Product) - 最小限の機能セット**

**目標**: 1つの業務領域で完全動作する最小構成

**含まれる機能**:

#### コア機能
- ✅ Webhook Server (Fastify)
- ✅ Log Server (PostgreSQL + Redis)
- ✅ Agent Worker (Docker)
- ✅ 簡易ダッシュボード (Next.js)
- ✅ Email通知

#### 業務Agent（1領域のみ）
- ✅ **営業Agent**: 見積書作成のみ

#### 外部連携（1システムのみ）
- ✅ Google Sheets（見積書データ入力）

**含まれない機能** (v1.0以降):
- ❌ 他の業務Agent（人事/経理/etc.）
- ❌ Kubernetes対応
- ❌ 承認フロー
- ❌ Slack/LINE通知
- ❌ マルチリージョン

**成功基準**:
- 見積書作成が5分以内に自動完了
- ダッシュボードでリアルタイム進捗確認
- ログが正常に記録される

**開発期間**: **4週間**

**リリース**: 2025年11月中旬

---

### 5-2. v1.0マイルストーン策定

**v1.0 - Production Ready**

**目標**: 中小企業（10-50名）で本番運用可能

**追加機能**:

#### 業務Agent拡張
- ✅ 営業Agent（見積書 + 契約書 + 請求書）
- ✅ 人事Agent（履歴書スクリーニング + 面接調整）
- ✅ 経理Agent（経費精算 + 承認フロー）

#### インフラ強化
- ✅ Kubernetes対応
- ✅ 自動スケーリング
- ✅ 監視・アラート（Prometheus + Grafana）

#### 通知強化
- ✅ Slack統合
- ✅ Email テンプレート

#### セキュリティ
- ✅ SOC2準拠
- ✅ 監査ログ（7年保持）
- ✅ RBAC（Role-Based Access Control）

**開発期間**: **3ヶ月（MVP後）**

**リリース**: 2026年2月

---

### 5-3. v2.0ビジョン策定

**v2.0 - Enterprise Scale**

**目標**: エンタープライズ（100名以上）でグローバル展開

**追加機能**:

#### 業務Agent完全版
- ✅ マーケティングAgent
- ✅ カスタマーサポートAgent
- ✅ 開発Agent（既存統合）

#### グローバル対応
- ✅ マルチリージョン（東京/北米/欧州/アジア）
- ✅ 多言語対応（日本語/英語/中国語）
- ✅ タイムゾーン管理

#### 高度な機能
- ✅ カスタムAgent開発SDK
- ✅ Workflow Designer (ノーコード)
- ✅ AI推論強化（GPT-4 Turbo / Claude 3.5 Sonnet）
- ✅ 予測分析・レコメンデーション

#### エンタープライズ機能
- ✅ SSO (SAML/OAuth)
- ✅ オンプレミス対応
- ✅ 専用環境（Private Cloud）
- ✅ SLA保証（99.9%）

**開発期間**: **6ヶ月（v1.0後）**

**リリース**: 2026年8月

---

### 5-4. リソース計画

**MVP (4週間)**

| 役割 | 人数 | 工数 | 備考 |
|------|------|------|------|
| **バックエンド** | 2名 | 160h/人 | Webhook/Log Server |
| **フロントエンド** | 1名 | 160h | ダッシュボード |
| **インフラ** | 0.5名 | 80h | Docker Compose |
| **QA** | 0.5名 | 80h | テスト |
| **合計** | **4名** | **640h** | |

**コスト見積もり** (MVP):
- 人件費: ¥3,200,000（¥5,000/h × 640h）
- インフラ: ¥50,000/月（AWS EC2 + RDS）
- ツール: ¥30,000/月（GitHub, Vercel, etc.）
- **合計**: **¥3,280,000**

---

**v1.0 (3ヶ月)**

| 役割 | 人数 | 工数 | 備考 |
|------|------|------|------|
| **バックエンド** | 3名 | 480h/人 | Agent拡張 |
| **フロントエンド** | 2名 | 480h/人 | Dashboard強化 |
| **インフラ** | 1名 | 480h | K8s構築 |
| **QA** | 1名 | 480h | E2Eテスト |
| **PM** | 1名 | 480h | プロジェクト管理 |
| **合計** | **8名** | **3,840h** | |

**コスト見積もり** (v1.0):
- 人件費: ¥19,200,000（¥5,000/h × 3,840h）
- インフラ: ¥200,000/月 × 3ヶ月（K8s + RDS + Redis）
- ツール: ¥100,000/月 × 3ヶ月
- **合計**: **¥20,100,000**

---

**v2.0 (6ヶ月)**

| 役割 | 人数 | 工数 | 備考 |
|------|------|------|------|
| **バックエンド** | 5名 | 960h/人 | グローバル対応 |
| **フロントエンド** | 3名 | 960h/人 | Workflow Designer |
| **インフラ** | 2名 | 960h/人 | マルチリージョン |
| **QA** | 2名 | 960h/人 | グローバルテスト |
| **PM** | 1名 | 960h | 統括 |
| **セキュリティ** | 1名 | 960h | SOC2監査 |
| **合計** | **14名** | **13,440h** | |

**コスト見積もり** (v2.0):
- 人件費: ¥67,200,000（¥5,000/h × 13,440h）
- インフラ: ¥500,000/月 × 6ヶ月（マルチリージョン）
- ツール: ¥200,000/月 × 6ヶ月
- セキュリティ監査: ¥5,000,000
- **合計**: ¥76,400,000

---

**総コスト**:
- MVP: ¥3,280,000
- v1.0: ¥20,100,000
- v2.0: ¥76,400,000
- **合計**: **¥99,780,000**（約1億円）

---

### 5-5. リスク分析

#### 技術的リスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| **Webhook Server のスケーリング問題** | 🔴 High | 🟡 Medium | - 早期負荷テスト実施<br>- Kubernetes移行前提で設計 |
| **Log Server のデータ肥大化** | 🔴 High | 🔴 High | - ログローテーション自動化<br>- S3アーカイブ導入 |
| **Agent実行の同時実行制御** | 🟡 Medium | 🟡 Medium | - Redis Queue導入<br>- Rate Limiting実装 |
| **外部API障害への対応** | 🟡 Medium | 🔴 High | - Retry機構実装<br>- Circuit Breaker導入 |
| **Cold Start問題（Serverless）** | 🟢 Low | 🟡 Medium | - Warm-up実装<br>- Docker優先 |

---

#### ビジネス的リスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| **市場の受容性不足** | 🔴 High | 🟡 Medium | - MVPで早期検証<br>- ペルソナ別マーケティング |
| **競合の追随** | 🟡 Medium | 🔴 High | - 特許申請検討<br>- スピード重視 |
| **価格設定の失敗** | 🟡 Medium | 🟡 Medium | - 段階的価格調整<br>- ROI計算ツール提供 |
| **エンタープライズ営業の難度** | 🔴 High | 🔴 High | - 中小企業優先<br>- 成功事例蓄積 |
| **セキュリティ事故** | 🔴 High | 🟢 Low | - SOC2準拠<br>- ペネトレーションテスト |

---

#### 組織的リスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| **キーパーソンの離脱** | 🔴 High | 🟡 Medium | - ドキュメント充実<br>- ペアプログラミング |
| **採用難** | 🟡 Medium | 🔴 High | - リモート可<br>- 魅力的な技術スタック |
| **スコープクリープ** | 🟡 Medium | 🔴 High | - MVP厳守<br>- PM強化 |
| **予算超過** | 🟡 Medium | 🟡 Medium | - 週次予算レビュー<br>- Phase分割 |

---

## まとめ

### タイムライン

```
2025年10月: プランニング完了
2025年11月: MVP開発（4週間）
2025年12月: MVPリリース & 検証
2026年1-2月: v1.0開発（3ヶ月）
2026年2月: v1.0リリース
2026年3-8月: v2.0開発（6ヶ月）
2026年8月: v2.0リリース（エンタープライズ対応）
```

### 重要な判断ポイント

#### MVP完了時（2025年12月）
- ✅ 1つの業務で価値実証できたか？
- ✅ 顧客から¥9,800/月払う意思があるか？
- ✅ 技術的に安定しているか？

**判断**: Go/No-Go for v1.0

#### v1.0完了時（2026年2月）
- ✅ 10社以上の有料顧客獲得？
- ✅ MRR ¥500,000以上？
- ✅ チャーンレート 5%以下？

**判断**: Go/No-Go for v2.0

---

## 次のアクション

1. **Phase 3タスク開始**: アーキテクチャ図作成
2. **技術検証**: Fastify + PostgreSQL + Redis のPoC
3. **デザインモック**: ダッシュボードのワイヤーフレーム
4. **営業Agent仕様**: 見積書作成ロジックの詳細化
5. **MVPスプリント計画**: 4週間を4スプリントに分割

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
