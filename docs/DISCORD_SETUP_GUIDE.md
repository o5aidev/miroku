# Miyabi Discord Community - Setup Guide

**完全自律型開発コミュニティの立ち上げガイド**

---

## 📖 目次

1. [サーバー作成手順](#サーバー作成手順)
2. [チャンネル構造](#チャンネル構造)
3. [ロール設定](#ロール設定)
4. [Bot導入](#bot導入)
5. [ウェルカムメッセージ](#ウェルカムメッセージ)
6. [ルール・ガイドライン](#ルールガイドライン)

---

## サーバー作成手順

### Step 1: Discordサーバー作成

1. **Discord を開く**: https://discord.com/
2. **左サイドバーの「+」をクリック**
3. **「テンプレートなしで作成」を選択**
4. **サーバー名**: `Miyabi - Autonomous Development`
5. **サーバーアイコン**: 桜の花びら 🌸（後で変更可能）
6. **地域**: `Japan`

### Step 2: サーバー設定

1. **サーバー設定** → **概要**
   - **説明**: "完全自律型AI開発コミュニティ - GitHub as OS, Agent SDK, 53ラベル体系"
   - **検索可能性**: オン
   - **ウェルカムスクリーン**: 有効化

2. **サーバー設定** → **安全性の設定**
   - **確認レベル**: 中 - 電話番号認証が必要
   - **メディアフィルター**: すべてのメンバーをスキャン
   - **DM spam filter**: オン

3. **サーバー設定** → **モデレーション**
   - **AutoMod**: 有効化
     - スパムリンク検出
     - 不適切な言葉検出（英語・日本語）

---

## チャンネル構造

### 🌸 Welcome & Info (3チャンネル)

#### `#welcome`
- **説明**: 新規メンバーへのウェルカムメッセージ
- **権限**: 全員が閲覧可、書き込みはBot/Admin のみ
- **内容**: (後述のウェルカムメッセージ参照)

#### `#rules`
- **説明**: コミュニティルール
- **権限**: 全員が閲覧可、書き込みはAdmin のみ
- **内容**: (後述のルール参照)

#### `#announcements`
- **説明**: 重要なお知らせ（リリース、イベント等）
- **権限**: 全員が閲覧可、書き込みはAdmin のみ
- **例**:
  ```
  📢 miyabi@0.8.2 released!
  - Agent SDK integration
  - 53-label system
  - New Issue templates
  ```

---

### 💬 General (4チャンネル)

#### `#general`
- **説明**: 雑談・自己紹介
- **権限**: 全員が書き込み可
- **テーマ**: 自己紹介、日常会話、Miyabi以外の話題もOK

#### `#introductions`
- **説明**: 自己紹介専用
- **権限**: 全員が書き込み可
- **テンプレート**:
  ```
  👋 Name:
  💼 Role: (Developer / Student / Manager / etc.)
  🌍 Location: (Tokyo / Remote / etc.)
  🎯 Interests: (AI, DevOps, Automation, etc.)
  📚 Learning: (What you want to learn in Miyabi)
  ```

#### `#off-topic`
- **説明**: 技術以外の雑談
- **権限**: 全員が書き込み可
- **テーマ**: 趣味、ゲーム、音楽、etc.

#### `#showcase`
- **説明**: 作ったものを見せ合う
- **権限**: 全員が書き込み可
- **例**: "Miyabiで自動化したプロジェクト", "AgentSDKで作ったBot"

---

### 🎓 Learning & Help (5チャンネル)

#### `#beginners`
- **説明**: 初心者向け質問・ヘルプ
- **権限**: 全員が書き込み可
- **対象**: Miyabi初心者、プログラミング初心者
- **例**: "Labelの使い方がわかりません", "TypeScriptの書き方を教えてください"

#### `#label-system`
- **説明**: 53ラベル体系に関する質問・議論
- **権限**: 全員が書き込み可
- **対象**: Label System の使い方、ベストプラクティス
- **リンク**: docs/LABEL_SYSTEM_GUIDE.md

#### `#agent-sdk`
- **説明**: Agent SDK に関する質問・議論
- **権限**: 全員が書き込み可
- **対象**: CoordinatorAgent, CodeGenAgent, ReviewAgent, etc.
- **リンク**: docs/AGENT_SDK_LABEL_INTEGRATION.md

#### `#github-os`
- **説明**: GitHub as OS アーキテクチャに関する議論
- **権限**: 全員が書き込み可
- **対象**: Projects V2, Webhooks, Actions の活用法

#### `#troubleshooting`
- **説明**: エラー・問題解決
- **権限**: 全員が書き込み可
- **テンプレート**:
  ```
  🔍 Issue: (問題の説明)
  📋 Steps to Reproduce: (再現手順)
  💻 Environment: (OS, Node.js version, etc.)
  📸 Screenshots/Logs: (エラーログ)
  ```

---

### 🛠️ Development (4チャンネル)

#### `#feature-requests`
- **説明**: 新機能のアイデア・提案
- **権限**: 全員が書き込み可
- **フロー**: Discord → GitHub Issue に移行

#### `#bug-reports`
- **説明**: バグ報告
- **権限**: 全員が書き込み可
- **フロー**: Discord → GitHub Issue に移行

#### `#pull-requests`
- **説明**: PRレビュー依頼・議論
- **権限**: 全員が書き込み可
- **連携**: GitHub PR Bot が自動通知

#### `#releases`
- **説明**: リリース情報
- **権限**: 全員が閲覧可、書き込みはBot のみ
- **連携**: GitHub Release Bot が自動通知

---

### 🤖 Agents & Automation (3チャンネル)

#### `#coordinator-agent`
- **説明**: CoordinatorAgent に関する議論
- **権限**: 全員が書き込み可
- **テーマ**: DAG分解、並列実行最適化

#### `#codegen-agent`
- **説明**: CodeGenAgent に関する議論
- **権限**: 全員が書き込み可
- **テーマ**: コード生成、Claude Sonnet 4 活用

#### `#review-agent`
- **説明**: ReviewAgent に関する議論
- **権限**: 全員が書き込み可
- **テーマ**: 品質スコアリング、静的解析

---

### 📊 Events & Community (3チャンネル)

#### `#events`
- **説明**: イベント告知・参加登録
- **権限**: 全員が閲覧可、書き込みはAdmin のみ
- **例**:
  - Weekly Office Hours (毎週金曜 20:00 JST)
  - Monthly Meetup
  - Hackathon

#### `#voice-chat`
- **説明**: ボイスチャット告知・募集
- **権限**: 全員が書き込み可

#### `#feedback`
- **説明**: コミュニティへのフィードバック
- **権限**: 全員が書き込み可
- **例**: "チャンネル追加してほしい", "イベントのアイデア"

---

### 🔒 Admin & Moderation (2チャンネル)

#### `#mod-chat` (非公開)
- **説明**: モデレーター専用
- **権限**: Mod, Admin のみ
- **テーマ**: モデレーション相談、スパム報告

#### `#logs` (非公開)
- **説明**: サーバーログ（Bot自動投稿）
- **権限**: Admin のみ
- **内容**: メンバー参加/退出、削除メッセージ、警告

---

## ロール設定

### ロール階層（上から順に権限が強い）

#### 🌸 **Founder** (創設者)
- **色**: ピンク `#FF69B4`
- **権限**:
  - 全権限
  - サーバー設定変更
  - ロール管理
  - メンバーBan
- **対象**: プロジェクトオーナー（1名）

#### 👑 **Admin** (管理者)
- **色**: レッド `#E74C3C`
- **権限**:
  - チャンネル管理
  - メンバーキック
  - メッセージ削除
  - Announcement投稿
- **対象**: コアチームメンバー（3-5名）

#### 🛡️ **Moderator** (モデレーター)
- **色**: オレンジ `#E67E22`
- **権限**:
  - メッセージ削除
  - メンバータイムアウト
  - スレッド管理
- **対象**: 信頼できるコミュニティメンバー（5-10名）

#### 🌟 **Contributor** (コントリビューター)
- **色**: イエロー `#F1C40F`
- **権限**: 一般メンバーと同じ
- **条件**: GitHub PRマージ済み（1件以上）
- **特典**:
  - 専用ロール表示
  - 優先サポート

#### 🎓 **Expert** (エキスパート)
- **色**: グリーン `#2ECC71`
- **権限**: 一般メンバーと同じ
- **条件**:
  - 50+ helpful messages
  - または Agent SDK完全理解
- **特典**:
  - 専用ロール表示
  - イベント優先参加

#### 🤖 **Agent Developer** (Agent開発者)
- **色**: シアン `#3498DB`
- **権限**: 一般メンバーと同じ
- **条件**: カスタムAgentを開発・公開
- **特典**:
  - 専用チャンネル `#agent-dev-private` へのアクセス

#### 📚 **Documentation Writer** (ドキュメント執筆者)
- **色**: ブルー `#2980B9`
- **権限**: 一般メンバーと同じ
- **条件**: ドキュメントPR マージ済み（3件以上）
- **特典**: 専用ロール表示

#### 🚀 **Early Adopter** (初期メンバー)
- **色**: パープル `#9B59B6`
- **権限**: 一般メンバーと同じ
- **条件**: 最初の100名
- **特典**: 専用ロール表示、限定イベント招待

#### 👤 **Member** (一般メンバー)
- **色**: グレー `#95A5A6`
- **権限**:
  - メッセージ投稿
  - リアクション
  - ボイスチャット参加
- **対象**: 全ての参加者

#### 🤖 **Bot**
- **色**: ライトグレー `#BDC3C7`
- **権限**: 特定チャンネルへの投稿
- **対象**: MEE6, GitHub Bot, Miyabi Bot

---

## Bot導入

### 1. MEE6（レベリング・モデレーション）

#### 導入手順
1. https://mee6.xyz/ にアクセス
2. 「Add to Discord」をクリック
3. Miyabiサーバーを選択
4. 権限を許可

#### 設定
- **Leveling**: 有効化
  - レベル5 → `Early Adopter` ロール付与
  - レベル10 → `Contributor` ロール付与（要GitHub連携確認）
  - レベル20 → `Expert` ロール付与

- **Moderation**: 有効化
  - スパムリンク自動削除
  - 連続投稿制限（5メッセージ/10秒）

- **Welcome Message**:
  ```
  🌸 Welcome {{user}} to Miyabi - Autonomous Development!

  Please read #rules and introduce yourself in #introductions 👋
  ```

### 2. GitHub Bot（PR/Issue通知）

#### 導入手順
1. https://github.com/apps/discord にアクセス
2. 「Install」をクリック
3. Miyabiリポジトリを選択
4. Webhookを設定:
   - Repository: `ShunsukeHayashi/Miyabi`
   - Events: `issues`, `pull_request`, `release`
   - Channel mapping:
     - Issues → `#bug-reports`, `#feature-requests`
     - Pull Requests → `#pull-requests`
     - Releases → `#releases`

### 3. Miyabi Bot（カスタムBot）

#### 機能
- `/miyabi-status` - GitHub Issueステータス表示
- `/miyabi-help` - ヘルプ表示
- `/miyabi-label <issue>` - Label推定（IssueAgent）
- `/miyabi-deploy` - デプロイトリガー（Admin のみ）

#### 導入（後日実装）
- Discord.js ベース
- miyabi-agent-sdk 統合
- Heroku/Railway でホスティング

---

## ウェルカムメッセージ

### `#welcome` チャンネル（埋め込みメッセージ）

```markdown
# 🌸 Welcome to Miyabi - Autonomous Development!

**Miyabi（雅）** は、一つのコマンドで全てが完結する完全自律型AI開発フレームワークです。

## 🎯 このコミュニティについて

- **初心者歓迎**: プログラミング初心者でもOK！
- **グローバル**: 日本語・英語どちらでもOK
- **学び合い**: AI × 自律開発を一緒に学びましょう
- **オープンソース**: 誰でもコントリビュート可能

## 🚀 最初のステップ

1. **#rules を読む** - コミュニティルールを確認
2. **#introductions で自己紹介** - あなたのことを教えてください！
3. **#beginners で質問** - わからないことは何でも聞いてください
4. **#showcase で共有** - 作ったものを見せ合いましょう

## 📚 主なリソース

- **GitHub**: https://github.com/ShunsukeHayashi/Miyabi
- **npm**: https://www.npmjs.com/package/miyabi
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html
- **Label System Guide**: [53ラベル体系](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/LABEL_SYSTEM_GUIDE.md)
- **Agent SDK**: [Agent SDK統合](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/AGENT_SDK_LABEL_INTEGRATION.md)

## 💡 何から始めればいい？

### 初心者の方
1. `npx miyabi init my-project` でプロジェクト作成
2. #beginners で質問
3. GETTING_STARTED.md を読む

### 開発者の方
1. GitHub リポジトリをクローン
2. Label System を理解する
3. Agent SDK を試す
4. PRを送る！

## 🎉 イベント

- **Weekly Office Hours**: 毎週金曜 20:00 JST（#events で告知）
- **Monthly Meetup**: 月1回のオンラインミートアップ
- **Hackathon**: 年4回のハッカソン

---

**Let's build the future of autonomous development together!** 🌸
```

---

## ルール・ガイドライン

### `#rules` チャンネル（埋め込みメッセージ）

```markdown
# 📜 Miyabi Community Rules

## 🌸 基本理念

**"Beauty in Autonomous Development"**

私たちは、全ての人が尊重され、学び合えるコミュニティを目指します。

---

## ✅ Do's（推奨）

1. **親切に**: 初心者にも優しく
2. **尊重**: 全ての意見を尊重
3. **建設的**: フィードバックは建設的に
4. **オープン**: 知識を惜しまず共有
5. **学ぶ**: 失敗は学びの機会
6. **協力**: 一緒に問題を解決

---

## ❌ Don'ts（禁止事項）

1. **ハラスメント**: あらゆるハラスメントは即BAN
2. **スパム**: 広告・宣伝の連投禁止
3. **不適切なコンテンツ**: NSFW、暴力的内容禁止
4. **個人情報**: 他人の個人情報を晒さない
5. **荒らし**: 意図的な妨害行為禁止
6. **違法行為**: 違法行為の推奨・支援禁止

---

## 📋 チャンネルルール

### 質問する前に

1. **#rules を読む**
2. **ドキュメントを確認**: LABEL_SYSTEM_GUIDE.md など
3. **検索**: 同じ質問がないか確認
4. **質問テンプレート使用**: 再現手順、エラーログを含める

### 質問するとき

- **適切なチャンネル**: #beginners, #label-system, #agent-sdk など
- **明確に**: 何がわからないのか具体的に
- **再現手順**: エラーが出る場合は再現手順を記載
- **環境情報**: OS, Node.js version, miyabi version など

### 回答するとき

- **親切に**: 初心者にもわかりやすく
- **正確に**: 間違った情報は混乱を招く
- **リンク**: ドキュメントへのリンクも添える

---

## 🛡️ モデレーション

### 警告システム

1. **1回目**: 警告（DM）
2. **2回目**: 24時間タイムアウト
3. **3回目**: 永久BAN

### 即BAN対象

- ハラスメント
- スパム（商業的広告）
- 違法行為
- NSFW コンテンツ
- 荒らし行為

### 報告方法

- **モデレーターにDM**
- **#feedback で報告**
- **Discordの報告機能を使用**

---

## 🌍 言語

- **日本語**: メイン言語
- **英語**: グローバルメンバー歓迎
- **その他**: 可能な限り対応

---

## 📞 サポート

困ったことがあれば：
- **#beginners**: 技術的な質問
- **#feedback**: コミュニティへのフィードバック
- **#troubleshooting**: エラー・問題解決
- **DM to Mods**: プライベートな相談

---

## 🎉 楽しもう！

ルールを守りつつ、自由に学び、楽しんでください！

---

**Last Updated**: 2025-10-10
**Version**: 1.0
```

---

## 次のステップ

### Phase 1完了後

1. **Beta Testing**: 友人・知人10-20人招待
2. **フィードバック収集**: 改善点を聞く
3. **Bot動作確認**: MEE6, GitHub Bot のテスト
4. **Content Creation**: FAQ, チュートリアル作成

### Phase 4: Public Launch

1. **README.md更新**: Discordリンク追加
2. **SNS発表**: Twitter, LinkedIn, Reddit
3. **初イベント**: Welcome Party開催
4. **プレスリリース**: (Option) メディア発表

---

**Miyabi Discord Community** - Beauty in Autonomous Development 🌸

