# MCP コスト最適化ガイド

ヘッドレスモードでMCPツールを使用する際のコスト最適化戦略です。

## 🎯 基本原則

### ✅ MCPツールを使う場面

1. **GitHub操作が必須**
   ```bash
   # Issue作成、PR作成、ラベル管理
   npm run claude-headless -- "Issue #270をreviewingに変更" --mcp-servers github-enhanced
   ```

2. **リアルタイム診断が必要**
   ```bash
   # TypeScriptエラー、テスト結果
   npm run claude-headless -- "現在のTSエラーを確認" --mcp-servers ide-integration
   ```

3. **並列実行が必須**
   ```bash
   # 複数Issueの同時処理
   npm run agents:parallel:exec -- --issues=270,271,272 --concurrency=3
   ```

### ❌ MCPツールを使わない方が良い場面

1. **静的情報の取得**
   ```bash
   # ❌ コスト: $0.01
   npm run claude-headless -- "依存関係を教えて" --mcp-servers project-context

   # ✅ コスト: $0.002 (90%削減)
   npm run claude-headless -- "依存関係を教えて" --no-mcp
   # CLAUDE.mdから自動的に情報を取得
   ```

2. **単純な質問**
   ```bash
   # ❌ 不要なMCP接続
   npm run claude-headless -- "プロジェクト構造を説明して" --mcp-servers project-context

   # ✅ プロンプトで直接質問
   npm run claude-headless -- "プロジェクト構造を説明して" --no-mcp
   ```

## 💰 コスト詳細

### Claude Sonnet 4 料金（2025年版）

| 項目 | 料金 |
|------|------|
| Input | $3 / 1M tokens |
| Output | $15 / 1M tokens |
| Cache Write | $3.75 / 1M tokens |
| Cache Read | $0.30 / 1M tokens (90%削減) |

### MCPツール使用時のコスト

```
1回のツール呼び出し:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
リクエスト（ツール定義含む）    500-1000 tokens
↓
ツール実行                      0 tokens (無料)
↓
結果                           200-500 tokens
↓
最終応答                       200-1000 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
合計: 約900-2500 tokens
コスト: $0.0027 - $0.0375 / 回
```

### 比較: MCPあり vs なし

| シナリオ | MCPなし | MCPあり | 差分 |
|---------|---------|---------|------|
| 単純な質問 | $0.002 | $0.010 | 5倍 |
| GitHub操作 | 不可 | $0.015 | 必須 |
| 診断情報 | 不正確 | $0.020 | 正確性重視 |
| 並列実行 | 遅い | $0.150 | 3倍速 |

## 🔧 実践的な使用例

### 例1: Issue処理（コスト重視）

```bash
# ステップ1: Issue内容を確認（MCPなし）
npm run claude-headless -- "Issue #270の要約を教えて" --no-mcp
# コスト: $0.003

# ステップ2: 必要ならGitHub操作（MCP使用）
npm run claude-headless -- "Issue #270をin_progressに更新" --mcp-servers github-enhanced
# コスト: $0.015

# 合計: $0.018
```

### 例2: コードレビュー（精度重視）

```bash
# リアルタイム診断が必須
npm run claude-headless -- "agents/coordinator/*.tsのTSエラーをチェック" \
  --mcp-servers ide-integration --verbose
# コスト: $0.025
# 時間: 10秒
```

### 例3: 並列実行（効率重視）

```bash
# 3つのIssueを並列処理
npm run agents:parallel:exec -- --issues=270,271,272 --concurrency=3
# コスト: $0.120 (各Issue $0.040)
# 時間: 30分（順次なら90分）
# 時間短縮効果: 60分節約
```

## 📊 コスト見積もりツール

### 計算式

```typescript
// 単一実行
const estimateCost = (withMCP: boolean) => {
  const baseTokens = 500; // プロンプト
  const mcpOverhead = withMCP ? 1000 : 0; // MCP定義
  const responseTokens = 500; // 応答

  const inputCost = (baseTokens + mcpOverhead) * 3 / 1000000;
  const outputCost = responseTokens * 15 / 1000000;

  return inputCost + outputCost;
};

console.log('MCPなし:', estimateCost(false)); // $0.0090
console.log('MCPあり:', estimateCost(true));  // $0.0120
```

### 並列実行

```typescript
const estimateParallel = (issueCount: number, costPerIssue: number) => {
  const totalCost = issueCount * costPerIssue;
  const overhead = issueCount * 0.01; // 並列化オーバーヘッド

  return {
    cost: totalCost + overhead,
    timeSerial: issueCount * 30, // 分
    timeParallel: 30, // 分
    timeSaved: (issueCount - 1) * 30, // 分
  };
};

console.log(estimateParallel(5, 0.040));
// {
//   cost: $0.25,
//   timeSerial: 150分,
//   timeParallel: 30分,
//   timeSaved: 120分
// }
```

## 🚀 並列実行の最適化

### パターン1: 独立したIssue

```bash
# 各Issueは完全に独立
npm run agents:parallel:exec -- --issues=270,271,272

# 推奨設定:
# - concurrency: 2-3（並列数）
# - maxCost: 0.10 / Issue（予算制限）
# - timeout: 600000（10分）
```

### パターン2: 依存関係あり

```bash
# Issue #271はIssue #270に依存
npm run agents:parallel:exec -- --issues=270 --wait
npm run agents:parallel:exec -- --issues=271,272 --concurrency=2

# DAG自動解決:
# CoordinatorAgentが依存関係を解析
# → 自動的に順次/並列を決定
```

### パターン3: バッチ処理

```bash
# 10個のIssueを2個ずつ処理
for i in {1..5}; do
  npm run agents:parallel:exec -- \
    --issues=$((270 + i*2 - 2)),$((270 + i*2 - 1)) \
    --concurrency=2
done

# コスト: $0.40
# 時間: 150分（順次なら300分）
```

## 💡 コスト削減テクニック

### 1. Prompt Caching活用

```typescript
// CLAUDE.mdをシステムプロンプトに含める
// → 自動的にキャッシュされる
const systemPrompt = fs.readFileSync('CLAUDE.md', 'utf-8');

// 90%のコスト削減
// 通常: $0.015
// キャッシュ: $0.0015
```

### 2. バッチAPIの使用

```bash
# ❌ 個別に呼び出し（5回）
for issue in 270 271 272 273 274; do
  npm run claude-headless -- "Issue #$issue を確認"
done
# コスト: 5 × $0.010 = $0.050

# ✅ 一括で処理（1回）
npm run claude-headless -- "Issue #270-274 を一括確認"
# コスト: $0.012
```

### 3. 条件付きMCP使用

```typescript
// 必要な時だけMCPを使用
const needsGitHub = checkIfGitHubNeeded(task);

if (needsGitHub) {
  await executeWithMCP(['github-enhanced']);
} else {
  await executeWithoutMCP();
}

// 平均50%のコスト削減
```

### 4. MCPサーバーの選択的使用

```bash
# ❌ すべてのMCPサーバーに接続
npm run claude-headless -- "プロンプト" --mcp-servers project-context,github-enhanced,ide-integration
# コスト: $0.035

# ✅ 必要なサーバーのみ
npm run claude-headless -- "プロンプト" --mcp-servers github-enhanced
# コスト: $0.018
```

## 📈 ROI分析

### シナリオ1: 単純作業の自動化

```
手動作業: 10分/Issue × $50/時間 = $8.33/Issue
自動化コスト: $0.040/Issue

ROI: 208倍の効率化
```

### シナリオ2: 並列実行

```
順次実行: 150分（5 Issues × 30分）
並列実行: 30分（3並列）

節約時間: 120分 = $100相当
追加コスト: $0.15

ROI: 666倍の効率化
```

### シナリオ3: 品質向上

```
手動レビュー: 30分/PR × $75/時間 = $37.50/PR
自動レビュー: $0.025/PR + 人間確認5分 = $6.25/PR

削減: $31.25/PR（83%削減）
```

## 🎯 推奨戦略

### 小規模プロジェクト（1-5 Issues/日）

```bash
# MCPを最小限に
- 静的情報はCLAUDE.mdから取得
- GitHub操作のみMCP使用
- 月額コスト: $5-10
```

### 中規模プロジェクト（10-50 Issues/日）

```bash
# バランス型
- 並列実行を活用（concurrency=2）
- Prompt Caching活用
- 月額コスト: $50-100
```

### 大規模プロジェクト（50+ Issues/日）

```bash
# 高速化優先
- 並列実行を最大化（concurrency=5）
- バッチ処理
- 専用API予算確保
- 月額コスト: $200-500
```

## 📝 チェックリスト

実行前に確認：

- [ ] MCPツールは本当に必要か？
- [ ] 並列実行で効率化できるか？
- [ ] Prompt Cachingを活用しているか？
- [ ] 必要最小限のMCPサーバーのみ接続しているか？
- [ ] コスト予算を設定しているか？

## 🔗 関連ドキュメント

- [MCP_INTEGRATION_REPORT.md](./MCP_INTEGRATION_REPORT.md) - 接続状態診断
- [CLAUDE_HEADLESS_MODE.md](./CLAUDE_HEADLESS_MODE.md) - 使用方法
- [Anthropic Pricing](https://www.anthropic.com/pricing) - 最新料金
