# Gemini TTS Implementation Summary

## 📋 Overview

Gemini 2.5 Flash TTSを使用した音声生成機能をMiyabiプロジェクトに統合しました。

**実装日**: 2025-10-13
**バージョン**: 2.0.0

---

## ✅ 実装内容

### 1. TypeScript TTS生成スクリプト

**ファイル**: `scripts/tools/generate-speech.ts`

**機能**:
- Gemini 2.5 Flash TTS API呼び出し
- 5種類の音声オプション（Puck, Charon, Kore, Fenrir, Aoede）
- 日本語・英語対応
- 自動リトライ（最大3回、指数バックオフ）
- WAV形式出力（PCM, 16-bit, 24kHz, mono）
- WAVヘッダー自動生成

### 2. npmスクリプト統合

**package.json**に追加:
```json
{
  "generate-speech": "tsx scripts/tools/generate-speech.ts",
  "generate-speech:help": "tsx scripts/tools/generate-speech.ts --help"
}
```

**使用方法**:
```bash
npm run generate-speech -- "テキスト" --voice=Kore --output=./output.wav
npm run generate-speech:help
```

### 3. MCP Server拡張

**ファイル**: `.claude/mcp-servers/image-generation.js` → **機能拡張**

**更新内容**:
- サーバー名: `gemini-image-generation` → `gemini-media-generation`
- バージョン: 1.0.0 → 2.0.0

**追加されたMCP Tools**:

| Tool Name | 機能 | 入力 | 出力 |
|-----------|------|------|------|
| `gemini__generate_speech` | 単一音声生成 | text, voice, output, apiKey | WAVファイル |
| `gemini__generate_speeches_batch` | 複数音声一括生成 | texts[], voice, outputPattern, apiKey | 複数のWAVファイル |

### 4. ドキュメント

**作成されたドキュメント**:

1. **`docs/GEMINI_TTS_GUIDE.md`** - 包括的な使用ガイド
   - 基本的な使い方
   - 音声オプション説明
   - ユースケース例
   - トラブルシューティング

2. **`docs/TTS_IMPLEMENTATION_SUMMARY.md`** - 実装サマリー（本ドキュメント）

3. **`docs/MCP_TROUBLESHOOTING.md`** - 既存のトラブルシューティングガイド（更新済み）

---

## 🎯 主要機能

### 音声オプション

| Voice | 特徴 | 用途 |
|-------|------|------|
| **Puck** | 温かく表現力豊か | ストーリーテリング |
| **Charon** | 深く権威的 | ナレーション |
| **Kore** | 明瞭で自然（デフォルト） | 一般的な用途 |
| **Fenrir** | 力強くダイナミック | アナウンスメント |
| **Aoede** | メロディアスで心地よい | 会話的なコンテンツ |

### 出力形式

```
Format:       RIFF WAVE
Codec:        PCM (uncompressed)
Sample Rate:  24,000 Hz
Channels:     1 (mono)
Bit Depth:    16-bit
Byte Rate:    48,000 bytes/sec
```

---

## 🧪 テスト結果

### テスト実行

```bash
npm run generate-speech -- "Have a wonderful day!" --voice=Kore --output=./assets/test-tts.wav
```

### 結果

```
✅ Success!
- Output: /Users/shunsuke/Dev/Autonomous-Operations/assets/test-tts.wav
- Size: 89KB
- Format: RIFF (little-endian) data, WAVE audio, Microsoft PCM, 16 bit, mono 24000 Hz
```

---

## 📦 ファイル構成

```
Autonomous-Operations/
├── scripts/
│   └── tools/
│       ├── generate-image.ts     # 既存の画像生成スクリプト
│       └── generate-speech.ts    # 🆕 新規TTS生成スクリプト
├── .claude/
│   └── mcp-servers/
│       └── image-generation.js   # ✏️ 更新（TTS機能追加）
├── docs/
│   ├── GEMINI_TTS_GUIDE.md       # 🆕 TTSガイド
│   ├── TTS_IMPLEMENTATION_SUMMARY.md # 🆕 実装サマリー
│   └── MCP_TROUBLESHOOTING.md    # ✏️ 更新
├── package.json                  # ✏️ 更新（npm scripts追加）
└── assets/
    ├── generated-images/         # 既存の画像出力先
    ├── generated-audio/          # 🆕 新規音声出力先
    └── test-tts.wav              # 🆕 テスト用音声ファイル
```

---

## 🔧 統合ポイント

### 1. Image + TTS統合MCPサーバー

**Before**:
- `gemini-image-generation` (画像生成のみ)
- 3つのツール

**After**:
- `gemini-media-generation` (画像 + TTS)
- 5つのツール

### 2. 共通の環境変数

```bash
GOOGLE_API_KEY=your_api_key_here
```

画像生成とTTS生成で同じAPI Keyを使用。

### 3. 統一されたエラーハンドリング

- 自動リトライ（指数バックオフ）
- レート制限回避（バッチ処理で2秒間隔）
- 詳細なエラーメッセージ

---

## 🚀 使用例

### 1. CLI経由

```bash
# 基本的な使い方
npm run generate-speech -- "こんにちは、素晴らしい一日を！"

# 音声指定
npm run generate-speech -- "Welcome to Miyabi" --voice=Charon

# note.com記事用
npm run generate-speech -- \
  "Miyabiは見えないアシスタントとして、あなたの仕事を自動化します" \
  --voice=Kore \
  --output=./assets/note-article-intro.wav
```

### 2. MCP経由（Claude Code内）

```typescript
// 単一音声生成
gemini__generate_speech({
  text: "Miyabiへようこそ",
  output: "./assets/welcome.wav",
  voice: "Kore"
})

// 複数音声一括生成
gemini__generate_speeches_batch({
  texts: [
    "ステップ1: プロジェクト初期化",
    "ステップ2: Agent設定",
    "ステップ3: 自動実行開始"
  ],
  outputPattern: "./assets/tutorial-{index}.wav",
  voice: "Puck"
})
```

---

## 🎓 ユースケース

### 1. note.com記事の音声版

```bash
# 記事タイトル
npm run generate-speech -- \
  "【3分でわかる】何もしなくても仕事が終わる「Miyabi」を普通のオフィスで理解" \
  --voice=Kore \
  --output=./assets/note-article-title.wav

# セクション読み上げ
npm run generate-speech -- \
  "Miyabiを一言で表すなら、見えないアシスタントです..." \
  --voice=Charon \
  --output=./assets/note-article-section-1.wav
```

### 2. チュートリアル動画のナレーション

```bash
npm run generate-speech -- "ステップ1: プロジェクトの初期化" --voice=Puck
npm run generate-speech -- "ステップ2: Agent設定" --voice=Puck
npm run generate-speech -- "ステップ3: 自動実行開始" --voice=Puck
```

### 3. UIフィードバック音声

```bash
npm run generate-speech -- "処理が完了しました" --voice=Aoede
npm run generate-speech -- "エラーが発生しました" --voice=Fenrir
npm run generate-speech -- "お待ちください" --voice=Kore
```

---

## 🔍 技術的な詳細

### WAVファイル生成

TypeScriptで実装されたWAVヘッダー生成ロジック:

```typescript
function createWavBuffer(pcmData: Buffer): Buffer {
  const channels = 1;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = pcmData.length;

  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);

  return buffer;
}
```

### API呼び出しフロー

```
1. プロンプト準備
   ↓
2. Gemini TTS API呼び出し
   (POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent)
   ↓
3. Base64エンコードされた音声データ取得
   ↓
4. Base64デコード → PCMデータ
   ↓
5. WAVヘッダー生成 + PCMデータ結合
   ↓
6. ファイル保存
```

---

## 🧩 MCP Server統合の詳細

### Tool Definitions

```javascript
{
  name: 'gemini__generate_speech',
  description: 'Gemini 2.5 Flash TTSを使用してテキストから音声を生成します',
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string', description: '音声化するテキスト' },
      output: { type: 'string', description: '出力ファイルパス' },
      voice: {
        type: 'string',
        enum: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'],
        default: 'Kore'
      },
      apiKey: { type: 'string', description: 'Google API Key（オプション）' }
    },
    required: ['text']
  }
}
```

### Tool Execution

```javascript
case 'gemini__generate_speech': {
  const { text, output, voice, apiKey } = args;

  const result = generateSpeech(text, {
    output,
    voice,
    apiKey,
  });

  if (result.success) {
    return {
      content: [
        {
          type: 'text',
          text: `✅ 音声生成成功\n\n**テキスト**: ${result.text}...`
        }
      ]
    };
  } else {
    return {
      content: [{ type: 'text', text: `❌ 音声生成失敗...` }],
      isError: true
    };
  }
}
```

---

## 📚 関連ドキュメント

- [GEMINI_TTS_GUIDE.md](./GEMINI_TTS_GUIDE.md) - 包括的な使用ガイド
- [MCP_TROUBLESHOOTING.md](./MCP_TROUBLESHOOTING.md) - トラブルシューティング
- [IMAGE_GENERATION_SETUP.md](./IMAGE_GENERATION_SETUP.md) - 画像生成ガイド

---

## 🎉 まとめ

- ✅ **TTS生成スクリプト**: TypeScriptで実装、完全機能
- ✅ **npmスクリプト統合**: `generate-speech` コマンド追加
- ✅ **MCP Server拡張**: 画像 + TTS統合サーバー
- ✅ **5つの音声オプション**: Puck, Charon, Kore, Fenrir, Aoede
- ✅ **自動リトライ**: エラー時の自動リトライ機能
- ✅ **WAV出力**: 標準的なWAVフォーマット
- ✅ **ドキュメント完備**: 包括的な使用ガイド

**次のステップ**:
1. Claude Codeセッションを再起動してMCP Toolsを有効化
2. `npm run generate-speech:help` でヘルプを確認
3. 実際にTTS生成をテスト

---

**Last Updated**: 2025-10-13
**Author**: Claude Code + Miyabi Development Team
