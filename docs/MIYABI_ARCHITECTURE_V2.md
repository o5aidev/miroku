# Miyabi Architecture v2.0 - GUI統合型開発環境

**作成日**: 2025-10-11
**Version**: 2.0.0
**ステータス**: **重要な方向転換**

---

## 🚨 現在のアーキテクチャの致命的な欠陥

### 指摘された3つの問題点

#### 1. **コードが見れない → デバッグ不可能**

**問題**:
- Pro/Enterpriseをクローズドソースにすると、バグった時にユーザーが自力で修正できない
- Claude Codeでも完璧な実装は稀
- 結果: ゴミIssueが大量に登録される

**具体例**:
```typescript
// AI生成コードにバグ
async function deployToProduction() {
  await deploy(config.prodUrl); // ← config.prodUrl が undefined でエラー
}

// ユーザーはソースコードを見れない
// → Issue登録: "deployToProduction()が動きません"
// → サポート対応コスト増大
```

---

#### 2. **実行環境がない → PR前に動作確認できない**

**問題**:
- PRマージする時に実行もしていない人（AI Agent）がコードの補償を本当にできるのか？
- 人間のレビューなしでマージするリスク

**現状のフロー**:
```
Issue作成 → CodeGenAgent → PR作成 → 自動マージ
                                    ↑
                         実行してない！テストもしてない！
```

**リスク**:
- 本番環境にバグが混入
- ロールバックコスト
- 顧客の信頼喪失

---

#### 3. **GUI/画面が見れない → デザイン確認不可能**

**問題**:
- 現在の仕組みだと、GUI/画面をどうやって確認するのか？
- デザイン・UXの確認ができない

**例**:
```typescript
// AI生成コンポーネント
function LoginForm() {
  return (
    <form>
      <input type="text" name="username" />
      <input type="password" name="password" />
      <button>Login</button>
    </form>
  );
}

// これがどう見えるか、ユーザーは確認できない
// → デザインが崩れていても気づかない
```

---

## 💡 解決策: Miyabi Studio（GUI統合型開発環境）

### コンセプト

**「チャット + コード + プレビュー」を1つの画面に統合**

```
┌─────────────────────────────────────────────────────────┐
│ Miyabi Studio                                           │
├───────────────┬─────────────────────┬───────────────────┤
│               │                     │                   │
│  💬 Chat      │  📝 Code Editor     │  👁️ Preview      │
│               │                     │                   │
│  ユーザー:     │  src/components/    │  ┌─────────────┐ │
│  ログイン画面  │  LoginForm.tsx      │  │ [Login]     │ │
│  を作って     │                     │  │ Username:   │ │
│               │  function LoginForm │  │ [_______]   │ │
│  🤖 Miyabi:   │    return (         │  │ Password:   │ │
│  了解です     │      <form>         │  │ [_______]   │ │
│               │        ...          │  │ [Login Btn] │ │
│  [設計書]     │      </form>        │  └─────────────┘ │
│  [TODO]       │    )                │                   │
│  [実装開始]   │  }                  │  [API Test]       │
│               │                     │  [DB Inspector]   │
└───────────────┴─────────────────────┴───────────────────┘
```

---

## 🏗️ Miyabi Studio の機能設計

### 1. **左パネル: チャット + 設計書/TODO**

**機能**:
- ✅ ユーザーとAIの対話
- ✅ 自動設計書生成
- ✅ TODO自動切り出し
- ✅ 非同期開発の進捗表示

**実装イメージ**:
```typescript
// チャットメッセージを受信
onChatMessage(async (message: string) => {
  // 1. Claude APIで設計書生成
  const designDoc = await generateDesignDoc(message);

  // 2. TODOリスト生成
  const todos = await extractTodos(designDoc);

  // 3. 非同期開発開始
  startAsyncDevelopment(todos);

  // 4. 左パネルに表示
  renderLeftPanel({
    designDoc,
    todos,
    progress: '実装中...',
  });
});
```

---

### 2. **中央パネル: コードエディタ（Monaco Editor）**

**機能**:
- ✅ **フルコード表示**（クローズドソースでも見れる）
- ✅ **編集可能**（ユーザーが直接修正できる）
- ✅ **AIアシスト**（Copilot的な補完）
- ✅ **シンタックスハイライト**
- ✅ **Git統合**（差分表示、コミット）

**技術スタック**:
- Monaco Editor（VS Codeのエディタエンジン）
- Language Server Protocol（LSP）対応
- Git操作（isomorphic-git）

**実装イメージ**:
```typescript
import * as monaco from 'monaco-editor';

const editor = monaco.editor.create(document.getElementById('editor'), {
  value: generatedCode,
  language: 'typescript',
  theme: 'vs-dark',
  minimap: { enabled: true },
  inlineSuggest: { enabled: true }, // AI補完
});

// AI生成コードをエディタに反映
editor.setValue(generatedCode);

// ユーザーが編集可能
editor.onDidChangeModelContent(() => {
  const updatedCode = editor.getValue();
  saveToFileSystem(updatedCode);
});
```

---

### 3. **右パネル: プレビュー環境**

#### 3.1 GUI/画面プレビュー

**機能**:
- ✅ **リアルタイムプレビュー**（コード変更で即座に反映）
- ✅ **レスポンシブ表示**（Mobile/Tablet/Desktop切り替え）
- ✅ **インタラクティブ**（ボタンクリック、フォーム入力可能）

**技術**:
- React/Vue/Svelteのホットリロード
- iframe or Web Worker サンドボックス

**実装イメージ**:
```typescript
// プレビューコンテナ
<iframe
  id="preview"
  sandbox="allow-scripts allow-same-origin"
  srcDoc={compiledHTML}
/>

// コード変更でリアルタイム更新
onCodeChange((newCode) => {
  const compiled = compileReact(newCode);
  updateIframe(compiled);
});
```

---

#### 3.2 API テスター

**機能**:
- ✅ **APIエンドポイント一覧**
- ✅ **リクエスト送信**（Postman的UI）
- ✅ **レスポンス表示**（JSON整形）

**実装イメージ**:
```typescript
// API一覧を自動検出
const apis = detectAPIs(code);
// [
//   { method: 'POST', path: '/api/login', params: ['username', 'password'] },
//   { method: 'GET', path: '/api/users', params: [] },
// ]

// API呼び出しUI
<div className="api-tester">
  <select>{apis.map(api => <option>{api.path}</option>)}</select>
  <input placeholder="Request Body (JSON)" />
  <button onClick={sendRequest}>Send</button>
  <pre>{JSON.stringify(response, null, 2)}</pre>
</div>
```

---

#### 3.3 データベースインスペクター

**機能**:
- ✅ **テーブル一覧**
- ✅ **データ閲覧**（SQL不要）
- ✅ **データ編集**（GUI操作）

**実装イメージ**:
```typescript
// DB接続（開発環境のみ）
const db = await connectDB(config.devDatabase);

// テーブル一覧取得
const tables = await db.getTables();

// データ表示
<table>
  <thead>
    <tr>{columns.map(col => <th>{col}</th>)}</tr>
  </thead>
  <tbody>
    {rows.map(row => <tr>{row.map(cell => <td>{cell}</td>)}</tr>)}
  </tbody>
</table>
```

---

## 🔐 ライセンス戦略の修正

### 問題: クローズドソースだとコードが見れない

**修正案**: **BSL (Business Source License) 1.1 に変更**

#### BSLとは？

- ✅ **ソースコードは公開**（GitHubで見れる）
- ✅ **修正・再配布OK**（個人利用・社内利用）
- ⚠️ **SaaSとしての提供は禁止**（Miyabi社のみ）
- ⏰ **4年後に自動的にApache 2.0へ変更**

#### 具体的なライセンス条項

```
Business Source License 1.1

License Grant:
  - ソースコードの閲覧・修正・再配布を許可
  - 個人利用・社内利用は無制限に可能

Additional Use Grant:
  - SaaSとしての提供は禁止（Miyabi社のみ）
  - 例: AWS、Vercelなどが勝手にMiyabiをSaaS化することは禁止

Change Date: 2029-01-01 (4年後)
Change License: Apache License 2.0

詳細: https://mariadb.com/bsl11/
```

#### メリット

| 項目 | クローズドソース | BSL 1.1 |
|------|-----------------|---------|
| コード閲覧 | ❌ 不可 | ✅ 可能 |
| バグ修正 | ❌ Issue登録のみ | ✅ 自分で修正可能 |
| カスタマイズ | ❌ 不可 | ✅ 可能（社内利用） |
| 競合のSaaS化 | ✅ 防げる | ✅ 防げる |
| コミュニティ | ❌ 育たない | ✅ 育つ |

**結論**: **BSL 1.1に変更することで、コードは見れるが、競合のSaaS化は防げる**

---

## 🎨 Miyabi Studio の技術スタック

### フロントエンド

```typescript
// Next.js + React
import { NextPage } from 'next';
import MonacoEditor from '@monaco-editor/react';
import { ChatPanel } from '@/components/ChatPanel';
import { PreviewPanel } from '@/components/PreviewPanel';

const StudioPage: NextPage = () => {
  return (
    <div className="studio-layout">
      <ChatPanel />           {/* 左: チャット + 設計書 */}
      <MonacoEditor />        {/* 中央: コードエディタ */}
      <PreviewPanel />        {/* 右: プレビュー */}
    </div>
  );
};
```

### バックエンド

```typescript
// Cloudflare Workers（エッジコンピューティング）
export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    // チャットAPI
    if (pathname === '/api/chat') {
      const message = await request.json();
      const response = await claude.chat(message);
      return Response.json(response);
    }

    // コード生成API
    if (pathname === '/api/generate') {
      const code = await generateCode(request);
      return Response.json({ code });
    }

    // プレビューAPI
    if (pathname === '/api/preview') {
      const html = await compileReact(request);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
  },
};
```

### データベース

```typescript
// Cloudflare D1（SQLite互換）
export async function saveProject(projectId: string, code: string) {
  await env.DB.prepare(
    'INSERT INTO projects (id, code) VALUES (?, ?)'
  ).bind(projectId, code).run();
}
```

---

## 🚀 実装ロードマップ

### Phase 1: MVP（3ヶ月）

**目標**: 基本的なGUI統合環境を提供

- [ ] チャットパネル（Claude API統合）
- [ ] Monaco Editorコード表示
- [ ] React/Next.jsプレビュー（iframe）
- [ ] 設計書/TODO自動生成

**リリース**: Miyabi Studio Beta（無料）

---

### Phase 2: プレビュー環境強化（6ヶ月）

**目標**: API/DBインスペクター追加

- [ ] APIテスター（Postman的UI）
- [ ] DBインスペクター（テーブル閲覧）
- [ ] レスポンシブプレビュー（Mobile/Tablet/Desktop）
- [ ] デバッグツール（Console, Network）

**リリース**: Miyabi Studio v1.0（Pro版機能）

---

### Phase 3: 非同期開発（1年）

**目標**: チャットしたら自動開発

- [ ] 非同期タスク実行エンジン
- [ ] 進捗リアルタイム表示
- [ ] 自動テスト実行
- [ ] 自動デプロイ

**リリース**: Miyabi Studio v2.0（Enterprise版機能）

---

## 💰 収益モデルの変更

### Community版（無料）

- ✅ チャット + 設計書生成
- ✅ コードエディタ（閲覧のみ）
- ✅ 基本プレビュー
- ⚠️ 非同期開発は1日1回まで

### Pro版（$49/月）

- ✅ **Communityの全機能**
- ✅ コードエディタ（編集可能）
- ✅ APIテスター、DBインスペクター
- ✅ 非同期開発無制限
- ✅ プライベートリポジトリ無制限

### Enterprise版（$499/月～）

- ✅ **Proの全機能**
- ✅ オンプレミス対応
- ✅ カスタムAgent開発
- ✅ SSO、RBAC
- ✅ 99.9% SLA

---

## 🔄 あなたの仕組みから学ぶ

**あなたが作っている仕組み**:
> チャットしたら、勝手に設計書と開発TODOが切り出されて整理されて、非同期でプログラム開発してくれる仕組み
> API、データベース、画面が「チャットタブの横」で見れる

**これは完璧です。Miyabiもこの方向に舵を切るべきです。**

### 質問させてください

1. **チャット → 設計書/TODO生成**
   - どのようなプロンプトエンジニアリングを使っていますか？
   - Claude/GPT-4のどちらを使っていますか？

2. **API/DB/画面プレビュー**
   - 技術スタックは？（React? Vue? Svelte?）
   - バックエンドはどう動いていますか？（Cloudflare? Vercel? AWS?）

3. **非同期開発**
   - タスクキュー管理はどうしていますか？（BullMQ? SQS?）
   - 進捗のリアルタイム表示はWebSocket? SSE?

4. **収益化**
   - 既に有料ユーザーはいますか？
   - 価格設定は？

---

## 📊 比較: 現在のMiyabi vs Miyabi Studio

| 項目 | 現在のMiyabi | Miyabi Studio（提案） |
|------|-------------|---------------------|
| **UI** | CLI | GUI（Web） |
| **コード表示** | GitHubのみ | エディタ統合 |
| **コード編集** | 手動でclone | ブラウザで直接編集 |
| **プレビュー** | ❌ なし | ✅ リアルタイム |
| **API確認** | ❌ なし | ✅ テスター統合 |
| **DB確認** | ❌ なし | ✅ インスペクター |
| **設計書生成** | ❌ なし | ✅ 自動生成 |
| **TODO管理** | GitHub Issues | ✅ 統合UI |
| **非同期開発** | ❌ なし | ✅ バックグラウンド実行 |
| **ライセンス** | MIT（予定: Apache 2.0） | BSL 1.1（コード公開） |

**結論**: **Miyabi Studioの方が圧倒的に優れている**

---

## 🎯 次のアクション

### 今すぐ実施

1. **あなたの仕組みを詳しく教えてください**
   - アーキテクチャ図
   - 技術スタック
   - 収益化状況

2. **Miyabi Studioのプロトタイプ開発開始**
   - Next.js + Monaco Editor + Claude API
   - 3日でMVP作成

3. **ライセンスをBSL 1.1に変更検討**
   - ソースコード公開 + SaaS禁止
   - コミュニティとの関係維持

---

**質問**: あなたの作っている仕組みについて、もっと詳しく教えていただけますか？Miyabiの方向性を決める上で非常に参考になります。

また、Miyabi Studioのアイデアについて、どう思われますか？
