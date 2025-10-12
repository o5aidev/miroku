# Miyabi E2E デモ動画ガイド

## 📹 デモの表示方法

Playwright E2Eテストの実行結果は、以下の3つの方法で確認できます：

### 方法1: HTMLレポート（推奨）

```bash
npm run test:e2e:report
```

または

```bash
npx playwright show-report
```

これにより、ブラウザで以下が開きます：
- **テスト結果サマリー**: 12テスト全てPASS
- **実行時間**: 各テストの詳細な実行時間
- **トレース**: 各テストのステップバイステップの実行ログ
- **スクリーンショット**: 各ステップのスクリーンショット
- **ネットワークログ**: API呼び出しなど

### 方法2: Playwright UIモード（インタラクティブ）

```bash
npm run test:e2e:ui
```

これにより、以下が可能：
- ✅ テストをリアルタイムで実行・デバッグ
- ✅ 各ステップを1つずつ実行
- ✅ DOM要素の検査
- ✅ コンソールログの確認
- ✅ タイムトラベルデバッグ

### 方法3: トレースビューアー（最も詳細）

```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

例：
```bash
npx playwright show-trace "test-results/miyabi-demo-Miyabi-CLI-Dem-c56b1-display-version-information-chromium/trace.zip"
```

## 🎬 デモ内容

### テストスイート: Miyabi CLI Demo（12テスト）

#### 1. ✅ Node.js バージョン確認
- **実行時間**: 27ms
- **検証内容**: `node --version` が正常に実行される
- **結果**: v23.6.1 確認

#### 2. ✅ TypeScript 設定検証
- **実行時間**: 6ms
- **検証内容**: `tsconfig.json` の `strict: true` などを確認
- **結果**: TypeScript厳格モード有効

#### 3. ✅ TypeScript コンパイル成功
- **実行時間**: 1.4s
- **検証内容**: `tsc --noEmit` でエラーなし
- **結果**: コンパイル成功（型エラーなし）

#### 4. ✅ package.json メタデータ
- **実行時間**: 2ms
- **検証内容**:
  - name: `autonomous-operations`
  - version: `0.8.1`
  - license: `Apache-2.0`
  - repository: `https://github.com/ShunsukeHayashi/Miyabi.git`

#### 5. ✅ CLI スクリプト定義
- **実行時間**: 2ms
- **検証内容**: `start`, `test`, `build`, `agents:parallel:exec` などのスクリプトが定義されている

#### 6. ✅ README 必須セクション
- **実行時間**: 3ms
- **検証内容**:
  - `# 🌸 Miyabi`
  - `Beauty in Autonomous Development`
  - `🇯🇵 日本語`
  - `🇺🇸 English` ✨ **新規修正！**
  - AI生成コード注意事項（日本語・英語）

#### 7. ✅ 法的文書の存在確認
- **実行時間**: 3ms
- **検証内容**:
  - `LICENSE`: Apache License 2.0
  - `NOTICE`: Miyabi商標情報
  - `PRIVACY.md`: GDPR/CCPA準拠
  - `CONTRIBUTING.md`: CLA（Contributor License Agreement）

#### 8. ✅ Discord コミュニティドキュメント
- **実行時間**: 8ms
- **検証内容**:
  - `COMMUNITY_GUIDELINES.md`: 行動規範
  - `DISCORD_SETUP_QUICKSTART.md`: 30分セットアップガイド

#### 9. ✅ Agent システムドキュメント
- **実行時間**: 1ms
- **検証内容**: `docs/AGENT_OPERATIONS_MANUAL.md` が存在

#### 10. ✅ テストインフラ
- **実行時間**: 677ms
- **検証内容**: Vitest が正常に動作

#### 11. ✅ プロジェクト構造
- **実行時間**: 32ms
- **検証内容**: 以下のディレクトリが存在
  - `agents/`
  - `scripts/`
  - `tests/`
  - `docs/`
  - `packages/`
  - `.github/workflows/`
  - `.claude/`

#### 12. ✅ 依存関係確認
- **実行時間**: 3ms
- **検証内容**:
  - `@octokit/rest`
  - `@anthropic-ai/sdk`
  - `chalk`, `ora`
  - `typescript`, `vitest`, `@playwright/test`

## 📊 パフォーマンス

- **総実行時間**: 2.4秒
- **並列実行**: 4ワーカー
- **成功率**: 100% (12/12)
- **再試行**: 0回（全て初回成功）

## 🎥 ビデオ録画ファイル

トレースファイルは以下に保存されています：

```
test-results/
├── miyabi-demo-Miyabi-CLI-Dem-c56b1-display-version-information-chromium/
│   └── trace.zip
├── miyabi-demo-Miyabi-CLI-Dem-26191-n-contains-correct-metadata-chromium/
│   └── trace.zip
├── ... (全12テスト分)
```

各 `trace.zip` には以下が含まれます：
- 📹 ビデオ録画
- 📸 スクリーンショット
- 🌐 ネットワークログ
- 📝 コンソールログ
- 🎯 DOM スナップショット

## 🚀 次のステップ

### デモビデオをGIFに変換

```bash
# ffmpegを使ってトレースからビデオを抽出
npx playwright show-trace test-results/[test-name]/trace.zip

# ブラウザで開いて "Export" → "Video" を選択
```

### CI/CDに統合

```yaml
# .github/workflows/e2e-test.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

**作成日**: 2025-10-10
**Playwright バージョン**: v1.56.0
**テスト対象**: Miyabi v0.8.1

🎉 **全てのE2Eテストが成功しています！**
