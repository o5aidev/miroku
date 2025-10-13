# MCP統合 - 接続状態診断レポート

## 📊 現在の接続状態

| MCPサーバー | 状態 | エラー原因 | 優先度 |
|-----------|------|-----------|--------|
| **ide-integration** | ❌ 動作不可 | ESM/CommonJS互換性 | 🔴 P1 |
| **github-enhanced** | ❌ 動作不可 | ESM/CommonJS互換性 | 🔴 P0 |
| **project-context** | ❌ 動作不可 | ESM/CommonJS互換性 | 🟡 P2 |
| **miyabi-integration** | ✅ 動作確認済み | - | 🟢 |
| **image-generation** | ⚠️ 未確認 | 環境変数依存 | 🟡 P2 |
| **filesystem** | ✅ 外部パッケージ | @modelcontextprotocol/server-filesystem | 🟢 |
| **context-engineering** | ⚠️ 未確認 | 外部サービス依存 | 🟡 P3 |

## 🔍 根本原因

### CommonJS vs ESM 互換性問題

**問題**: プロジェクトは`"type": "module"`（ESM）を使用しているが、MCPサーバーは`require()`（CommonJS）で実装されている。

```javascript
// ❌ 現在（CommonJS - 動作しない）
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');

// ✅ 必要な形式（ESM）
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
```

**エラーメッセージ**:
```
ReferenceError: require is not defined in ES module scope
```

### 影響を受けるファイル

1. `.claude/mcp-servers/project-context.js` - 378行
2. `.claude/mcp-servers/github-enhanced.js` - 475行
3. `.claude/mcp-servers/ide-integration.js` - 313行
4. `.claude/mcp-servers/discord-integration.js` - 未確認
5. `.claude/mcp-servers/image-generation.js` - 未確認

## 🛠️ 修正方法

### オプション1: `.cjs`拡張子にリネーム（推奨 - 最小変更）

MCPサーバーファイルを`.js` → `.cjs`にリネームし、CommonJSとして明示的に扱う。

**利点**:
- コード変更不要
- 即座に動作
- 既存の実装を維持

**実装**:
```bash
# ファイルをリネーム
mv .claude/mcp-servers/project-context.js .claude/mcp-servers/project-context.cjs
mv .claude/mcp-servers/github-enhanced.js .claude/mcp-servers/github-enhanced.cjs
mv .claude/mcp-servers/ide-integration.js .claude/mcp-servers/ide-integration.cjs

# mcp.jsonを更新（.js → .cjs）
```

### オプション2: ESM形式に変換

`require()` → `import`に書き換え。

**利点**:
- プロジェクト全体の一貫性
- 最新のJavaScript仕様に準拠

**欠点**:
- 大規模なコード変更が必要
- テストが必須

## 💰 コスト最適化戦略

### Anthropic API コスト構造

```
Claude Sonnet 4 (2025-05-14):
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens
- Cache Write: $3.75 / 1M tokens
- Cache Read: $0.30 / 1M tokens
```

### MCPツール使用時のコスト

**1回のツール呼び出し**:
```
リクエスト（ツール定義含む） → 応答 → ツール実行 → 結果 → 最終応答
約500-2000トークン（入力） + 約200-1000トークン（出力）
= $0.0015 - $0.045 / 回
```

### 🎯 エコな使用ガイドライン

#### ✅ MCPツールを使うべき場面

1. **GitHub操作が必須**
   - Issue作成/更新
   - PR作成
   - ラベル管理
   - **理由**: GitHub APIを直接使用、正確性が重要

2. **リアルタイム情報が必須**
   - 最新のTypeScriptエラー取得
   - 現在のテスト結果
   - Git履歴
   - **理由**: 静的情報では不足

3. **並列/非同期実行が必須**
   - 複数Issueの同時処理
   - バックグラウンドタスク
   - **理由**: 効率性が最優先

#### ❌ MCPツールを使わない方が良い場面

1. **静的情報の取得**
   ```bash
   # ❌ MCPツール使用
   project-context.get_dependencies()

   # ✅ CLAUDE.mdから読み取り
   Claude自身がCLAUDE.mdを理解して回答
   ```

2. **単純な質問**
   ```bash
   # ❌ MCPツール使用
   project-context.get_project_structure()

   # ✅ プロンプトで直接質問
   "このプロジェクトの構造を教えて"
   ```

3. **繰り返しの情報取得**
   - Prompt Caching を活用
   - CLAUDE.mdに情報を集約

### 🔄 並列実行時のMCP使用戦略

#### 並列実行が必須の場合

```typescript
// ✅ 複数Issueを並列処理
await Promise.all([
  processIssue(270), // Worktree #1 + MCPツール
  processIssue(271), // Worktree #2 + MCPツール
  processIssue(272), // Worktree #3 + MCPツール
]);
```

**コスト見積もり**:
- 3 Issues × 10 ツール呼び出し/Issue × $0.01/呼び出し
- = **$0.30 / 並列実行**

**時間短縮**:
- 順次実行: 30分 × 3 = 90分
- 並列実行: 30分（3倍速）
- **コスト vs 時間のトレードオフ**

#### コスト削減テクニック

1. **バッチ処理**
   ```typescript
   // ❌ 個別に呼び出し
   for (const issue of issues) {
     await mcp.github.getIssue(issue);
   }

   // ✅ 一括取得
   await mcp.github.getAgentTasks({ state: 'open' });
   ```

2. **キャッシュ活用**
   ```typescript
   // System Prompt にプロジェクト情報を含める
   // → Prompt Caching で 90% コスト削減
   ```

3. **条件付き実行**
   ```typescript
   // 本当に必要な時だけツールを使用
   if (requiresGitHub) {
     await mcp.github.createIssue(data);
   } else {
     // MCPなしで処理
   }
   ```

## 📈 推奨実装順序

### Phase 1: 緊急修正（今すぐ）

1. **github-enhanced** を修正（P0）
   - `.cjs`にリネーム
   - Issue/PR操作を可能に

2. **ide-integration** を修正（P1）
   - `.cjs`にリネーム
   - 診断情報取得を可能に

### Phase 2: 最適化（1週間以内）

1. コスト監視ダッシュボード実装
2. MCPツール使用回数のロギング
3. 不要なツール呼び出しの特定

### Phase 3: スケーラビリティ（1ヶ月以内）

1. すべてのMCPサーバーをESM化
2. 並列実行時の最適化
3. キャッシュ戦略の高度化

## 🎯 並列実行時の推奨パターン

### パターン1: 独立したIssue処理

```typescript
// 各IssueにWorktree + MCPクライアント
const results = await Promise.all(
  issues.map(issue =>
    executeInWorktree(issue, {
      mcpServers: ['github-enhanced', 'ide-integration'],
      maxCost: 0.10 // Issue当たりの最大コスト
    })
  )
);
```

### パターン2: 依存関係のあるタスク

```typescript
// DAGに基づいた順次/並列実行
const dag = buildDAG(tasks);
await executeDAG(dag, {
  mcpEnabled: true,
  costBudget: 1.00 // 全体の予算
});
```

## 📊 コスト見積もり例

### シナリオ1: 単一Issue処理

```
Issue #270 を処理:
- GitHub Issue取得: 1回 ($0.002)
- TypeScript診断: 1回 ($0.005)
- コード生成: Claude API ($0.030)
- PR作成: 1回 ($0.003)
合計: $0.040
```

### シナリオ2: 並列3 Issue処理

```
Issue #270, #271, #272 を並列処理:
- Issue処理: 3 × $0.040 = $0.120
- 並列化オーバーヘッド: $0.030
合計: $0.150

時間短縮: 90分 → 30分 (3倍速)
コスト/時間: $0.005/分
```

### シナリオ3: 大規模並列（10 Issues）

```
10 Issues を並列処理:
- Issue処理: 10 × $0.040 = $0.400
- 並列化オーバーヘッド: $0.100
合計: $0.500

時間短縮: 300分 → 60分 (5倍速)
コスト/時間: $0.008/分
```

## 🚦 使用判断フローチャート

```
MCPツールを使うべきか？
│
├─ GitHubへの書き込みが必要？
│  └─ YES → github-enhanced を使用 ✅
│
├─ リアルタイム診断が必要？
│  └─ YES → ide-integration を使用 ✅
│
├─ 並列実行が必須？
│  └─ YES → 必要なツールのみ使用 ✅
│
└─ 静的情報の参照のみ？
   └─ YES → MCPなしで実行 💰
```

## 📝 次のアクション

- [ ] `.cjs`リネームの実装
- [ ] `mcp.json`の更新
- [ ] コスト監視の実装
- [ ] 並列実行パターンのドキュメント化
- [ ] テストスクリプトの作成

## 🔗 関連ドキュメント

- [CLAUDE_HEADLESS_MODE.md](./CLAUDE_HEADLESS_MODE.md)
- [ENTITY_RELATION_MODEL.md](./ENTITY_RELATION_MODEL.md)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Model Context Protocol](https://modelcontextprotocol.io/)
