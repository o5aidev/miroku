# Miyabi 販売戦略 2025

**作成日**: 2025-10-11
**Version**: 1.0.0
**ステータス**: Draft

---

## 📊 エグゼクティブサマリー

Miyabiは、AI-native開発ツールとして**オープンコア（Open Core）モデル**で収益化を目指します。

**3つの収益柱:**
1. 💎 **Miyabi Pro** - プロフェッショナル向けSaaS（$49/月）
2. 🏢 **Miyabi Enterprise** - エンタープライズ向けオンプレミス（$499/月～）
3. 🎓 **トレーニング & コンサルティング** - 導入支援・トレーニング（$5,000～）

**市場機会:**
- **TAM (Total Addressable Market)**: $12B - AI開発ツール市場全体
- **SAM (Serviceable Available Market)**: $1.2B - GitHub Enterprise顧客
- **SOM (Serviceable Obtainable Market)**: $30M - 初年度目標市場

**目標:**
- **Year 1**: $500K ARR (Annual Recurring Revenue)
- **Year 2**: $3M ARR
- **Year 3**: $10M ARR

---

## 🎯 製品戦略: 3層モデル

### 1️⃣ Miyabi Community (無料・オープンソース)

**ターゲット**: 個人開発者、スタートアップ、オープンソースプロジェクト

**提供内容:**
- ✅ 基本CLI機能（`miyabi init`, `miyabi install`, `miyabi status`）
- ✅ 53ラベル体系
- ✅ 12+ GitHub Actions ワークフロー
- ✅ 6 AI Agents（基本機能）
- ✅ Claude Code統合
- ✅ コミュニティサポート（GitHub Issues）
- ✅ MIT License

**価格**: $0/月

**収益化**: 無料版から有料版へのアップグレード導線

---

### 2️⃣ Miyabi Pro (プロフェッショナル)

**ターゲット**: フリーランス、小規模チーム（1-10人）、プロフェッショナル開発者

**提供内容（Community + 以下）:**
- ✨ **プライベートリポジトリ無制限**
- ✨ **高度なAgent機能**:
  - CodeGenAgent: GPT-4/Claude Opus統合
  - ReviewAgent: AI品質スコアリング（詳細レポート）
  - DeploymentAgent: マルチクラウド対応（AWS, GCP, Azure）
- ✨ **ダッシュボード & アナリティクス**:
  - リアルタイムAgent稼働状況
  - コスト分析ダッシュボード
  - チーム生産性メトリクス
- ✨ **Webhook統合**:
  - Slack/Discord通知
  - カスタムWebhook
- ✨ **プライオリティサポート**:
  - メールサポート（24時間以内返信）
  - 専用Discordチャンネル
- ✨ **セキュリティ機能**:
  - SOC 2 Type II準拠
  - シングルサインオン（SSO）
  - 監査ログ

**価格**: **$49/月** または **$490/年**（2ヶ月分お得）

**販売チャネル**:
- ウェブサイト直販
- NPMパッケージからのアップグレード導線
- 7日間無料トライアル

---

### 3️⃣ Miyabi Enterprise (エンタープライズ)

**ターゲット**: 大企業、政府機関、金融機関（50人以上のチーム）

**提供内容（Pro + 以下）:**
- 🏢 **オンプレミス/プライベートクラウド対応**
- 🏢 **カスタムAgent開発**:
  - 企業独自のワークフロー組み込み
  - レガシーシステム統合
- 🏢 **エンタープライズ機能**:
  - LDAP/Active Directory統合
  - RBAC（Role-Based Access Control）
  - IPホワイトリスト
  - 専用インスタンス
- 🏢 **SLA (Service Level Agreement)**:
  - 99.9% Uptime保証
  - 1時間以内の初動対応
  - 専任カスタマーサクセスマネージャー
- 🏢 **コンプライアンス**:
  - GDPR対応
  - HIPAA対応（ヘルスケア）
  - FedRAMP対応（政府機関）
- 🏢 **トレーニング & オンボーディング**:
  - 専任コンサルタント
  - チームトレーニング（オンサイト/リモート）
  - カスタマイズサポート

**価格**: **要問い合わせ**
- 標準プラン: $499/月（10席）+ $49/席/月（追加席）
- カスタムプラン: $5,000/月～（無制限席、SLA付き）

**販売チャネル**:
- 直販（Sales team）
- パートナーチャネル（SI, コンサルティング会社）

---

## 💰 価格戦略

### 競合比較

| 製品 | 対象 | 価格 | 特徴 |
|------|------|------|------|
| **GitHub Copilot** | 個人 | $10/月 | コード補完のみ |
| **Cursor** | 個人 | $20/月 | AIエディタ |
| **Devin** | チーム | $500/月 | 自律型AI開発者 |
| **Replit Agent** | 個人 | $20/月 | AI開発環境 |
| **Miyabi Community** | 個人 | **無料** | フル機能（制限あり） |
| **Miyabi Pro** | プロ | **$49/月** | 高度なAgent機能 |
| **Miyabi Enterprise** | 企業 | **$499/月～** | エンタープライズ機能 |

### 価格戦略のポイント

1. **フリーミアム戦略**: 無料版で市場シェアを獲得、有料版へ誘導
2. **競合対比**: GitHub Copilot（$10）とDevin（$500）の中間を狙う
3. **年間プラン割引**: 年払いで2ヶ月分無料（顧客ロックイン）
4. **スタートアップ優遇**: YC/500 Startups等の卒業生向け50% OFF（最初の1年）
5. **エデュケーション**: 学生・教育機関向け無料または大幅割引

---

## 🚀 Go-to-Market (GTM) 戦略

### Phase 1: プロダクト・マーケット・フィット検証（0-6ヶ月）

**目標**: 100人の有料ユーザー獲得

**戦術**:
1. **製品ハント（Product Hunt）ローンチ**
   - トップ5入りを目指す
   - バイラル動画作成（90秒デモ）
   - インフルエンサー事前レビュー

2. **コミュニティ構築**
   - GitHub Sponsors開始
   - Discord/Slackコミュニティ立ち上げ
   - 週次オフィスアワー（Zoom）

3. **コンテンツマーケティング**
   - ブログ投稿（週2回）:
     - 「Claude Codeで生産性10倍」
     - 「GitHub OSアーキテクチャ完全ガイド」
   - YouTube チュートリアル（月4本）
   - Podcast出演（AI/DevOps系）

4. **インフルエンサーマーケティング**
   - Theo (t3.gg), Fireship, etc.
   - レビュー依頼（無料Pro版提供）

**KPI**:
- GitHub Stars: 5,000+
- npm downloads: 50,000/月
- Discord members: 1,000+
- 有料ユーザー: 100人

---

### Phase 2: 成長加速（6-12ヶ月）

**目標**: $500K ARR達成

**戦術**:
1. **パートナープログラム**
   - SIパートナー募集（30%コミッション）
   - 認定パートナー制度開始

2. **エンタープライズセールス**
   - Sales team採用（2名）
   - Fortune 500企業へのアウトバウンド
   - ウェビナー開催（月2回）

3. **カンファレンス登壇**
   - AWS re:Invent
   - GitHub Universe
   - DevOps Days Tokyo

4. **ケーススタディ公開**
   - 導入企業3社のケーススタディ
   - ROI計算ツール公開

**KPI**:
- 有料ユーザー: 500人
- Enterprise顧客: 5社
- ARR: $500K

---

### Phase 3: スケール（Year 2-3）

**目標**: $10M ARR達成

**戦術**:
1. **グローバル展開**
   - 英語圏市場進出（米国、英国）
   - 多言語対応（中国語、韓国語）

2. **チャネル拡大**
   - AWS Marketplace出品
   - GitHub Marketplace出品
   - Atlassian Marketplace出品

3. **M&A/投資調達**
   - Series A調達（$5M）
   - 競合買収検討

**KPI**:
- 有料ユーザー: 5,000人
- Enterprise顧客: 50社
- ARR: $10M

---

## 📈 収益予測

### Year 1 (2025)

| 月 | Community | Pro | Enterprise | 月次収益 | 累計ARR |
|----|-----------|-----|------------|----------|---------|
| Jan | 100 | 10 | 0 | $490 | $5.9K |
| Feb | 250 | 25 | 0 | $1,225 | $14.7K |
| Mar | 500 | 50 | 1 | $2,949 | $35.4K |
| Jun | 2,000 | 150 | 3 | $8,847 | $106.2K |
| Dec | 10,000 | 500 | 10 | $29,490 | **$353.9K** |

**Year 1 合計**: $353.9K ARR（目標$500K未達だが、成長トレンド確立）

### Year 2 (2026)

| 指標 | Q1 | Q2 | Q3 | Q4 | 合計 |
|------|----|----|----|----|------|
| Pro Users | 750 | 1,000 | 1,500 | 2,000 | 2,000 |
| Enterprise | 15 | 20 | 30 | 40 | 40 |
| **ARR** | $1.07M | $1.47M | $2.23M | **$2.96M** | $2.96M |

**Year 2 合計**: $2.96M ARR

### Year 3 (2027)

- Pro Users: 5,000人
- Enterprise: 100社
- **ARR**: **$10.45M**

---

## 🎯 ターゲット顧客

### ペルソナ 1: ソロ開発者「山田太郎」

**属性**:
- 年齢: 28歳
- 職業: フリーランスフルスタック開発者
- 年収: $60K
- 使用ツール: VS Code, GitHub, Claude Code

**ペインポイント**:
- プロジェクトセットアップに毎回2-3時間かかる
- CI/CD設定がわからない
- ラベル管理が煩雑

**Miyabiで解決**:
- `npx miyabi init` で2分でセットアップ完了
- 12+ワークフロー自動デプロイ
- 53ラベルで状態管理自動化

**支払い意思**: $49/月（Pro版）

---

### ペルソナ 2: スタートアップCTO「佐藤花子」

**属性**:
- 年齢: 35歳
- 職業: スタートアップCTO（チーム5人）
- 予算: $10K/月（開発ツール全体）
- 使用ツール: GitHub Enterprise, Vercel, AWS

**ペインポイント**:
- チーム全員のオンボーディングに1週間かかる
- コードレビューが遅い（ボトルネック）
- デプロイミスで障害多発

**Miyabiで解決**:
- 新メンバーオンボーディング: 30分
- ReviewAgent自動レビュー（80点未満は自動却下）
- DeploymentAgent自動ロールバック

**支払い意思**: $245/月（Pro版 x 5席）

---

### ペルソナ 3: エンタープライズ開発マネージャー「鈴木一郎」

**属性**:
- 年齢: 45歳
- 職業: Fortune 500企業 開発部長（チーム100人）
- 予算: $500K/年（開発ツール全体）
- 使用ツール: GitHub Enterprise, Jenkins, Jira

**ペインポイント**:
- レガシーシステムとの統合が困難
- セキュリティ・コンプライアンス要件が厳しい
- チーム間のワークフローが統一されていない

**Miyabiで解決**:
- オンプレミス対応（データは自社内）
- SOC 2 / HIPAA対応
- 企業独自ワークフロー統合

**支払い意思**: $10K/月（Enterprise版 100席）

---

## 🔧 販売チャネル戦略

### 1. ダイレクトセールス（Direct Sales）

**対象**: Community → Pro、Pro → Enterprise

**戦術**:
- **プロダクト内アップグレード導線**:
  - CLI実行時に「Pro版で○○が使えます」メッセージ
  - `miyabi upgrade --show-benefits` コマンド
- **メールキャンペーン**:
  - 無料ユーザーへの定期メール（週1回）
  - Pro版の価値提案（ケーススタディ付き）
- **リターゲティング広告**:
  - GitHub訪問者へのリターゲティング
  - NPMダウンロード者へのリターゲティング

**KPI**: Conversion Rate 5%（無料→有料）

---

### 2. パートナーチャネル（Channel Partners）

**対象**: Enterprise顧客

**パートナー種別**:
1. **SI（System Integrator）**:
   - アクセンチュア、NTTデータ、富士通
   - コミッション: 30%
2. **クラウドベンダー**:
   - AWS、GCP、Azure Marketplace出品
   - コミッション: 20%
3. **コンサルティング**:
   - マッキンゼー、BCG（デジタル部門）
   - 紹介料: 20%

**パートナープログラム**:
- 認定トレーニング（2日間）
- 専用ポータル（Lead管理）
- Co-marketingファンド（50% cost share）

**KPI**: Partner Revenue 30%（Year 2）

---

### 3. マーケットプレイス（Marketplace）

**対象**: 既存エコシステムユーザー

**出品先**:
1. **GitHub Marketplace**
   - 2億人のGitHubユーザーにリーチ
   - GitHub Actionsとの統合を強調
2. **AWS Marketplace**
   - 企業顧客にリーチ
   - AWS予算から直接支払い可能
3. **Atlassian Marketplace**
   - Jira連携機能を追加
   - 既存Atlassianユーザーを獲得

**KPI**: Marketplace経由売上 15%（Year 2）

---

## 📣 マーケティング戦略

### 1. コンテンツマーケティング

**ブログ（週2回更新）**:
- SEOキーワード: "AI autonomous development", "GitHub automation", "Claude Code integration"
- 事例: 「スタートアップが開発速度3倍に」
- チュートリアル: 「5分でCI/CD環境構築」

**YouTube（月4本）**:
- デモ動画（90秒）
- ディープダイブ（15分）
- ライブコーディング（60分）

**KPI**: オーガニック流入 10,000/月（Year 1）

---

### 2. コミュニティマーケティング

**Discord/Slackコミュニティ**:
- 週次オフィスアワー
- ユーザー主導のプラグイン開発
- バグバウンティプログラム

**GitHub Sponsors**:
- 個人スポンサー: $5-$100/月
- 企業スポンサー: $1,000/月

**KPI**: コミュニティメンバー 5,000人（Year 1）

---

### 3. イベントマーケティング

**登壇機会**:
- GitHub Universe（米国）
- AWS re:Invent（米国）
- DevOps Days Tokyo（日本）
- PyCon JP（日本）

**自社イベント**:
- Miyabi Summit（年1回）
- オンラインウェビナー（月2回）

**KPI**: イベント経由Lead 500件/年

---

## 🤝 パートナーシップ戦略

### 戦略的パートナー候補

1. **Anthropic（Claude提供元）**
   - 公式パートナーシップ締結
   - Claude Code Verified Partner認定
   - Co-marketingキャンペーン

2. **GitHub**
   - GitHub Stars認定
   - GitHub Marketplace featured
   - GitHubブログで紹介

3. **Vercel/Netlify/Railway**
   - デプロイ統合
   - 相互紹介プログラム

4. **教育機関**
   - 大学・専門学校への無償提供
   - カリキュラム組み込み
   - インターン採用パイプライン

---

## 📊 成功指標（KPI）

### Year 1

| 指標 | 目標 | 測定頻度 |
|------|------|----------|
| GitHub Stars | 5,000+ | 週次 |
| npm downloads | 50,000/月 | 週次 |
| 有料ユーザー | 100人 | 月次 |
| ARR | $500K | 月次 |
| Churn Rate | <5% | 月次 |
| NPS (Net Promoter Score) | 50+ | 四半期 |

### Year 2

| 指標 | 目標 |
|------|------|
| 有料ユーザー | 2,000人 |
| Enterprise顧客 | 40社 |
| ARR | $3M |
| Churn Rate | <3% |
| NPS | 60+ |

### Year 3

| 指標 | 目標 |
|------|------|
| 有料ユーザー | 5,000人 |
| Enterprise顧客 | 100社 |
| ARR | $10M |
| Gross Margin | 80%+ |
| LTV/CAC | 5.0+ |

---

## 💡 リスクと対策

### リスク 1: 競合の台頭

**リスク**: GitHub Copilot、Cursorなどの大手が類似機能をリリース

**対策**:
- 差別化: Agent Systemの完成度を高める
- スピード: 毎月新機能リリース
- コミュニティ: オープンソースによるロックイン回避

---

### リスク 2: AI APIコスト高騰

**リスク**: Claude API料金が上昇し、利益率悪化

**対策**:
- Cost-per-request上限設定
- 自社LLMファインチューニング検討
- 複数LLMプロバイダー対応（OpenAI, Gemini）

---

### リスク 3: セキュリティインシデント

**リスク**: データ漏洩でブランド毀損

**対策**:
- SOC 2 Type II認証取得
- ペネトレーションテスト（四半期毎）
- バグバウンティプログラム（HackerOne）

---

## 🎓 次のアクション

### 30日以内

- [ ] Miyabi Pro のMVP開発（ダッシュボード、決済統合）
- [ ] Stripe決済統合
- [ ] ランディングページ刷新（価格表追加）
- [ ] Product Huntローンチ準備

### 90日以内

- [ ] 最初の有料顧客10人獲得
- [ ] Discord/Slackコミュニティ立ち上げ
- [ ] ブログ10記事公開
- [ ] YouTubeチャンネル開設

### 6ヶ月以内

- [ ] Miyabi Enterprise MVP開発
- [ ] 最初のEnterprise顧客獲得
- [ ] SIパートナー3社締結
- [ ] Series Seed調達検討（$1M）

---

## 📞 連絡先

**販売に関するお問い合わせ**:
- Email: sales@miyabi.dev
- Website: https://miyabi.dev/contact
- Phone: +81-3-XXXX-XXXX

**パートナーシップ**:
- Email: partners@miyabi.dev
- Partner Portal: https://partners.miyabi.dev

---

**最終更新**: 2025-10-11
**次回レビュー**: 2025-11-11
**承認者**: Shunsuke Hayashi (CEO)
