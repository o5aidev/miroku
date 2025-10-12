# Discord Server Setup - Quick Start Guide

**Miyabi Community Discord サーバーのセットアップ手順**

このガイドに従って、30分でDiscordコミュニティを立ち上げましょう！

---

## 📋 準備するもの

- [ ] Discordアカウント
- [ ] 管理者権限
- [ ] 30分の時間

---

## 🚀 Phase 1: サーバー作成 (5分)

### Step 1: Discordサーバーを作成

1. Discordアプリを開く
2. 左サイドバーの **+** ボタンをクリック
3. **サーバーを作成** を選択
4. **オリジナルを作成** を選択
5. サーバー名: **Miyabi Community**
6. サーバーアイコン: 桜（🌸）の画像をアップロード（推奨）

### Step 2: サーバー設定

**サーバー設定** (⚙️) → **概要**:
- **サーバー名**: Miyabi Community
- **サーバー地域**: Japan (日本)
- **確認レベル**: 中（メール認証必須）
- **不適切なコンテンツフィルター**: メディアコンテンツをすべてのメンバーからスキャン

**コミュニティ機能**:
- **コミュニティを有効にする** → 有効化
- **ウェルカム画面を有効にする** → 有効化
- **メンバーシップ審査を有効にする** → 有効化

---

## 📢 Phase 2: チャンネル作成 (10分)

### カテゴリ1: WELCOME & INFO

```
📋 WELCOME & INFO
   ├─ 📜 rules (ルール)
   ├─ 🗺️ server-guide (サーバーガイド)
   ├─ 📣 announcements (お知らせ)
   └─ 🆕 changelog (変更履歴)
```

**設定方法**:
1. **カテゴリを作成** → 名前: `📋 WELCOME & INFO`
2. 各チャンネルを作成:
   - `#rules` - 権限: **@everyone** 読み取り専用
   - `#server-guide` - 権限: **@everyone** 読み取り専用
   - `#announcements` - 権限: **@everyone** 読み取り専用
   - `#changelog` - 権限: **@everyone** 読み取り専用

### カテゴリ2: COMMUNITY

```
💬 COMMUNITY
   ├─ 🌸 introductions (自己紹介)
   ├─ 💬 general (雑談)
   ├─ 💡 ideas (アイデア)
   ├─ 🎨 showcase (作品共有)
   └─ 🎮 off-topic (オフトピック)
```

**設定方法**:
1. **カテゴリを作成** → 名前: `💬 COMMUNITY`
2. 各チャンネルを作成:
   - すべて **@everyone** 読み書き可能

### カテゴリ3: SUPPORT (日本語)

```
🇯🇵 日本語サポート
   ├─ ❓ questions-jp (質問・困りごと)
   ├─ 🔰 beginners-jp (初心者の部屋)
   └─ 🐛 bug-reports-jp (バグ報告)
```

### カテゴリ4: SUPPORT (English)

```
🇬🇧 English Support
   ├─ ❓ questions-en (Questions & Help)
   ├─ 🔰 beginners-en (Beginners)
   └─ 🐛 bug-reports-en (Bug Reports)
```

### カテゴリ5: DEVELOPMENT

```
💻 DEVELOPMENT
   ├─ 🚀 feature-discussions (新機能ディスカッション)
   ├─ 🔬 dev-logs (開発ログ)
   ├─ 🧪 beta-testing (ベータテスト)
   ├─ 📦 plugin-dev (プラグイン開発)
   └─ 🎓 code-review (コードレビュー)
```

**権限設定**:
- `#dev-logs`, `#beta-testing`: **Contributor** ロール以上

### カテゴリ6: LEARNING

```
📚 LEARNING
   ├─ 📖 tutorials (チュートリアル)
   ├─ 🎥 videos (動画・ウェビナー)
   ├─ 📝 blog-posts (ブログ記事)
   ├─ 🏆 challenges (チャレンジ)
   └─ 💬 study-groups (勉強会)
```

### カテゴリ7: BOTS & AUTOMATION

```
🤖 BOTS
   ├─ 🎲 bot-commands (Botコマンド)
   ├─ 📊 github-updates (GitHub更新通知)
   └─ 🏅 leaderboard (貢献者ランキング)
```

### ボイスチャンネル

```
🎤 VOICE
   ├─ 🗣️ casual-voice (雑談ルーム)
   ├─ 👨‍🏫 mentoring (メンタリング)
   ├─ 🎬 live-coding (ライブコーディング)
   └─ 🎵 lofi-room (Lo-fi作業用BGM)
```

---

## 👥 Phase 3: ロール設定 (5分)

**サーバー設定** → **ロール** → **ロールを作成**

### 基本ロール

| ロール名 | カラー | 権限 |
|---------|--------|------|
| 🌱 Newcomer | Gray | 基本的な読み書き |
| ✅ Verified | Green | 全チャンネルアクセス |
| 🎨 Creator | Blue | 作品共有 |
| 💎 Contributor | Purple | 開発チャンネルアクセス |
| 🏆 Top Contributor | Gold | モデレーション補助 |
| 🛡️ Moderator | Red | 管理権限 |

### ロール順序（上から）
```
👑 Maintainer (あなた)
🛡️ Moderator
🏆 Top Contributor
💎 Contributor
🎨 Creator
❓ Helper
✅ Verified
🌱 Newcomer
@everyone
```

---

## 🤖 Phase 4: Bot追加 (5分)

### MEE6 (レベリング・自動モデレーション)

1. https://mee6.xyz/ にアクセス
2. **Add to Discord** をクリック
3. **Miyabi Community** を選択
4. 機能を設定:
   - ✅ レベリング有効化
   - ✅ ウェルカムメッセージ有効化
   - ✅ モデレーション有効化

### GitHub Bot (GitHub通知)

1. https://github.com/apps/discord にアクセス
2. **Install** をクリック
3. **Miyabi Community** を選択
4. `#github-updates` チャンネルにWebhook設定

---

## 📝 Phase 5: 初期コンテンツ作成 (5分)

### #rules チャンネル

以下をコピー＆ペースト:

```markdown
# 📜 Miyabi Community Rules

## 🌸 Our Values
- Be respectful and inclusive
- Help and encourage beginners
- Give constructive feedback
- Respect different opinions

## ✅ Expected Behavior
- Ask questions freely
- Share your knowledge
- Collaborate and learn together
- Give credit to others

## ❌ Unacceptable Behavior
- Harassment or discrimination
- Spam or excessive self-promotion
- Sharing private information
- Trolling or inflammatory comments

## 🛡️ Enforcement
1st violation: Warning
2nd violation: 24-hour timeout
3rd violation: Permanent ban

**By joining, you agree to these rules.**

詳細: https://github.com/ShunsukeHayashi/Miyabi/blob/main/COMMUNITY_GUIDELINES.md
```

### #server-guide チャンネル

```markdown
# 🗺️ Server Guide

## 📢 WELCOME & INFO
- 📜 #rules - ルール・行動規範
- 🗺️ #server-guide - このガイド
- 📣 #announcements - 重要なお知らせ
- 🆕 #changelog - バージョン更新情報

## 💬 COMMUNITY
- 🌸 #introductions - 自己紹介はこちら！
- 💬 #general - 雑談・交流
- 💡 #ideas - 機能アイデア・提案
- 🎨 #showcase - 作った作品を共有
- 🎮 #off-topic - プログラミング以外の話題

## ❓ SUPPORT
- 🇯🇵 #questions-jp - 日本語で質問
- 🇬🇧 #questions-en - Ask in English
- 🔰 #beginners - 初心者専用
- 🐛 #bug-reports - バグを報告

## 💻 DEVELOPMENT
- 🚀 #feature-discussions - 新機能の議論
- 🔬 #dev-logs - 開発の進捗共有
- 🧪 #beta-testing - ベータ版テスト
- 📦 #plugin-dev - プラグイン開発
- 🎓 #code-review - コードレビュー依頼

## 📚 LEARNING
- 📖 #tutorials - チュートリアル
- 🎥 #videos - 動画リソース
- 📝 #blog-posts - ブログ記事
- 🏆 #challenges - プログラミングチャレンジ
- 💬 #study-groups - 勉強会

## 🎤 VOICE
- 🗣️ casual-voice - カジュアル通話
- 👨‍🏫 mentoring - メンタリングセッション
- 🎬 live-coding - ライブコーディング
- 🎵 lofi-room - Lo-fi BGM部屋

---

**どこから始める？**
1. 🌸 #introductions で自己紹介
2. ❓ #questions-jp または #questions-en で質問
3. 📖 #tutorials で学習開始
4. 💬 #general で交流

**困ったときは？**
- 🔰 #beginners で初心者質問
- @Moderators をメンション
```

### #announcements チャンネル

最初のアナウンスメント:

```markdown
# 🎉 Welcome to Miyabi Community!

**Miyabi Discord Server へようこそ！**

このコミュニティでは、AI × 自律開発の最前線を一緒に探求します。

## 🚀 Getting Started

1. 📜 #rules でルールを確認
2. 🗺️ #server-guide でチャンネル説明を確認
3. 🌸 #introductions で自己紹介
4. ❓ #questions-jp または #questions-en で質問開始！

## 🤖 What is Miyabi?

Miyabiは、Issue作成からPR作成、デプロイまでを**完全自動化**する
AI駆動の自律型開発フレームワークです。

- ⭐ GitHub: https://github.com/ShunsukeHayashi/Miyabi
- 📦 npm: `npx miyabi`
- 📖 Docs: https://github.com/ShunsukeHayashi/Miyabi#readme

## 💬 Join the Conversation

質問、アイデア、作品共有、なんでもOK！
Let's build the future of autonomous development together! 🌸

---

@everyone **Miyabiの旅を一緒に始めましょう！**
```

---

## 🎯 Phase 6: ウェルカム画面設定 (3分)

**サーバー設定** → **ウェルカム画面**:

**ウェルカムメッセージ**:
```
🌸 Miyabi Communityへようこそ！

初心者からエキスパートまで、
AIと共に成長する開発者コミュニティです。

まずは以下を確認してください：
📜 #rules
🗺️ #server-guide
🌸 #introductions
```

**リアクションロール**:
- ✅ React to verify (Verified ロール付与)
- 🇯🇵 日本語 (Japanese Speaker ロール)
- 🇬🇧 English (English Speaker ロール)

---

## ✅ 完了チェックリスト

Phase 1: サーバー作成
- [ ] Discordサーバー作成完了
- [ ] コミュニティ機能有効化

Phase 2: チャンネル作成
- [ ] 7つのカテゴリ作成
- [ ] 25+のチャンネル作成
- [ ] ボイスチャンネル作成

Phase 3: ロール設定
- [ ] 6つの基本ロール作成
- [ ] 権限設定完了

Phase 4: Bot追加
- [ ] MEE6 Bot追加
- [ ] GitHub Bot追加（オプション）

Phase 5: 初期コンテンツ
- [ ] #rules 作成
- [ ] #server-guide 作成
- [ ] #announcements 初投稿

Phase 6: ウェルカム画面
- [ ] ウェルカムメッセージ設定
- [ ] リアクションロール設定

---

## 🎊 次のステップ

### Week 1: Soft Launch
- [ ] 友人・知人を10-20人招待
- [ ] フィードバック収集
- [ ] 改善点を修正

### Week 2: Public Launch
- [ ] README.mdに実際のDiscord招待リンク追加
- [ ] X (Twitter) で発表
- [ ] Reddit, Hacker News投稿

### Week 3-4: Community Growth
- [ ] 初のコミュニティイベント開催
- [ ] 定期コンテンツ投稿開始
- [ ] メンバー50人達成目標

---

## 📚 参考ドキュメント

- [DISCORD_COMMUNITY_PLAN.md](DISCORD_COMMUNITY_PLAN.md) - 完全コミュニティ戦略
- [DISCORD_MCP_SETUP.md](DISCORD_MCP_SETUP.md) - MCP Bot設定
- [COMMUNITY_GUIDELINES.md](COMMUNITY_GUIDELINES.md) - 行動規範詳細

---

## 🆘 トラブルシューティング

**Q: チャンネルが多すぎる？**
A: 最初は以下の最小構成でもOK:
- #rules, #general, #questions, #showcase
必要に応じて後から追加できます。

**Q: Botの設定が難しい**
A: Botは後からでもOK。まずは基本チャンネルだけで開始しましょう。

**Q: 招待リンクの作り方**
A: サーバー名 → 招待 → 友達を招待 → リンクをコピー

---

**作成日**: 2025-10-10
**バージョン**: 1.0

**🌸 Enjoy building your community! 🚀**
