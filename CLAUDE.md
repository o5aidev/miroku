# Claude Code プロジェクト設定

このファイルは、Claude Codeが自動的に参照するプロジェクトコンテキストファイルです。

## プロジェクト概要

**Miyabi** - 一つのコマンドで全てが完結する自律型開発フレームワーク

完全自律型AI開発オペレーションプラットフォーム。GitHub as OS アーキテクチャに基づき、Issue作成からコード実装、PR作成、デプロイまでを完全自動化します。

## アーキテクチャ

### コアコンポーネント

1. **Agent System**
   - CoordinatorAgent: タスク統括・DAG分解
   - CodeGenAgent: コード生成
   - ReviewAgent: コード品質レビュー
   - IssueAgent: Issue分析・ラベリング
   - PRAgent: Pull Request自動作成
   - DeploymentAgent: デプロイ管理

2. **GitHub OS Integration**
   - Projects V2: データ永続化層
   - Webhooks: イベントバス
   - Actions: 実行エンジン
   - Discussions: メッセージキュー
   - Pages: ダッシュボード
   - Packages: パッケージ配布

3. **CLI Package** (`packages/cli/`)
   - `miyabi init`: 新規プロジェクト作成
   - `miyabi install`: 既存プロジェクトに追加
   - `miyabi status`: ステータス確認

## 重要なファイル

### 設定ファイル
- `.miyabi.yml`: プロジェクト設定（GitHubトークンは環境変数推奨）
- `.github/workflows/`: 自動化ワークフロー
- `.github/labels.yml`: 識学理論65ラベル体系

### ドキュメント
- `docs/AGENT_OPERATIONS_MANUAL.md`: Agent運用マニュアル
- `docs/GITHUB_OS_INTEGRATION.md`: GitHub OS完全統合ガイド
- `packages/cli/README.md`: CLI使用方法

### コアコード
- `agents/`: 各Agentの実装
- `scripts/`: 運用スクリプト
- `packages/`: NPMパッケージ

## 開発ガイドライン

### TypeScript
- Strict mode必須
- ESM形式（import/export）
- `__dirname` → `fileURLToPath(import.meta.url)` 使用

### テスト
- Vitest使用
- カバレッジ目標: 80%以上
- ユニットテスト必須

### コミット規約
- Conventional Commits準拠
- `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Co-Authored-By: Claude <noreply@anthropic.com>

### セキュリティ
- トークンは環境変数
- `.miyabi.yml`は`.gitignore`に追加
- Dependabot有効
- CodeQL有効

## 識学理論5原則

1. **責任の明確化**: 各Agentの役割を明確に定義
2. **権限の明確化**: Agent毎の実行権限を制限
3. **階層の明確化**: Coordinator → Specialist の階層構造
4. **結果の明確化**: 成功条件・KPIを数値化
5. **曖昧性の排除**: YAML/JSON形式で構造化

## 実行例

```bash
# 新規プロジェクト作成
npx miyabi init my-project

# 既存プロジェクトに追加
cd existing-project
npx miyabi install

# ステータス確認
npx miyabi status

# Agent実行（自動Issue処理）
npm run agents:parallel:exec -- --issues=5 --concurrency=3
```

## 環境変数

```bash
GITHUB_TOKEN=ghp_xxx        # GitHubアクセストークン
ANTHROPIC_API_KEY=sk-ant-xxx  # Claude APIキー（オプション）
DEVICE_IDENTIFIER=MacBook   # デバイス識別子
```

## 関連リンク

- Dashboard: https://shunsukehayashi.github.io/Miyabi/
- Repository: https://github.com/ShunsukeHayashi/Miyabi
- NPM Package: @miyabi/agent-sdk

---

**このファイルはClaude Codeが自動参照します。プロジェクトのコンテキストとして常に最新に保ってください。**
