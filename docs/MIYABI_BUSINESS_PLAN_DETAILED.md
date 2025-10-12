# Miyabi 詳細ビジネスプラン - 受託開発営業フロント

**作成日**: 2025-10-11
**Version**: 2.0 Detailed
**ステータス**: **実装可能レベル**

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [価格設定の根拠](#価格設定の根拠)
3. [技術実装詳細](#技術実装詳細)
4. [オペレーションフロー](#オペレーションフロー)
5. [契約書・SLA](#契約書sla)
6. [リスク管理](#リスク管理)
7. [顧客獲得戦略](#顧客獲得戦略)
8. [競合分析](#競合分析)
9. [財務計画](#財務計画)
10. [法務・税務](#法務税務)

---

## 1. エグゼクティブサマリー

### ビジネスモデル

**Miyabi = AI自動実装 + 人間による品質保証**

```
┌────────────────────────────────────────────────────┐
│ 顧客                                               │
│   ↓ Issue作成（予算30万円〜）                      │
├────────────────────────────────────────────────────┤
│ Miyabi AI（自動実装）                              │
│   - 成功率: 70-80%                                 │
│   - コスト: 5万円（API料金 + インフラ）            │
│   - 納期: 1-3日                                    │
├────────────────────────────────────────────────────┤
│ 人間エンジニア（品質保証 or 修正）                 │
│   - 介入率: 20-30%                                 │
│   - コスト: 時給1万円 × 作業時間                   │
│   - 納期: +3-7日                                   │
├────────────────────────────────────────────────────┤
│ 成果物納品                                         │
│   ✅ 品質保証済みコード                            │
│   ✅ テストコード（カバレッジ80%+）                │
│   ✅ ドキュメント                                  │
└────────────────────────────────────────────────────┘
```

### 収益構造

| 項目 | Year 1 | Year 2 | Year 3 |
|------|--------|--------|--------|
| 月次案件数 | 50件 | 100件 | 200件 |
| 平均単価 | 40万円 | 50万円 | 60万円 |
| 月次収益 | 2,000万円 | 5,000万円 | 1.2億円 |
| **年間収益** | **2.4億円** | **6億円** | **14.4億円** |
| 営業利益率 | 30% | 40% | 45% |
| **営業利益** | **7,200万円** | **2.4億円** | **6.5億円** |

---

## 2. 価格設定の根拠

### 2.1 コスト構造の詳細分析

#### AI実装コスト（1案件あたり）

```typescript
// Claude Sonnet 4 API料金
const API_COST = {
  input: 3.00 / 1_000_000,   // $3 per 1M tokens
  output: 15.00 / 1_000_000, // $15 per 1M tokens
};

// 平均的なタスクのトークン使用量
const AVERAGE_TASK = {
  input_tokens: 100_000,     // 100K tokens
  output_tokens: 50_000,     // 50K tokens
};

// 1案件のAPI料金
const api_cost =
  (AVERAGE_TASK.input_tokens * API_COST.input) +
  (AVERAGE_TASK.output_tokens * API_COST.output);
// = $0.30 + $0.75 = $1.05 ≈ 150円

// インフラコスト（Cloudflare Workers, D1, R2）
const INFRA_COST = 200; // 月額$200 / 50案件 = $4/案件 ≈ 600円

// 合計AIコスト
const TOTAL_AI_COST = 150 + 600 = 750円/案件
```

**AI成功時の粗利**:
```
販売価格: 5万円
原価: 750円
粗利: 49,250円
粗利率: 98.5%
```

---

#### 人間介入コスト（1案件あたり）

| タスクサイズ | 作業時間 | 人件費 | インフラ | 合計原価 |
|-------------|---------|--------|---------|---------|
| 小（Simple） | 8時間 | 8万円 | 750円 | 80,750円 |
| 中（Medium） | 24時間 | 24万円 | 750円 | 240,750円 |
| 大（Large） | 80時間 | 80万円 | 750円 | 800,750円 |

**人件費内訳**:
- シニアエンジニア: 時給1万円（実装・レビュー）
- ジュニアエンジニア: 時給5千円（テスト・ドキュメント）
- プロジェクトマネージャー: 時給1.5万円（10%の時間）

**人間介入時の粗利**:
```
小タスク:
  販売価格: 30万円
  原価: 80,750円
  粗利: 219,250円
  粗利率: 73%

中タスク:
  販売価格: 80万円
  原価: 240,750円
  粗利: 559,250円
  粗利率: 70%

大タスク:
  販売価格: 200万円
  原価: 800,750円
  粗利: 1,199,250円
  粗利率: 60%
```

---

### 2.2 価格表（詳細版）

#### プラン A: AI実装のみ（ベストエフォート）

| タスク | 価格 | 納期 | 成功保証 |
|--------|------|------|---------|
| 超小 | 5万円 | 1日 | なし |

**条件**:
- AI実装が失敗した場合は全額返金
- 品質保証なし
- テストは基本的なもののみ
- 納期保証なし

**ターゲット**: 予算が限られているスタートアップ

---

#### プラン B: AI + 人間保証（推奨）

| タスクサイズ | AI価格 | 人間介入時 | 合計 | 納期 |
|-------------|--------|-----------|------|------|
| 小 | 5万円 | +25万円 | **30万円** | 1週間 |
| 中 | 10万円 | +70万円 | **80万円** | 2週間 |
| 大 | 20万円 | +180万円 | **200万円** | 1ヶ月 |
| 特大 | 50万円 | +450万円 | **500万円** | 2ヶ月 |

**条件**:
- AIで実装を試行
- 失敗時は人間が修正（追加料金なし）
- 品質保証付き（テストカバレッジ80%+）
- 納期保証（遅延時は全額返金）
- 30日間バグ修正無償

**ターゲット**: 品質を重視する企業

---

#### プラン C: 人間実装（エンタープライズ）

| タスクサイズ | 価格 | 納期 | 保証 |
|-------------|------|------|------|
| 小 | 50万円 | 5日 | フル |
| 中 | 150万円 | 2週間 | フル |
| 大 | 500万円 | 1ヶ月 | フル |
| 特大 | 1,000万円〜 | 要相談 | フル |

**条件**:
- 最初から人間エンジニアが実装
- シニアエンジニア専任
- 99.9% SLA
- 90日間保守無償
- オンサイト対応可能

**ターゲット**: 大企業、金融機関、政府

---

### 2.3 競合比較

| サービス | 価格 | 納期 | 品質 | 自動化率 |
|---------|------|------|------|---------|
| **Miyabi** | 30万円〜 | 1週間 | 高 | 70-80% |
| フリーランス | 50万円〜 | 2週間 | 中〜高 | 0% |
| SIer | 100万円〜 | 1ヶ月 | 高 | 0% |
| オフショア | 20万円〜 | 3週間 | 低〜中 | 0% |
| Devin AI | $500/月 | ? | 低 | 30%? |

**Miyabiの競争優位性**:
1. ✅ **価格**: 従来の受託開発の30-50%
2. ✅ **速度**: 1週間（従来の1/2〜1/4）
3. ✅ **品質**: 人間保証付き（他のAIツールにはない）
4. ✅ **透明性**: 予算・納期が明確

---

## 3. 技術実装詳細

### 3.1 システムアーキテクチャ

```
┌─────────────────────────────────────────────────────┐
│ フロントエンド（Next.js + React）                    │
├─────────────────────────────────────────────────────┤
│ - ランディングページ                                 │
│ - 顧客ダッシュボード（案件進捗確認）                 │
│ - エンジニアダッシュボード（タスク管理）             │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ API層（Cloudflare Workers）                          │
├─────────────────────────────────────────────────────┤
│ - 予算管理API                                        │
│ - タスク割り当てAPI                                  │
│ - 通知API（メール・Slack）                           │
│ - 決済API（Stripe統合）                              │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ AI実装エンジン（miyabi-agent-sdk）                   │
├─────────────────────────────────────────────────────┤
│ - CoordinatorAgent: タスク分解                       │
│ - CodeGenAgent: コード生成（Claude Sonnet 4）       │
│ - ReviewAgent: 品質チェック                          │
│ - PRAgent: Pull Request作成                          │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ データベース（Cloudflare D1 / Supabase）             │
├─────────────────────────────────────────────────────┤
│ - 案件管理テーブル                                   │
│ - 予算管理テーブル                                   │
│ - ユーザー管理テーブル                               │
│ - 作業ログテーブル                                   │
└─────────────────────────────────────────────────────┘
```

---

### 3.2 データベース設計

#### テーブル: `projects`（案件管理）

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  issue_number INTEGER NOT NULL,
  repository VARCHAR(255) NOT NULL,
  owner VARCHAR(255) NOT NULL,

  -- 予算
  budget_total INTEGER NOT NULL,           -- 総予算（円）
  budget_consumed INTEGER DEFAULT 0,       -- 消費額（円）
  budget_remaining INTEGER,                -- 残額（円）

  -- ステータス
  status VARCHAR(50) DEFAULT 'pending',    -- pending, ai-working, human-working, completed, blocked
  ai_success BOOLEAN,                      -- AI実装が成功したか
  quality_score INTEGER,                   -- 品質スコア（0-100）

  -- 納期
  estimated_delivery TIMESTAMP,
  actual_delivery TIMESTAMP,

  -- 料金プラン
  plan VARCHAR(20) NOT NULL,               -- ai-only, ai-human, human-only

  -- タイムスタンプ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT budget_check CHECK (budget_total >= 300000)  -- 最低30万円
);
```

---

#### テーブル: `tasks`（タスク分解）

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),

  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_size VARCHAR(20),                   -- small, medium, large

  -- 割り当て
  assigned_to UUID REFERENCES users(id),   -- NULL = AI実装
  status VARCHAR(50) DEFAULT 'pending',

  -- 工数
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),

  -- コスト
  estimated_cost INTEGER,
  actual_cost INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

#### テーブル: `work_logs`（作業ログ）

```sql
CREATE TABLE work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  engineer_id UUID REFERENCES users(id),

  -- 作業内容
  log_type VARCHAR(50),                    -- ai-attempt, human-coding, review, testing
  description TEXT,

  -- 時間
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  duration_minutes INTEGER,

  -- コスト
  cost INTEGER,                            -- この作業のコスト（円）

  -- AI関連
  ai_provider VARCHAR(50),                 -- claude, gpt-4, etc
  tokens_used INTEGER,
  api_cost INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.3 AI vs 人間の判断ロジック（詳細）

#### Step 1: AI実装の実行

```typescript
interface AIImplementationConfig {
  maxAttempts: number;      // 最大試行回数（デフォルト: 3）
  timeout: number;          // タイムアウト（秒）
  qualityThreshold: number; // 品質スコア閾値（デフォルト: 80）
}

async function executeAIImplementation(
  project: Project,
  config: AIImplementationConfig
): Promise<AIResult> {
  let attempts = 0;
  let bestResult: AIResult | null = null;

  while (attempts < config.maxAttempts) {
    attempts++;

    console.log(`AI実装 試行 ${attempts}/${config.maxAttempts}`);

    // CoordinatorAgent: タスク分解
    const coordinator = new CoordinatorAgent({
      githubToken: process.env.GITHUB_TOKEN,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    const decomposition = await coordinator.decompose({
      issueNumber: project.issue_number,
      repository: project.repository,
      owner: project.owner,
    });

    // CodeGenAgent: 各タスクを実装
    const codegen = new CodeGenAgent({
      githubToken: process.env.GITHUB_TOKEN,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    const implementations = await Promise.all(
      decomposition.tasks.map(task =>
        codegen.generate({
          issueNumber: project.issue_number,
          repository: project.repository,
          owner: project.owner,
          taskDescription: task.description,
        })
      )
    );

    // ReviewAgent: 品質チェック
    const review = new ReviewAgent({
      githubToken: process.env.GITHUB_TOKEN,
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    });

    const qualityReport = await review.review({
      files: implementations.flatMap(impl => impl.files),
      standards: {
        minQualityScore: config.qualityThreshold,
        requireTests: true,
        securityScan: true,
      },
    });

    // 結果の評価
    const result: AIResult = {
      attempt: attempts,
      qualityScore: qualityReport.qualityScore,
      testsPassed: qualityReport.testsPassed,
      securityIssues: qualityReport.securityIssues.length,
      implementations,
      qualityReport,
    };

    // ベスト結果を更新
    if (!bestResult || result.qualityScore > bestResult.qualityScore) {
      bestResult = result;
    }

    // 成功判定
    if (
      result.qualityScore >= config.qualityThreshold &&
      result.testsPassed &&
      result.securityIssues === 0
    ) {
      console.log(`✅ AI実装成功（試行 ${attempts}）`);
      return result;
    }

    console.log(`⚠️ AI実装失敗（品質スコア: ${result.qualityScore}）`);
  }

  // 全試行失敗
  console.log(`❌ AI実装完全失敗（最高スコア: ${bestResult?.qualityScore}）`);
  return bestResult!;
}
```

---

#### Step 2: 人間介入の判断

```typescript
interface HumanInterventionDecision {
  shouldIntervene: boolean;
  reason: string;
  estimatedHours: number;
  estimatedCost: number;
  assignedEngineer?: User;
}

async function decideHumanIntervention(
  project: Project,
  aiResult: AIResult
): Promise<HumanInterventionDecision> {
  // 人間介入が必要な条件
  const interventionReasons: string[] = [];

  // 1. 品質スコアが閾値未満
  if (aiResult.qualityScore < 80) {
    interventionReasons.push(
      `品質スコアが基準未満（${aiResult.qualityScore} < 80）`
    );
  }

  // 2. テストが失敗
  if (!aiResult.testsPassed) {
    interventionReasons.push('テストが失敗');
  }

  // 3. セキュリティ問題
  if (aiResult.securityIssues > 0) {
    interventionReasons.push(
      `セキュリティ問題が${aiResult.securityIssues}件検出`
    );
  }

  // 4. タスクの複雑度が高い
  const complexity = await estimateComplexity(project);
  if (complexity.score > 8) {
    interventionReasons.push(
      `タスクの複雑度が高い（${complexity.score}/10）`
    );
  }

  // 人間介入が不要
  if (interventionReasons.length === 0) {
    return {
      shouldIntervene: false,
      reason: 'AI実装が基準を満たしています',
      estimatedHours: 0,
      estimatedCost: 0,
    };
  }

  // 人間介入が必要
  // 工数見積もり
  const estimatedHours = calculateHumanHours(aiResult, complexity);
  const estimatedCost = estimatedHours * 10000; // 時給1万円

  // エンジニア割り当て
  const assignedEngineer = await findAvailableEngineer({
    requiredSkills: complexity.requiredSkills,
    estimatedHours,
  });

  return {
    shouldIntervene: true,
    reason: interventionReasons.join(', '),
    estimatedHours,
    estimatedCost,
    assignedEngineer,
  };
}

// 人間の作業時間を計算
function calculateHumanHours(
  aiResult: AIResult,
  complexity: Complexity
): number {
  let baseHours = 0;

  // AI品質スコアに基づく補正
  if (aiResult.qualityScore < 50) {
    baseHours = 40; // ほぼゼロから実装
  } else if (aiResult.qualityScore < 70) {
    baseHours = 24; // 大幅修正
  } else {
    baseHours = 8;  // 軽微な修正
  }

  // 複雑度による補正
  const complexityMultiplier = complexity.score / 5;
  baseHours *= complexityMultiplier;

  // テスト作成時間
  if (!aiResult.testsPassed) {
    baseHours += 8;
  }

  // セキュリティ修正時間
  baseHours += aiResult.securityIssues * 2;

  return Math.ceil(baseHours);
}
```

---

#### Step 3: 顧客への通知

```typescript
async function notifyCustomer(
  project: Project,
  decision: HumanInterventionDecision
) {
  if (!decision.shouldIntervene) {
    // AI成功通知
    await sendEmail({
      to: project.client.email,
      subject: `✅ [Miyabi] 自動実装が完了しました（案件 #${project.id}）`,
      html: `
        <h2>AI実装が成功しました！</h2>

        <p>案件 #${project.id} の実装が完了しました。</p>

        <h3>📊 実装結果</h3>
        <ul>
          <li>品質スコア: <strong>95点</strong></li>
          <li>テスト: <strong>全てパス</strong></li>
          <li>セキュリティ: <strong>問題なし</strong></li>
        </ul>

        <h3>💰 予算消費</h3>
        <ul>
          <li>AI実装コスト: <strong>5万円</strong></li>
          <li>残り予算: <strong>25万円</strong></li>
        </ul>

        <h3>📦 成果物</h3>
        <ul>
          <li><a href="${prUrl}">Pull Request</a></li>
          <li>テストカバレッジ: 87%</li>
          <li>ドキュメント: README.md更新済み</li>
        </ul>

        <h3>✅ 次のステップ</h3>
        <ol>
          <li>PRをレビューしてください</li>
          <li>問題なければマージしてください</li>
          <li>不明点があればお気軽にご連絡ください</li>
        </ol>

        <p>
          <a href="${dashboardUrl}">ダッシュボードで詳細を確認</a>
        </p>
      `,
    });

    // Slack通知
    await sendSlack({
      channel: project.client.slackChannel,
      text: `✅ 案件 #${project.id} の自動実装が完了しました`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*案件 #${project.id}* の実装が完了しました\n\n*品質スコア*: 95点\n*消費予算*: 5万円`,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'PRを確認' },
              url: prUrl,
            },
          ],
        },
      ],
    });
  } else {
    // 人間介入通知
    await sendEmail({
      to: project.client.email,
      subject: `🔧 [Miyabi] 人間エンジニアが対応中です（案件 #${project.id}）`,
      html: `
        <h2>人間エンジニアが対応しています</h2>

        <p>案件 #${project.id} について、AI実装が期待通りの品質に達しなかったため、人間エンジニアが修正作業を行っています。</p>

        <h3>🔍 判断理由</h3>
        <p>${decision.reason}</p>

        <h3>👨‍💻 担当エンジニア</h3>
        <p>
          ${decision.assignedEngineer?.name}<br>
          経験年数: ${decision.assignedEngineer?.yearsOfExperience}年<br>
          専門分野: ${decision.assignedEngineer?.specialties.join(', ')}
        </p>

        <h3>📊 見積もり</h3>
        <ul>
          <li>追加作業時間: <strong>${decision.estimatedHours}時間</strong></li>
          <li>追加コスト: <strong>${(decision.estimatedCost / 10000).toFixed(1)}万円</strong></li>
          <li>合計予算: <strong>${((50000 + decision.estimatedCost) / 10000).toFixed(1)}万円</strong>（予算内）</li>
        </ul>

        <h3>📅 納期</h3>
        <p>
          予定納期: <strong>${project.estimated_delivery}</strong><br>
          （変更なし）
        </p>

        <h3>📬 進捗報告</h3>
        <p>
          進捗は毎日メールとSlackでご報告いたします。<br>
          リアルタイムの進捗は<a href="${dashboardUrl}">ダッシュボード</a>でご確認いただけます。
        </p>

        <p>ご不明点があればお気軽にご連絡ください。</p>
      `,
    });
  }
}
```

---

## 4. オペレーションフロー

### 4.1 受注から納品までの完全フロー

```
┌─────────────────────────────────────────────────────┐
│ Day 0: 受注                                          │
├─────────────────────────────────────────────────────┤
│ 1. 顧客がIssue作成（予算・要件を記入）               │
│ 2. 自動で見積もり生成                                │
│ 3. 顧客が承認 → Stripe決済（50%前払い）             │
│ 4. プロジェクト開始                                  │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│ Day 1-2: AI実装                                      │
├─────────────────────────────────────────────────────┤
│ 1. CoordinatorAgent: タスク分解（30分）              │
│ 2. CodeGenAgent: コード生成（2-4時間）               │
│ 3. TestAgent: テスト実行（1時間）                    │
│ 4. ReviewAgent: 品質チェック（1時間）                │
│ 5. PRAgent: Pull Request作成（30分）                 │
│                                                      │
│ 成功率: 70-80%                                       │
└─────────────────────────────────────────────────────┘
                         ↓
                    ┌──────────┐
                    │ 成功？    │
                    └──────────┘
                    /           \
                 ✅ Yes        ❌ No
                  /              \
┌─────────────────────────┐  ┌───────────────────────┐
│ Day 3: AI成功パス        │  │ Day 3-7: 人間介入パス  │
├─────────────────────────┤  ├───────────────────────┤
│ 1. 顧客にPRレビュー依頼  │  │ 1. エンジニア割り当て  │
│ 2. 顧客承認             │  │ 2. コード修正         │
│ 3. 自動マージ           │  │ 3. テスト追加         │
│ 4. 決済完了（残り50%）  │  │ 4. PRレビュー         │
│                         │  │ 5. 顧客承認           │
│ 納期: 3日               │  │ 6. マージ             │
│ コスト: 5万円           │  │ 7. 決済完了           │
└─────────────────────────┘  │                       │
                           │ 納期: 7-10日          │
                           │ コスト: 30万円        │
                           └───────────────────────┘
                                     ↓
                           ┌───────────────────────┐
                           │ Day 10: 納品          │
                           ├───────────────────────┤
                           │ 1. ドキュメント生成   │
                           │ 2. 顧客トレーニング   │
                           │ 3. 30日間保守開始     │
                           └───────────────────────┘
```

---

### 4.2 1日のオペレーション（例）

#### 9:00-10:00: 朝会

- 新規案件レビュー（昨日受注分）
- AI実装結果の確認
- 人間介入案件の進捗確認
- 当日の作業割り当て

#### 10:00-12:00: AI実装モニタリング

- 夜間バッチで実行されたAI実装の結果確認
- エラーがあれば再実行
- 品質スコアが高い案件はPR作成

#### 13:00-17:00: 人間作業

- エンジニアがコード修正
- レビュー作業
- 顧客とのコミュニケーション

#### 17:00-18:00: 夕会 + 顧客報告

- 当日の進捗まとめ
- 顧客への日次レポート送信
- 翌日のAI実行予約

#### 18:00-翌9:00: AI自動実行

- 新規案件の自動実装（バッチ処理）
- テスト実行
- 品質チェック

---

### 4.3 チーム体制

#### 初期（Year 1）

```
CEO（あなた）
├─ プロジェクトマネージャー × 1名
│  └─ 顧客対応・進捗管理
│
├─ シニアエンジニア × 2名
│  └─ コード修正・レビュー
│
├─ ジュニアエンジニア × 2名
│  └─ テスト・ドキュメント
│
└─ インフラエンジニア × 1名（パートタイム）
   └─ システム保守

合計: 6名（フルタイム換算: 5.5名）
```

**人件費**:
- PM: 月80万円 × 1名 = 80万円
- シニア: 月100万円 × 2名 = 200万円
- ジュニア: 月50万円 × 2名 = 100万円
- インフラ: 月40万円 × 0.5名 = 20万円
- **合計**: 400万円/月

---

#### 拡大期（Year 2-3）

```
CEO
├─ CTO × 1名
│  └─ 技術戦略・品質管理
│
├─ プロジェクトマネージャー × 3名
│
├─ シニアエンジニア × 5名
│
├─ ジュニアエンジニア × 5名
│
└─ インフラエンジニア × 2名
```

---

## 5. 契約書・SLA

### 5.1 サービス利用契約書（テンプレート）

```markdown
# Miyabi開発委託契約書

## 第1条（契約の目的）

発注者（以下「甲」という）は、受注者 株式会社Miyabi（以下「乙」という）に対し、
本契約に定める条件により、ソフトウェア開発業務（以下「本件業務」という）を委託し、
乙はこれを受託する。

## 第2条（業務内容）

1. 本件業務の内容は、別紙「要件定義書」に定めるとおりとする。
2. 乙は、AI自動実装システム（以下「AI」という）を使用して本件業務を実施する。
3. AIによる実装が品質基準を満たさない場合、乙は人間エンジニアにより修正を行う。

## 第3条（契約金額）

1. 本件業務の委託料金は、金○○○,○○○円（消費税別）とする。
2. 甲は、契約締結時に委託料金の50%を前払いするものとする。
3. 残金は、成果物の検収完了後、10営業日以内に支払うものとする。

## 第4条（納期）

1. 乙は、契約締結日から○○日以内に成果物を納品するものとする。
2. 天災地変その他不可抗力により納期に遅延が生じる場合、協議の上納期を変更できる。

## 第5条（品質保証）

1. 乙は、以下の品質基準を満たす成果物を納品する。
   - 品質スコア: 80点以上
   - テストカバレッジ: 80%以上
   - セキュリティスキャン: クリティカル問題ゼロ

2. 成果物に瑕疵があった場合、乙は納品後30日間は無償で修正する。

## 第6条（納期遅延時の対応）

1. 乙が納期までに成果物を納品できなかった場合、甲は以下を選択できる。
   - 契約解除・全額返金
   - 納期延長・遅延損害金の請求（1日あたり委託料金の1%）

## 第7条（知的財産権）

1. 成果物の著作権は、検収完了と同時に甲に譲渡される。
2. 乙は、本件業務で得た知見を匿名化した上で、今後の開発に活用できる。

## 第8条（機密保持）

1. 両当事者は、本契約に関して知り得た相手方の機密情報を第三者に開示しない。
2. 機密保持義務は、契約終了後5年間継続する。

## 第9条（損害賠償）

1. 両当事者は、本契約違反により相手方に損害を与えた場合、賠償責任を負う。
2. 賠償額の上限は、委託料金の総額とする。

## 第10条（契約解除）

1. 一方の当事者が本契約に違反した場合、相手方は催告の上、契約を解除できる。
2. 契約解除時、甲は既履行部分に応じた料金を支払うものとする。
```

---

### 5.2 SLA（Service Level Agreement）

| 項目 | 基準 | 未達時の補償 |
|------|------|-------------|
| **納期厳守** | 見積もり納期の100%達成 | 1日遅延ごとに料金の5%減額（最大50%） |
| **品質スコア** | 80点以上 | 80点未満の場合は再実装（無償） |
| **テストカバレッジ** | 80%以上 | 80%未満の場合はテスト追加（無償） |
| **セキュリティ** | クリティカル問題ゼロ | 問題発見時は即座に修正（無償） |
| **バグ修正** | 納品後30日間無償 | 期間内のバグは100%無償修正 |
| **可用性** | 99.9% | ダウンタイムが0.1%を超えた場合、翌月の料金を10%減額 |

---

## 6. リスク管理

### 6.1 主要リスクとその対策

#### リスク 1: AI実装の成功率が想定より低い

**リスク内容**:
- 想定成功率: 70-80%
- 実際の成功率: 50%未満

**影響**:
- 人間介入が増加 → 粗利率低下
- 納期遅延 → 顧客満足度低下

**対策**:
1. **技術対策**:
   - プロンプトエンジニアリング改善
   - RAG（Retrieval-Augmented Generation）導入
   - 過去の成功パターンを学習

2. **ビジネス対策**:
   - 価格設定を見直し（AI成功時: 10万円、人間介入時: 50万円）
   - 「ベストエフォート」プランの導入（AI成功時のみ課金）

3. **オペレーション対策**:
   - シニアエンジニアを追加採用
   - タスク分類の精度向上（簡単なタスクのみAIに）

---

#### リスク 2: 人間エンジニアの確保が困難

**リスク内容**:
- 案件が増えすぎて、エンジニアが足りない

**影響**:
- 納期遅延
- 新規受注停止

**対策**:
1. **採用強化**:
   - フリーランスネットワーク構築（20名プール）
   - 在宅勤務可・時間制（タスクベース）

2. **外注化**:
   - オフショア開発会社と提携（ベトナム・フィリピン）
   - 品質管理は日本で実施

3. **AI能力向上**:
   - AI成功率を向上させて、人間介入を減らす

---

#### リスク 3: 顧客からのクレーム・訴訟

**リスク内容**:
- 成果物に重大なバグ
- 納期大幅遅延
- セキュリティ問題

**影響**:
- 損害賠償請求
- 評判毀損

**対策**:
1. **保険加入**:
   - 賠償責任保険（IT事業者向け）
   - サイバー保険

2. **契約書の整備**:
   - 損害賠償上限を明記（委託料金の総額）
   - 免責事項を明記（不可抗力、顧客の指示ミス）

3. **品質管理の徹底**:
   - 人間エンジニアによる最終レビュー必須
   - セキュリティスキャン自動化

---

#### リスク 4: Claude API料金の急騰

**リスク内容**:
- Anthropicが料金を大幅値上げ

**影響**:
- 粗利率の低下

**対策**:
1. **複数プロバイダー対応**:
   - OpenAI GPT-4も利用可能に
   - Google Gemini, Mistralも検討

2. **自社LLMファインチューニング**:
   - Llama 3をファインチューニング
   - コスト削減（APIの1/10程度）

3. **価格転嫁**:
   - API料金が2倍になった場合、サービス料金を10%値上げ

---

### 6.2 リスクマトリクス

| リスク | 発生確率 | 影響度 | 対策優先度 |
|--------|---------|--------|-----------|
| AI成功率低下 | 中 | 高 | ⚠️ 高 |
| エンジニア不足 | 高 | 中 | ⚠️ 高 |
| 顧客クレーム | 低 | 高 | 🟡 中 |
| API料金急騰 | 低 | 中 | 🟢 低 |
| 競合参入 | 高 | 中 | 🟡 中 |
| 法規制強化 | 低 | 中 | 🟢 低 |

---

## 7. 顧客獲得戦略

### 7.1 初期顧客獲得（Year 1: 最初の50社）

#### チャネル 1: Twitter/X（無料）

**戦術**:
```
1. 毎日投稿（朝・昼・夜の3回）
   - 成功事例: 「AIで3日、5万円でログイン機能実装」
   - Before/After: 「従来100万円 → Miyabiで30万円」
   - 技術Tips: 「Claude Sonnet 4の活用法」

2. スレッド投稿（週2回）
   - AI実装の裏側
   - 失敗談と学び
   - 顧客の声

3. ハッシュタグ戦略
   - #AI開発 #受託開発 #スタートアップ #エンジニア採用難

4. インフルエンサーとの連携
   - Theo (t3.gg), Fireship等にDM
   - レビュー依頼（無料で実装提供）
```

**目標**: フォロワー5,000人、月間インプレッション100万

---

#### チャネル 2: Product Hunt（無料）

**戦術**:
```
1. ローンチ準備（1ヶ月前から）
   - 動画デモ作成（90秒）
   - ランディングページ最適化
   - メーリングリスト構築（1,000人）

2. ローンチ当日
   - Hunter依頼（フォロワー多い人）
   - 12時間張り付いてコメント返信
   - トップ5入りを目指す

3. ローンチ後
   - レビューをもらう（最初の10社は無料で実装）
   - 事例紹介記事公開
```

**目標**: 日間トップ3、獲得リード500件

---

#### チャネル 3: 直販営業（最重要）

**ターゲット企業リスト（100社）**:
```
1. スタートアップ（Seed-Series A）
   - YC卒業生
   - 500 Startups卒業生
   - IVS登壇企業

2. 中小SaaS企業
   - freee, Sansan, SmartHR等の競合
   - エンジニア採用難に悩んでいる企業

3. 受託開発会社
   - 案件溢れている会社
   - Miyabiを下請けとして活用
```

**営業フロー**:
```
1. 初回接触（LinkedIn, Email）
   - 「AIで開発コスト70%削減」提案書送付

2. デモ実施（30分）
   - 実際に簡単なタスクをAI実装（ライブデモ）
   - 従来の見積もりと比較

3. トライアル（無料）
   - 最初の1案件は無料で実装
   - 品質を確認してもらう

4. 本契約
   - 月額固定（30万円/月、案件数無制限）
   - または、案件ごと課金
```

**目標**: 月10社の新規獲得

---

### 7.2 成長期の顧客獲得（Year 2-3）

#### チャネル 4: パートナープログラム

**パートナー種別**:
```
1. SIer（大手・中堅）
   - NTTデータ、富士通、日立等
   - Miyabiを下請けとして活用
   - コミッション: 売上の20%

2. コンサルティング会社
   - アクセンチュア、デロイト等
   - DX案件でMiyabiを提案
   - コミッション: 売上の30%

3. クラウドベンダー
   - AWS, GCP, Azure Marketplace出品
   - コミッション: 売上の20%
```

---

#### チャネル 5: コンテンツマーケティング

**ブログ記事（週2回更新）**:
- SEOキーワード: 「受託開発 AI」「開発コスト削減」
- 事例記事: 「○○社が開発コストを50%削減した方法」
- 技術記事: 「Claude Sonnet 4で自動実装する方法」

**YouTube（月4本）**:
- ライブコーディング（AIと人間の協働）
- 顧客インタビュー
- 技術解説

**目標**: オーガニック流入 月10,000PV

---

## 8. 競合分析

### 8.1 競合マッピング

```
           高価格
              ↑
              │
    SIer      │      Miyabi
  (100万円〜) │    (30万円〜)
              │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 低品質 ← → 高品質
              │
   オフショア  │   フリーランス
  (20万円〜)  │    (50万円〜)
              │
              ↓
           低価格
```

**Miyabiのポジション**: **高品質・中価格**

---

### 8.2 競合比較表（詳細）

| 項目 | Miyabi | SIer | フリーランス | オフショア | Devin AI |
|------|--------|------|-------------|-----------|----------|
| **価格** | 30万円 | 100万円 | 50万円 | 20万円 | $500/月 |
| **納期** | 1週間 | 1ヶ月 | 2週間 | 3週間 | 不明 |
| **品質** | 高（人間保証） | 高 | 中〜高 | 低〜中 | 低 |
| **自動化率** | 70-80% | 0% | 0% | 0% | 30%? |
| **コミュニケーション** | 日本語 | 日本語 | 日本語 | 英語（時差あり） | 英語 |
| **柔軟性** | 高 | 低 | 高 | 中 | 低 |
| **SLA** | あり | あり | なし | なし | なし |

---

### 8.3 競争優位性

#### 1. **価格優位性**

```
従来の受託開発: 100万円
  ↓ Miyabi導入
Miyabi: 30万円
  ↓
削減額: 70万円（70%削減）
```

**根拠**: AI自動化により人件費が70%削減

---

#### 2. **速度優位性**

```
従来の受託開発: 1ヶ月
  ↓ Miyabi導入
Miyabi: 1週間
  ↓
短縮: 3週間（75%短縮）
```

**根拠**: AIは24時間稼働、人間の4倍速

---

#### 3. **品質保証**

```
他のAIツール: 品質保証なし
  ↓
Miyabi: 人間エンジニアによる品質保証付き
  ↓
顧客の安心感: 圧倒的
```

---

## 9. 財務計画

### 9.1 初期投資（Year 0）

| 項目 | 金額 |
|------|------|
| 会社設立費用 | 30万円 |
| Webサイト開発 | 50万円 |
| インフラ構築（1年分） | 120万円 |
| マーケティング（初期） | 100万円 |
| **合計** | **300万円** |

**資金調達**: 自己資金 or エンジェル投資

---

### 9.2 損益計算書（Year 1）

| 項目 | 金額（年間） |
|------|------------|
| **売上高** | 2.4億円 |
| 売上原価 | 1.0億円 |
| **売上総利益** | 1.4億円 |
| 販管費 | 6,800万円 |
| **営業利益** | 7,200万円 |
| 営業利益率 | 30% |

**売上原価内訳**:
- 人件費: 4,800万円（月400万円 × 12ヶ月）
- API料金: 900万円
- インフラ: 1,200万円
- その他: 3,100万円

**販管費内訳**:
- 営業費: 2,000万円
- 広告宣伝費: 3,000万円
- 管理費: 1,800万円

---

### 9.3 キャッシュフロー（Year 1）

| 項目 | 金額（年間） |
|------|------------|
| 営業活動CF | +7,000万円 |
| 投資活動CF | -500万円 |
| 財務活動CF | -300万円（初期投資返済） |
| **フリーCF** | **+6,200万円** |

---

## 10. 法務・税務

### 10.1 法人形態

**推奨**: 株式会社

**理由**:
- 信頼性が高い（受託開発は法人契約が多い）
- 資金調達しやすい
- 節税メリット

**設立コスト**: 約30万円（登記費用込み）

---

### 10.2 必要な許認可

**特になし**

- ソフトウェア開発業は許認可不要
- ただし、以下の点に注意:
  - 下請法（資本金1,000万円未満は対象外）
  - 労働者派遣法（エンジニアを派遣する場合は許可必要）

---

### 10.3 税務

#### 法人税

```
Year 1営業利益: 7,200万円
法人税等（実効税率30%）: 2,160万円
税引後利益: 5,040万円
```

#### 消費税

```
Year 1売上高: 2.4億円（税抜）
消費税: 2,400万円

Year 1仕入高: 1.68億円（税抜）
仕入消費税: 1,680万円

納付消費税: 720万円
```

---

### 10.4 保険

| 保険種別 | 保険料（年間） | 補償内容 |
|---------|--------------|---------|
| 賠償責任保険 | 50万円 | 1億円 |
| サイバー保険 | 30万円 | 3,000万円 |
| 業務災害保険 | 20万円 | - |
| **合計** | **100万円** | - |

---

## 📋 次のアクション（実装ロードマップ）

### Week 1: 最小限の実装

- [ ] Issue作成テンプレート（予算付き）
- [ ] 予算チェック機能（30万円以上）
- [ ] ランディングページ刷新

### Week 2-4: 予算管理システム

- [ ] データベース設計
- [ ] 予算管理API実装
- [ ] 顧客ダッシュボード

### Month 2: 人間エンジニア連携

- [ ] エンジニアダッシュボード
- [ ] タスク割り当てシステム
- [ ] 通知システム（メール・Slack）

### Month 3: 決済・契約

- [ ] Stripe統合
- [ ] 契約書自動生成
- [ ] 電子署名（DocuSign）

---

**作成者**: Shunsuke Hayashi
**レビュー推奨**: 弁護士、税理士、ビジネス顧問
**最終更新**: 2025-10-11
