# Claude Code Headless Mode

ヘッドレスモードでClaude Codeを実行するスクリプト。Anthropic APIを直接使用し、MCPツールとの統合をサポートします。

## 概要

このスクリプトは、Claude CodeをCLIやCI/CD環境でプログラマティックに実行するための機能を提供します。

### 特徴

- **ヘッドレス実行**: インタラクティブモード不要、完全自動化
- **MCP統合**: `.claude/mcp.json`で定義されたMCPサーバーに自動接続
- **オーストークン認証**: `ANTHROPIC_API_KEY`環境変数を使用
- **プログラマティックAPI**: TypeScriptから直接呼び出し可能
- **詳細ログ**: `--verbose`オプションでデバッグ情報を表示

## インストール

依存関係は既にプロジェクトにインストールされています：

```bash
npm install
```

## 環境変数

Anthropic APIキーを環境変数に設定します：

```bash
export ANTHROPIC_API_KEY="your-anthropic-api-key"
```

## 使用方法

### 基本的な使用

```bash
# ヘルプを表示
npm run claude-headless:help

# 簡単なプロンプトを実行
npm run claude-headless -- "プロジェクトの概要を教えて"

# または直接tsx経由で実行
tsx scripts/tools/claude-headless.ts "プロジェクトの概要を教えて"
```

### オプション

```bash
# モデルを指定
npm run claude-headless -- "プロンプト" --model claude-sonnet-4-20250514

# 最大トークン数を指定
npm run claude-headless -- "プロンプト" --max-tokens 8192

# 温度パラメータを指定
npm run claude-headless -- "プロンプト" --temperature 0.5

# MCPツールを無効化
npm run claude-headless -- "プロンプト" --no-mcp

# 特定のMCPサーバーのみ使用
npm run claude-headless -- "プロンプト" --mcp-servers github-enhanced,ide-integration

# システムプロンプトを追加
npm run claude-headless -- "プロンプト" --system "あなたは優秀なエンジニアです"

# 詳細ログを表示
npm run claude-headless -- "プロンプト" --verbose
```

### 実行例

#### 1. プロジェクトの状態を確認

```bash
npm run claude-headless -- "現在のプロジェクトの状態を教えて" --verbose
```

#### 2. GitHub Issueを作成（MCP経由）

```bash
npm run claude-headless -- "GitHub Issueを作成して: タイトル「ヘッドレスモードのテスト」、本文「動作確認」" \
  --mcp-servers github-enhanced
```

#### 3. コードレビュー

```bash
npm run claude-headless -- "agents/coordinator/coordinator-agent.ts をレビューして" \
  --max-tokens 8192
```

#### 4. ドキュメント生成

```bash
npm run claude-headless -- "このプロジェクトのREADMEを改善する提案をして" \
  --temperature 0.7
```

## TypeScriptからの使用

プログラムからも使用できます：

```typescript
import { ClaudeHeadless } from './scripts/tools/claude-headless.js';

async function main() {
  // APIキーは環境変数から自動取得
  const client = new ClaudeHeadless();

  try {
    // MCPサーバーに接続
    await client.connectMCP(['github-enhanced', 'ide-integration']);

    // プロンプトを実行
    const result = await client.execute({
      prompt: 'プロジェクトの概要を教えて',
      model: 'claude-sonnet-4-20250514',
      maxTokens: 4096,
      temperature: 1.0,
      enableMCP: true,
      verbose: true,
    });

    console.log('結果:', result);
  } finally {
    // 接続を閉じる
    await client.close();
  }
}

main();
```

## MCPツールの統合

### 利用可能なMCPサーバー

`.claude/mcp.json`で定義されているMCPサーバーが自動的に認識されます：

1. **ide-integration**: VS Code diagnostics、Jupyter実行
2. **github-enhanced**: GitHub Issue/PR管理
3. **project-context**: プロジェクトコンテキスト情報
4. **filesystem**: ファイルシステムアクセス
5. **context-engineering**: コンテキスト分析・最適化
6. **miyabi**: Miyabi CLI統合
7. **gemini-image-generation**: 画像生成

### MCPツールの使用例

Claude Codeがプロンプトに基づいて自動的にMCPツールを呼び出します：

```bash
# GitHub Issueを確認
npm run claude-headless -- "Issue #270の状態を確認して" --mcp-servers github-enhanced

# ファイルを読み取り
npm run claude-headless -- "agents/types/index.ts の内容を要約して" --mcp-servers filesystem

# 診断情報を取得
npm run claude-headless -- "現在のTypeScriptエラーをリストアップして" --mcp-servers ide-integration
```

## トラブルシューティング

### APIキーが設定されていない

```
Error: ANTHROPIC_API_KEY環境変数が設定されていません
```

**解決方法**: 環境変数を設定してください。

```bash
export ANTHROPIC_API_KEY="your-key"
```

### MCP接続エラー

```
❌ 接続失敗: github-enhanced
```

**解決方法**:
1. MCPサーバーの設定を確認 (`.claude/mcp.json`)
2. 必要な環境変数が設定されているか確認 (`GITHUB_TOKEN`など)
3. MCPサーバーのスクリプトが存在するか確認

### ワークスペースの問題

```
npm error Unsupported URL Type "workspace:"
```

**解決方法**:
package.jsonに直接依存関係を追加してから`npm install`を実行してください。

## 実装詳細

### アーキテクチャ

```
┌─────────────────────────────────────────┐
│ Claude Headless CLI                      │
│ - コマンドライン引数パース               │
│ - オプション処理                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ ClaudeHeadless Class                     │
│ - Anthropic API呼び出し                  │
│ - プロンプト実行                         │
│ - レスポンス処理                         │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ MCPClientManager                         │
│ - MCP設定読み込み                        │
│ - サーバー接続管理                       │
│ - ツール呼び出し                         │
└─────────────────────────────────────────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
┌──────────┐ ┌──────────┐ ┌──────────┐
│ MCP      │ │ MCP      │ │ MCP      │
│ Server 1 │ │ Server 2 │ │ Server 3 │
└──────────┘ └──────────┘ └──────────┘
```

### 主要なクラス

#### `ClaudeHeadless`

Anthropic APIを使用したヘッドレス実行の中核クラス。

```typescript
class ClaudeHeadless {
  constructor(apiKey?: string)
  async connectMCP(serverNames?: string[]): Promise<void>
  async execute(options: ClaudeHeadlessOptions): Promise<string>
  async close(): Promise<void>
}
```

#### `MCPClientManager`

MCPサーバーとの接続・ツール管理を担当。

```typescript
class MCPClientManager {
  loadMCPConfig(): MCPConfig | null
  async connectToServer(serverName: string, serverConfig: MCPServer): Promise<void>
  async connectAll(serverNames?: string[]): Promise<void>
  getTools(): MCPTool[]
  async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown>
  async closeAll(): Promise<void>
}
```

## CI/CD統合

### GitHub Actions例

```yaml
name: Claude Headless Test

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Run Claude Headless
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npm run claude-headless -- "プロジェクトの品質をチェック" --verbose
```

## ベストプラクティス

1. **APIキーの管理**: 環境変数に保存し、コードにハードコーディングしない
2. **適切なモデル選択**: タスクに応じてモデルを選択（sonnet-4 for complex, haiku for simple）
3. **トークン制限**: 長い出力が必要な場合は`--max-tokens`を調整
4. **MCPサーバーの選択**: 必要なサーバーのみ指定して起動時間を短縮
5. **エラーハンドリング**: try-catchでエラーを適切に処理

## 参考資料

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://docs.claude.com/claude-code)

## ライセンス

Apache-2.0

## 作成者

Shunsuke Hayashi <https://github.com/ShunsukeHayashi>
