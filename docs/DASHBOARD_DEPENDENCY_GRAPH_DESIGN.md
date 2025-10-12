# Dashboard Dependency Graph - 詳細設計書

## 1. 概要

### 1.1 目的
Miyabiダッシュボードで、Issue間の依存関係を視覚的に表示し、タスクフローとAgent割り当てを明確化する。

**🆕 拡張目標**: Issue内のTask/Sub-task/Todoの階層的な依存関係も可視化

### 1.2 現状の問題
- **問題1**: GitHubのIssueに `agent:*` および `state:*` ラベルが不足
- **問題2**: Issue本文に依存関係の記述が不足
- **問題3**: 🆕 Task/Sub-taskレベルの依存関係が可視化されていない
- **結果**: ダッシュボードでエッジ(依存関係の矢印)が表示されない

### 1.3 目標

**レベル1: Issue間の依存関係**（既存実装）
- ✅ Issue → Agent エッジを自動生成
- ✅ Agent → State エッジを自動生成
- ✅ Issue → Issue 依存関係エッジを自動生成
- ✅ デモ用モックデータモード実装

**レベル2: Task/Sub-task階層の依存関係**（🆕 新規）
- 🎯 Issue → Task エッジを生成
- 🎯 Task → Sub-task エッジを生成
- 🎯 Sub-task → Todo エッジを生成
- 🎯 Task/Sub-task間の依存関係を可視化
- 🎯 階層構造の折りたたみ/展開機能

---

## 2. アーキテクチャ

### 2.1 システム構成

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React + ReactFlow)                             │
│ - FlowCanvas.tsx: グラフ描画                              │
│ - IssueNode.tsx: Issueノード                             │
│ - AgentNode.tsx: Agentノード                             │
│ - StateNode.tsx: Stateノード                             │
└──────────────────┬──────────────────────────────────────┘
                   │ WebSocket
                   │ (graph:update event)
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Backend (Node.js + Express)                              │
│ - server.ts: WebSocketサーバー                           │
│ - graph-builder.ts: グラフデータ生成                     │
│   - buildFullGraph(): 全Issueからグラフ生成              │
│   - createIssueToAgentEdges(): Issue→Agentエッジ         │
│   - createAgentToStateEdges(): Agent→Stateエッジ         │
│   - createDependencyEdges(): Issue→Issue依存関係エッジ   │
└──────────────────┬──────────────────────────────────────┘
                   │ GitHub API
                   │ (REST API v3)
                   ▼
┌─────────────────────────────────────────────────────────┐
│ GitHub Repository                                        │
│ - Issues: タスク管理                                     │
│ - Labels: 状態・Agent・優先度管理                       │
│ - Issue Body: 依存関係記述                              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 データフロー

```
1. graph-builder.ts が GitHub API から Issue データを取得
   ↓
2. Issue のラベルと本文を解析
   - agent:* ラベル → Issue→Agentエッジ生成
   - state:* ラベル → Agent→Stateエッジ生成
   - "Depends on #N" → Issue→Issueエッジ生成
   ↓
3. GraphData { nodes[], edges[] } を生成
   ↓
4. WebSocket で Frontend に送信
   ↓
5. ReactFlow が受信して可視化
```

---

## 3. 詳細設計

### 3.1 エッジ生成ロジックの拡張

#### 3.1.1 現状のエッジ生成

**packages/dashboard-server/src/graph-builder.ts:213-218**

```typescript
const edges: GraphEdge[] = [
  ...this.createIssueToAgentEdges(issueNodes),
  ...this.createAgentToStateEdges(issueNodes),
  ...this.createStateFlowEdges(),
  ...this.createDependencyEdges(issues), // ✅ 既に実装済み
];
```

#### 3.1.2 エッジ生成の条件

| エッジタイプ | 条件 | 実装箇所 | ステータス |
|-------------|------|---------|-----------|
| Issue → Agent | `🤖 agent:codegen` などのラベルが付与されている | graph-builder.ts:455-465 | ✅ 実装済み |
| Agent → State | `📥 state:pending` などのラベルが付与されている | graph-builder.ts:498-511 | ✅ 実装済み |
| State → State | 状態フロー（pending→analyzing→...） | graph-builder.ts:543-581 | ✅ 実装済み |
| Issue → Issue | Issue本文に `Depends on #123` などの記述 | graph-builder.ts:653-778 | ✅ 実装済み |

**結論**: エッジ生成ロジックは**既に完全実装済み**。問題はデータ不足。

### 3.2 解決策の設計

#### 3.2.1 解決策1: ラベル自動付与機能

**目的**: 既存のIssueに不足しているラベルを自動で付与

**実装場所**: `packages/dashboard-server/src/utils/label-auto-assign.ts`

**アルゴリズム**:

```typescript
export class LabelAutoAssigner {
  /**
   * Issue のタイトル・本文・ラベルから適切な agent: ラベルを推論
   */
  async inferAgentLabels(issue: GitHubIssue): Promise<string[]> {
    const keywords = {
      codegen: ['コード生成', 'implement', '実装', 'feature'],
      review: ['レビュー', 'review', '品質', 'quality'],
      pr: ['Pull Request', 'PR作成', 'merge'],
      deployment: ['デプロイ', 'deploy', 'CI/CD'],
      issue: ['Issue分析', 'ラベル', 'label'],
    };

    const inferredAgents: string[] = [];
    const text = `${issue.title} ${issue.body || ''}`.toLowerCase();

    for (const [agent, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word.toLowerCase()))) {
        inferredAgents.push(`🤖 agent:${agent}`);
      }
    }

    // デフォルト: agent:coordinator
    if (inferredAgents.length === 0) {
      inferredAgents.push('🤖 agent:coordinator');
    }

    return inferredAgents;
  }

  /**
   * Issue の現在のラベルから state: を推論
   */
  async inferStateLabel(issue: GitHubIssue): Promise<string> {
    const existingLabels = issue.labels.map(l => l.name);

    // 既に state: ラベルがあればそのまま返す
    const existingState = existingLabels.find(l => l.includes('state:'));
    if (existingState) {
      return existingState;
    }

    // Issue が open なら pending, closed なら done
    return issue.state === 'open' ? '📥 state:pending' : '✅ state:done';
  }

  /**
   * Issue にラベルを一括追加
   */
  async applyLabels(
    issue: GitHubIssue,
    octokit: Octokit,
    owner: string,
    repo: string
  ): Promise<void> {
    const agentLabels = await this.inferAgentLabels(issue);
    const stateLabel = await this.inferStateLabel(issue);

    const labelsToAdd = [...agentLabels, stateLabel];
    const existingLabels = issue.labels.map(l => l.name);

    // 既存ラベルと重複しないものだけ追加
    const newLabels = labelsToAdd.filter(l => !existingLabels.includes(l));

    if (newLabels.length > 0) {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: issue.number,
        labels: newLabels,
      });

      console.log(`✅ Added labels to Issue #${issue.number}:`, newLabels);
    }
  }
}
```

#### 3.2.2 解決策2: モックデータモード

**目的**: 即座にグラフを確認できるようにデモ用データを生成

**実装場所**: `packages/dashboard-server/src/graph-builder.ts`

**環境変数**: `GRAPH_MOCK_MODE=true`

**モックデータの仕様**:

```typescript
/**
 * モックグラフデータ生成
 */
private generateMockGraph(): GraphData {
  // 5つのIssue
  const mockIssues = [
    { number: 1, title: 'User Authentication', agent: 'codegen', state: 'implementing' },
    { number: 2, title: 'Code Review', agent: 'review', state: 'reviewing', dependsOn: [1] },
    { number: 3, title: 'Create PR', agent: 'pr', state: 'pending', dependsOn: [2] },
    { number: 4, title: 'Deploy to Staging', agent: 'deployment', state: 'pending', dependsOn: [3] },
    { number: 5, title: 'Documentation Update', agent: 'codegen', state: 'implementing' },
  ];

  const issueNodes: IssueNode[] = mockIssues.map((issue, index) => ({
    id: `issue-${issue.number}`,
    type: 'issue',
    position: { x: 100, y: index * 200 },
    data: {
      number: issue.number,
      title: issue.title,
      state: issue.state,
      labels: [`🤖 agent:${issue.agent}`, `📥 state:${issue.state}`],
      assignedAgents: [issue.agent],
      priority: '📊 priority:P2-Medium',
    },
  }));

  const agentNodes: AgentNode[] = ['codegen', 'review', 'pr', 'deployment'].map((agent, index) => ({
    id: `agent-${agent}`,
    type: 'agent',
    position: { x: 650, y: index * 200 },
    data: {
      name: agent,
      agentId: agent,
      status: 'idle',
      progress: 0,
    },
  }));

  const stateNodes: StateNode[] = ['pending', 'implementing', 'reviewing', 'done'].map((state, index) => ({
    id: `state-${state}`,
    type: 'state',
    position: { x: 1200, y: index * 200 },
    data: {
      label: state,
      emoji: '📥',
      count: 1,
      color: '#6366F1',
    },
  }));

  // エッジ生成
  const issueToAgentEdges = issueNodes.flatMap(issue =>
    issue.data.assignedAgents.map(agent => ({
      id: `${issue.id}-to-agent-${agent}`,
      source: issue.id,
      target: `agent-${agent}`,
      type: 'smoothstep' as const,
      animated: true,
      style: { stroke: '#8B5CF6', strokeWidth: 3 },
    }))
  );

  const agentToStateEdges = issueNodes.flatMap(issue =>
    issue.data.assignedAgents.map(agent => ({
      id: `agent-${agent}-to-state-${issue.data.state}`,
      source: `agent-${agent}`,
      target: `state-${issue.data.state}`,
      type: 'smoothstep' as const,
      style: { stroke: '#10B981', strokeWidth: 2.5 },
    }))
  );

  const dependencyEdges = mockIssues
    .filter(issue => issue.dependsOn)
    .flatMap(issue =>
      issue.dependsOn!.map(depNumber => ({
        id: `dep-${issue.number}-depends-${depNumber}`,
        source: `issue-${depNumber}`,
        target: `issue-${issue.number}`,
        type: 'smoothstep' as const,
        label: '⚙️ depends on',
        style: { stroke: '#FB923C', strokeWidth: 2.5, strokeDasharray: '5,5' },
      }))
    );

  return {
    nodes: [...issueNodes, ...agentNodes, ...stateNodes],
    edges: [...issueToAgentEdges, ...agentToStateEdges, ...dependencyEdges],
  };
}
```

#### 3.2.3 解決策3: 依存関係記述の自動検出強化

**目的**: Issue本文から依存関係をより柔軟に検出

**現在のパターン** (graph-builder.ts:624):
```typescript
const unifiedPattern = /(?:(depends on|requires|needs|blocked by|waiting for)|(blocks|blocking)|(related to|see also))\s+#(\d+)/gi;
```

**拡張パターン**:
```typescript
const enhancedPattern = /(?:
  (depends?\s+on|requires?|needs?|blocked\s+by|waiting\s+for|prerequisite) |
  (blocks?|blocking) |
  (related\s+to|see\s+also|references?|linked\s+to)
)\s*:?\s*#?(\d+)/gix;
```

**追加サポート**:
- タスクリスト形式: `- [ ] Depends on #123`
- Markdown形式: `**Depends on**: #123`
- カンマ区切り: `Depends on #123, #456`

---

## 4. 実装計画

### 4.1 フェーズ1: モックデータモード実装（最優先）

**目的**: 即座にグラフ動作を確認

**タスク**:
1. ✅ `generateMockGraph()` メソッド実装
2. ✅ 環境変数 `GRAPH_MOCK_MODE` 追加
3. ✅ `buildFullGraph()` でモック切り替え
4. ✅ ダッシュボード起動確認

**所要時間**: 1時間

**優先度**: P0 (最高)

### 4.2 フェーズ2: ラベル自動付与機能

**目的**: 既存Issueにラベルを自動で付与

**タスク**:
1. ✅ `LabelAutoAssigner` クラス実装
2. ✅ キーワードベースAgent推論
3. ✅ State推論ロジック
4. ✅ GitHub APIでラベル追加
5. ✅ テスト実装

**所要時間**: 3時間

**優先度**: P1 (高)

### 4.3 フェーズ3: 依存関係検出強化

**目的**: Issue本文からの依存関係検出を強化

**タスク**:
1. ✅ 拡張正規表現パターン実装
2. ✅ タスクリスト形式対応
3. ✅ カンマ区切り対応
4. ✅ テスト実装

**所要時間**: 2時間

**優先度**: P2 (中)

### 4.4 フェーズ4: UIエンハンスメント

**目的**: グラフの視認性向上

**タスク**:
1. ✅ エッジの色・太さ最適化
2. ✅ ノードレイアウト改善
3. ✅ ツールチップ追加
4. ✅ フィルター機能

**所要時間**: 4時間

**優先度**: P3 (低)

---

## 5. 実装の詳細

### 5.1 モックデータモードの実装

**ファイル**: `packages/dashboard-server/src/graph-builder.ts`

**変更点**:

```typescript
async buildFullGraph(): Promise<GraphData> {
  // 🆕 モックモードチェック
  if (process.env.GRAPH_MOCK_MODE === 'true') {
    console.log('🎭 Mock mode enabled - returning mock graph data');
    return this.generateMockGraph();
  }

  // 既存のロジック
  const issues = await this.fetchOpenIssues();
  // ...
}
```

### 5.2 ラベル自動付与の統合

**ファイル**: `packages/dashboard-server/src/server.ts`

**新規エンドポイント**:

```typescript
// POST /api/auto-label
app.post('/api/auto-label', async (req, res) => {
  try {
    const assigner = new LabelAutoAssigner();
    const issues = await graphBuilder.fetchOpenIssues();

    for (const issue of issues) {
      await assigner.applyLabels(issue, octokit, owner, repo);
    }

    res.json({ success: true, labeled: issues.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**フロントエンドからの呼び出し**:

```typescript
// packages/dashboard/src/components/FlowCanvas.tsx
const handleAutoLabel = async () => {
  const response = await fetch('http://localhost:3001/api/auto-label', {
    method: 'POST',
  });
  const result = await response.json();
  console.log('✅ Auto-labeled', result.labeled, 'issues');
};
```

---

## 6. テスト計画

### 6.1 ユニットテスト

**packages/dashboard-server/tests/graph-builder.test.ts**

```typescript
describe('GraphBuilder', () => {
  describe('createDependencyEdges', () => {
    it('should create edges for "Depends on #123"', () => {
      const issues = [
        { number: 1, body: 'Depends on #2', labels: [] },
        { number: 2, body: null, labels: [] },
      ];
      const edges = builder.createDependencyEdges(issues);
      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe('issue-2');
      expect(edges[0].target).toBe('issue-1');
    });

    it('should create edges for "Blocks #456"', () => {
      // ...
    });
  });

  describe('Mock mode', () => {
    it('should return mock data when GRAPH_MOCK_MODE=true', async () => {
      process.env.GRAPH_MOCK_MODE = 'true';
      const graph = await builder.buildFullGraph();
      expect(graph.nodes.length).toBeGreaterThan(0);
      expect(graph.edges.length).toBeGreaterThan(0);
    });
  });
});
```

### 6.2 統合テスト

**packages/dashboard-server/tests/integration/graph-api.test.ts**

```typescript
describe('Graph API', () => {
  it('should return graph data with edges', async () => {
    const response = await request(app).get('/api/graph');
    expect(response.status).toBe(200);
    expect(response.body.edges).toBeInstanceOf(Array);
  });

  it('should auto-label issues', async () => {
    const response = await request(app).post('/api/auto-label');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

### 6.3 E2Eテスト

**packages/dashboard/tests/e2e/graph-display.spec.ts**

```typescript
describe('Dashboard Graph Display', () => {
  it('should display issue nodes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('[data-testid="issue-node"]');
    const nodes = await page.locator('[data-testid="issue-node"]').count();
    expect(nodes).toBeGreaterThan(0);
  });

  it('should display edges between nodes', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForSelector('.react-flow__edge');
    const edges = await page.locator('.react-flow__edge').count();
    expect(edges).toBeGreaterThan(0);
  });
});
```

---

## 7. パフォーマンス最適化

### 7.1 キャッシュ戦略

**現状**: graph-builder.ts:59-96でLRUキャッシュ実装済み

**最適化**:
- キャッシュTTL: 5分（環境変数 `GRAPH_CACHE_TTL`）
- 最大エントリ数: 100
- LRU eviction: 最も古いエントリを自動削除

### 7.2 エッジ生成の最適化

**現状の計算量**:
- Issue数: N
- Agent数: A (固定6個)
- State数: S (固定5個)
- 計算量: O(N × A) + O(N × S) + O(N²) (依存関係)

**最適化案**:
```typescript
// Set を使った O(1) ルックアップ
const validIssueNumbers = new Set(issues.map(i => i.number));

// 依存関係エッジ生成を O(N) に削減
deps.dependsOn.forEach(depNumber => {
  if (validIssueNumbers.has(depNumber)) {
    // エッジ生成
  }
});
```

---

## 8. 運用計画

### 8.1 デプロイ手順

```bash
# 1. 環境変数設定
export GITHUB_TOKEN=ghp_xxx
export GRAPH_MOCK_MODE=false  # 本番環境
export GRAPH_CACHE_TTL=300000  # 5分

# 2. ビルド
npm run dashboard:build

# 3. サーバー起動
npm run dashboard:server

# 4. フロントエンド起動
npm run dashboard:frontend
```

### 8.2 モニタリング

**メトリクス**:
- エッジ生成時間
- キャッシュヒット率
- WebSocket接続数
- エラー率

**ログ**:
```typescript
console.log('📊 Graph generation:',{
  nodes: graph.nodes.length,
  edges: graph.edges.length,
  duration: `${duration}ms`,
  cacheHitRate: `${hitRate}%`,
});
```

### 8.3 トラブルシューティング

| 症状 | 原因 | 解決策 |
|-----|------|-------|
| エッジが表示されない | ラベル不足 | `/api/auto-label` 実行 |
| グラフが遅い | キャッシュミス | `GRAPH_CACHE_TTL` 増加 |
| WebSocket切断 | ネットワーク | 自動再接続実装済み |

---

## 9. ドキュメント

### 9.1 ユーザーガイド

**packages/dashboard/README.md** に追加:

```markdown
## 依存関係グラフの使い方

### エッジの種類

- **紫色の矢印**: Issue → Agent (タスク割り当て)
- **緑色の矢印**: Agent → State (進捗状態)
- **オレンジ色の破線**: Issue → Issue (依存関係)
- **赤色の破線**: Issue → Issue (ブロック)

### ラベルの付け方

グラフにエッジを表示するには、Issueに以下のラベルを付与してください：

1. **Agent ラベル**: `🤖 agent:codegen`, `🤖 agent:review` など
2. **State ラベル**: `📥 state:pending`, `🏗️ state:implementing` など

### 自動ラベル付与

既存のIssueにラベルを自動で付与するには：

```bash
curl -X POST http://localhost:3001/api/auto-label
```

### モックモードで確認

デモ用データでグラフを確認するには：

```bash
export GRAPH_MOCK_MODE=true
npm run dashboard:dev
```
```

### 9.2 開発者ガイド

**docs/DASHBOARD_DEPENDENCY_GRAPH_DESIGN.md** (このファイル)

---

## 10. 今後の拡張

### 10.1 Phase 2 機能

- [ ] AI駆動のAgent自動割り当て
- [ ] リアルタイム進捗追跡
- [ ] Critical Path可視化
- [ ] タスク実行時間推定

### 10.2 Phase 3 機能

- [ ] 3Dグラフ表示
- [ ] タイムライン表示
- [ ] カスタムエッジタイプ
- [ ] グラフのエクスポート（PNG, SVG）

---

## 11. まとめ

### 11.1 実装完了の定義

- [x] モックデータモード実装
- [ ] ラベル自動付与機能実装
- [ ] 依存関係検出強化
- [ ] ユニットテスト 80%+ カバレッジ
- [ ] E2Eテスト 全シナリオ通過
- [ ] ドキュメント完備

### 11.2 次のステップ

1. **即座**: モックデータモード実装（1時間）
2. **短期**: ラベル自動付与機能（3時間）
3. **中期**: 依存関係検出強化（2時間）
4. **長期**: UIエンハンスメント（4時間）

---

🌸 **Miyabi Dashboard** - 依存関係を美しく可視化
