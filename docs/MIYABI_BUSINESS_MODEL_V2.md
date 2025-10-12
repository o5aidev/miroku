# Miyabi ビジネスモデル v2.0 - 受託開発営業フロント戦略

**作成日**: 2025-10-11
**Version**: 2.0.0
**ステータス**: **戦略的転換**

---

## 🎯 コアインサイト

**ユーザーフィードバック**:
> 「実装を理解している人しか使えない気もする。ポジショニングをどこにするのかの問題」
> 「膨大に依頼が来る可能性があるので、予算を入力して依頼してもらうようにした方がいい」
> 「Miyabiで実装して、どうしても解決できなければ、実装修正します、と受託開発の営業窓口にする」

---

## 💡 新しいポジショニング

### Before（旧モデル）
```
Miyabi = 完全自動化ツール
  ↓
ターゲット: 技術者（実装を理解している人）
課題: 限定的な市場、不完全な自動化
```

### After（新モデル）
```
Miyabi = 受託開発の営業フロント + 自動化の試行
  ↓
ターゲット: 非技術者・経営者（予算を持っている人）
価値: 「自動で試す → 失敗したら人間が修正」の安心感
```

---

## 🏗️ 新しいビジネスフロー

### フロー全体像

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: 顧客がIssue作成（予算・権限付き）                  │
├─────────────────────────────────────────────────────────┤
│ 予算: 30万円                                              │
│ 権限: リポジトリアクセス許可                               │
│ 依頼: ログイン機能の実装                                   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: Miyabi自動実装（AI Agent）                        │
├─────────────────────────────────────────────────────────┤
│ CoordinatorAgent: タスク分解                              │
│ CodeGenAgent: コード生成                                  │
│ ReviewAgent: 品質チェック                                  │
│ PRAgent: Pull Request作成                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
                    ┌──────────┐
                    │ 成功？    │
                    └──────────┘
                    /           \
                 ✅ Yes        ❌ No
                  /              \
┌──────────────────────┐  ┌──────────────────────────────┐
│ Step 3a: 自動完了      │  │ Step 3b: 人間エンジニア介入   │
├──────────────────────┤  ├──────────────────────────────┤
│ PR自動マージ          │  │ 1. エラー分析                 │
│ 顧客に通知            │  │ 2. 手動で修正                 │
│ 予算消費: 5万円       │  │ 3. PR作成                     │
│ 残り: 25万円          │  │ 4. 顧客承認                   │
│                      │  │ 予算消費: 30万円              │
└──────────────────────┘  └──────────────────────────────┘
                           ↓
                    顧客満足度 100%
```

---

## 💰 予算システムの設計

### 1. Issue作成時の予算入力

**新しいIssueテンプレート**:
```yaml
name: 🚀 開発依頼（予算付き）
description: Miyabiによる自動実装 + 必要に応じて人間が修正
title: "[開発依頼] "
labels: ["💰 development-request", "📊 priority:P1-High"]
body:
  - type: markdown
    attributes:
      value: |
        ## 💡 Miyabi開発依頼フォーム

        **このフォームで依頼すると:**
        1. ✅ Miyabi AIが自動実装を試みます
        2. ✅ 失敗した場合は人間エンジニアが修正します
        3. ✅ 品質保証・テスト込みで納品します

        **最低予算: 30万円〜**

  - type: input
    id: budget
    attributes:
      label: 💰 予算（円）
      description: このタスクに割り当てる予算を入力してください（最低30万円）
      placeholder: "300000"
    validations:
      required: true

  - type: dropdown
    id: priority
    attributes:
      label: 📊 優先度
      description: いつまでに必要ですか？
      options:
        - 緊急（1週間以内）- 追加料金 +50%
        - 高（2週間以内）
        - 中（1ヶ月以内）
        - 低（期限なし）
    validations:
      required: true

  - type: textarea
    id: requirements
    attributes:
      label: 📝 要件定義
      description: 実装してほしい機能を詳しく書いてください
      placeholder: |
        ## やりたいこと
        ログイン機能を実装したい

        ## 詳細
        - メールアドレス + パスワードでログイン
        - JWT認証
        - パスワードハッシュ化（bcrypt）

        ## 成果物
        - ログインAPI (POST /api/login)
        - ログイン画面 (React)
        - テストコード
    validations:
      required: true

  - type: checkboxes
    id: repository-access
    attributes:
      label: 🔐 リポジトリアクセス許可
      description: Miyabiがあなたのリポジトリにアクセスすることを許可しますか？
      options:
        - label: "はい、Miyabiにリポジトリへの書き込み権限を付与します"
          required: true
        - label: "機密情報（.envなど）はコミットしないことを理解しています"
          required: true

  - type: input
    id: contact
    attributes:
      label: 📧 連絡先
      description: 進捗報告先のメールアドレス
      placeholder: "you@example.com"
    validations:
      required: true
```

---

### 2. 予算管理システム

**データ構造**:
```typescript
interface DevelopmentRequest {
  issueNumber: number;
  client: {
    name: string;
    email: string;
    company?: string;
  };
  budget: {
    total: number;          // 総予算（円）
    consumed: number;       // 消費額（円）
    remaining: number;      // 残額（円）
    breakdown: {
      ai_attempts: number;  // AI試行コスト
      human_hours: number;  // 人間作業時間
      review: number;       // レビューコスト
    };
  };
  status: 'pending' | 'ai-working' | 'human-working' | 'completed' | 'blocked';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  estimatedDelivery: Date;
  actualDelivery?: Date;
}
```

**予算チェックフロー**:
```typescript
// Issue作成時
async function validateBudget(budget: number): Promise<boolean> {
  const MIN_BUDGET = 300000; // 30万円

  if (budget < MIN_BUDGET) {
    throw new Error(
      `予算が不足しています。最低予算は ${MIN_BUDGET.toLocaleString()}円 です。\n\n` +
      `💡 タスクが小さい場合は、複数のタスクをまとめて依頼することをお勧めします。`
    );
  }

  return true;
}

// AI実装失敗時の予算再計算
async function calculateHumanIntervention(
  taskComplexity: 'small' | 'medium' | 'large'
): Promise<number> {
  const HOURLY_RATE = 10000; // 1時間あたり1万円

  const estimatedHours = {
    small: 8,    // 1日
    medium: 24,  // 3日
    large: 80,   // 10日
  };

  return estimatedHours[taskComplexity] * HOURLY_RATE;
}
```

---

### 3. 自動 vs 人間の切り替え判断

**AI実装の成功判定**:
```typescript
interface AIImplementationResult {
  success: boolean;
  qualityScore: number;     // 0-100
  testsPassed: boolean;
  securityIssues: number;
  estimatedReliability: number; // 0-100
}

async function shouldHumanIntervene(
  result: AIImplementationResult
): Promise<boolean> {
  // 以下の条件で人間が介入
  return (
    !result.success ||
    result.qualityScore < 80 ||
    !result.testsPassed ||
    result.securityIssues > 0 ||
    result.estimatedReliability < 90
  );
}

// 顧客への通知
async function notifyClient(issueNumber: number, status: string) {
  if (status === 'ai-success') {
    await sendEmail({
      to: client.email,
      subject: '✅ 自動実装が完了しました',
      body: `
        Issue #${issueNumber} の実装が完了しました。

        🎉 Miyabi AIによる自動実装が成功しました！

        **消費予算**: 5万円（AI実行コスト）
        **残り予算**: 25万円

        **成果物**:
        - Pull Request: https://github.com/...
        - テスト結果: 全てパス
        - 品質スコア: 95点

        **次のステップ**:
        1. PRをレビューしてください
        2. 問題なければマージしてください

        ご不明点があればお気軽にご連絡ください。
      `,
    });
  } else if (status === 'human-intervention') {
    await sendEmail({
      to: client.email,
      subject: '🔧 人間エンジニアが対応中です',
      body: `
        Issue #${issueNumber} について、AI実装が想定通りにいかなかったため、
        人間エンジニアが対応しています。

        **現在の状況**:
        - AI実装: 品質スコア 65点（基準80点未満）
        - 人間エンジニア: 修正作業中

        **見積もり**:
        - 追加作業時間: 3日
        - 追加コスト: 24万円（人間作業）
        - 合計: 29万円（予算内）

        **納期**: ${estimatedDelivery.toLocaleDateString()}

        進捗は随時更新いたします。
      `,
    });
  }
}
```

---

## 🎯 ターゲット顧客のポジショニング

### 新しいターゲット: 「予算を持っている非技術者」

| 項目 | Before（旧モデル） | After（新モデル） |
|------|-------------------|------------------|
| **ターゲット** | 技術者 | 非技術者・経営者 |
| **理解レベル** | コードを読める | コードは読めない |
| **価格感度** | 安さ重視 | 品質・速度重視 |
| **意思決定** | 自分で判断 | 予算で判断 |
| **求めるもの** | ツール | 成果物 |
| **最低予算** | $0（無料版） | 30万円〜 |

---

### ペルソナ 1: スタートアップCEO「田中太郎」

**属性**:
- 年齢: 35歳
- 職業: スタートアップCEO（非技術者）
- 予算: 500万円/月（開発全体）
- ペインポイント: エンジニア採用できない、外注は高い

**Miyabiで解決**:
- 小さなタスク: AI自動実装（5万円）
- 大きなタスク: AI + 人間（30万円）
- 安心感: 「失敗しても人間が修正してくれる」

**支払い意思**: 30-100万円/タスク

---

### ペルソナ 2: 中小企業 情報システム部長「鈴木花子」

**属性**:
- 年齢: 45歳
- 職業: 情報システム部長（技術知識は古い）
- 予算: 年間3,000万円（システム保守）
- ペインポイント: レガシーシステムの改修が遅い

**Miyabiで解決**:
- 新機能追加: AIで試す → 失敗したら人間
- 予算管理: タスク単位で予算設定
- 安心感: 「品質保証付き」

**支払い意思**: 50-200万円/タスク

---

## 💼 受託開発との連携フロー

### 1. 開発チーム体制

```
┌─────────────────────────────────────────────┐
│ Miyabi受託開発チーム                          │
├─────────────────────────────────────────────┤
│ 1. AIエージェント（自動実装）                 │
│    - CoordinatorAgent                       │
│    - CodeGenAgent                           │
│    - ReviewAgent                            │
│    - PRAgent                                │
│                                             │
│ 2. 人間エンジニア（修正・品質保証）           │
│    - シニアエンジニア（時給1万円）           │
│    - ジュニアエンジニア（時給5千円）         │
│                                             │
│ 3. プロジェクトマネージャー                  │
│    - 進捗管理                               │
│    - 顧客コミュニケーション                  │
│    - 予算管理                               │
└─────────────────────────────────────────────┘
```

---

### 2. 価格表

| タスクサイズ | AI実装 | AI + 人間 | 納期 |
|-------------|--------|-----------|------|
| **小** | 5万円 | 15万円 | 3日 |
| **中** | 10万円 | 30万円 | 1週間 |
| **大** | 20万円 | 80万円 | 2週間 |
| **特大** | 50万円 | 200万円 | 1ヶ月 |

**価格内訳**:
- AI実装: Claude API料金 + インフラ
- 人間修正: 時給1万円 × 作業時間
- 品質保証: テスト + レビュー（10%）
- プロジェクト管理: 全体の10%

---

### 3. SLA（Service Level Agreement）

```
┌─────────────────────────────────────────────┐
│ Miyabi開発保証                               │
├─────────────────────────────────────────────┤
│ 1. 納期保証                                  │
│    - 見積もり通りに納品（遅延時は全額返金）  │
│                                             │
│ 2. 品質保証                                  │
│    - 品質スコア 80点以上                     │
│    - テストカバレッジ 80%以上                │
│    - セキュリティスキャン クリア             │
│                                             │
│ 3. バグ修正保証                              │
│    - 納品後30日間は無償修正                  │
│                                             │
│ 4. 予算保証                                  │
│    - 見積もり予算を超えない（超過分は無償）  │
└─────────────────────────────────────────────┘
```

---

## 🚀 実装ロードマップ

### Phase 1: 予算システム実装（1ヶ月）

- [ ] Issue作成テンプレート（予算付き）作成
- [ ] 予算管理システム実装（DB設計）
- [ ] 予算チェック機能（最低30万円）
- [ ] 顧客通知システム（メール）

---

### Phase 2: 人間エンジニア連携（2ヶ月）

- [ ] AI成功判定ロジック実装
- [ ] 人間エンジニア向けダッシュボード
- [ ] タスク割り当てシステム
- [ ] 進捗管理システム

---

### Phase 3: 営業フロント化（3ヶ月）

- [ ] ランディングページ刷新（「受託開発」を前面に）
- [ ] 料金表公開
- [ ] 事例紹介（「AIで5万円 → 人間で30万円」）
- [ ] 問い合わせフォーム

---

## 💡 マーケティング戦略

### キャッチコピー

**Before**:
> Miyabi - 一つのコマンドで全てが完結する自律型開発フレームワーク

**After**:
> **Miyabi - AIが試す、人間が仕上げる。予算30万円から始める開発委託**
>
> ✅ まずAIが自動実装（5万円）
> ✅ 失敗したら人間が修正（+25万円）
> ✅ 品質保証・テスト込み
> ✅ 納期厳守・予算内保証

---

### 事例紹介

**事例1: ログイン機能実装**
```
依頼: ログイン機能の実装
予算: 30万円
納期: 1週間

結果:
✅ AI実装: 成功（品質スコア 92点）
消費予算: 5万円
納期: 3日で完了

顧客の声:
「AIだけで完成するとは思わなかった。5万円で済んで驚きです」
```

**事例2: 決済システム統合**
```
依頼: Stripe決済システムの統合
予算: 80万円
納期: 2週間

結果:
⚠️ AI実装: 部分的成功（品質スコア 70点）
🔧 人間修正: 3日間
消費予算: 75万円（予算内）
納期: 10日で完了

顧客の声:
「AIで試してくれるので、最初から人間に頼むより安く済みました」
```

---

## 📊 収益予測（新モデル）

### Year 1

| 月 | 案件数 | AI成功率 | 人間介入 | 月次収益 | 累計ARR |
|----|--------|---------|---------|---------|---------|
| Jan | 5 | 60% | 2件 | 75万円 | - |
| Mar | 10 | 65% | 4件 | 180万円 | - |
| Jun | 20 | 70% | 6件 | 420万円 | - |
| Dec | 50 | 80% | 10件 | 1,200万円 | **1.44億円** |

**Year 1 合計**: 年間収益 1.44億円

---

### Year 2-3

- 案件数: 月100件（Year 2）、月200件（Year 3）
- AI成功率: 85%（Year 2）、90%（Year 3）
- **Year 2**: 年間収益 3億円
- **Year 3**: 年間収益 6億円

---

## 🎯 次のアクション

### 今週中

1. **Issue作成テンプレート（予算付き）を作成**
   ```bash
   .github/ISSUE_TEMPLATE/development-request.yml
   ```

2. **ランディングページに料金表追加**
   - 最低予算: 30万円
   - 価格内訳: AI 5万円 + 人間 25万円

3. **最初の受託案件を受ける**
   - 自社プロジェクトで検証
   - 実際のフローを確立

---

### 今月中

1. **予算管理システムの実装**
   - DB設計（Supabase or Firebase）
   - 予算チェック機能
   - 顧客通知システム

2. **人間エンジニアの確保**
   - フリーランス 2-3名と契約
   - タスク割り当てフロー確立

3. **最初の10案件獲得**
   - Twitter/Linkedinで告知
   - スタートアップ向けに営業

---

**作成者**: Shunsuke Hayashi
**レビュー推奨**: ビジネス顧問、弁護士（契約書）
**最終更新**: 2025-10-11
