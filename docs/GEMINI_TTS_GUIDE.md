# Gemini TTS (Text-to-Speech) Generation Guide

## Overview

このガイドでは、Gemini 2.5 Flash TTSを使用した音声生成機能の使い方を説明します。

## Features

- **5つの音声オプション**: Puck, Charon, Kore, Fenrir, Aoede
- **日本語・英語対応**: 両言語に対応したテキスト読み上げ
- **自動リトライ**: 失敗時の自動リトライ機能（3回まで）
- **WAV出力**: 標準的なWAVフォーマット（PCM, 16bit, 24kHz, mono）
- **MCP統合**: Claude Code内から直接呼び出し可能

## Usage

### 1. CLI経由での使用

#### 基本的な使い方

```bash
# デフォルト音声（Kore）で音声生成
npm run generate-speech -- "こんにちは、素晴らしい一日を！"

# 英語テキストで音声生成
npm run generate-speech -- "Welcome to Miyabi, the autonomous development platform"
```

#### 音声指定

```bash
# 5種類の音声から選択可能
npm run generate-speech -- "こんにちは" --voice=Puck    # 温かく表現力豊か
npm run generate-speech -- "こんにちは" --voice=Charon  # 深く権威的
npm run generate-speech -- "こんにちは" --voice=Kore    # 明瞭で自然（デフォルト）
npm run generate-speech -- "こんにちは" --voice=Fenrir  # 力強くダイナミック
npm run generate-speech -- "こんにちは" --voice=Aoede   # メロディアスで心地よい
```

#### 出力先指定

```bash
# カスタム出力先
npm run generate-speech -- "Miyabiへようこそ" --output=./assets/welcome.wav

# note.com記事用音声生成
npm run generate-speech -- "Miyabiは見えないアシスタントとして、あなたの仕事を自動化します" \
  --voice=Kore \
  --output=./assets/note-article-intro.wav
```

### 2. MCP経由での使用（Claude Code内）

Claude Codeセッション内で、MCPツールとして使用できます：

#### 単一音声生成

```typescript
// MCP Tool: gemini__generate_speech
{
  text: "Miyabiは完全自律型AI開発プラットフォームです",
  output: "./assets/miyabi-intro.wav",
  voice: "Kore"
}
```

#### 複数音声の一括生成

```typescript
// MCP Tool: gemini__generate_speeches_batch
{
  texts: [
    "Miyabiの自動化機能をご紹介します",
    "まず、Issueを作成してください",
    "次に、自動実行が開始されます",
    "最後に、Pull Requestが自動作成されます"
  ],
  outputPattern: "./assets/tutorial-{index}.wav",
  voice: "Charon"
}
```

## Available Voices

| Voice   | 特徴                                | 用途                     |
|---------|-------------------------------------|--------------------------|
| **Puck**    | 温かく表現力豊か                    | ストーリーテリング       |
| **Charon**  | 深く権威的                          | ナレーション             |
| **Kore**    | 明瞭で自然（デフォルト）            | 一般的な用途             |
| **Fenrir**  | 力強くダイナミック                  | アナウンスメント         |
| **Aoede**   | メロディアスで心地よい              | 会話的なコンテンツ       |

## Configuration

### 環境変数

```bash
# .envファイルに設定
GOOGLE_API_KEY=your_google_api_key_here
```

### API Keyの取得

1. https://aistudio.google.com/apikey にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPI Keyを`.env`ファイルに保存

## Output Format

生成される音声ファイルは以下の形式です：

- **Format**: WAV (RIFF)
- **Codec**: PCM (uncompressed)
- **Sample Rate**: 24,000 Hz
- **Channels**: 1 (mono)
- **Bit Depth**: 16-bit
- **Byte Rate**: 48,000 bytes/sec

## Use Cases

### 1. note.com記事の音声版作成

```bash
# 記事の導入部
npm run generate-speech -- \
  "【3分でわかる】何もしなくても仕事が終わる「Miyabi」を普通のオフィスで理解" \
  --voice=Kore \
  --output=./assets/note-article-title.wav

# 各セクションの読み上げ
npm run generate-speech -- \
  "Miyabiを一言で表すなら、見えないアシスタントです。朝、やることメモを残すだけで、夕方には完成していて、報告が届きます。" \
  --voice=Charon \
  --output=./assets/note-article-section-1.wav
```

### 2. チュートリアル動画のナレーション

```bash
# ステップバイステップのナレーション生成
npm run generate-speech -- "ステップ1: プロジェクトの初期化" --voice=Puck --output=./tutorial/step-1.wav
npm run generate-speech -- "ステップ2: Agent設定" --voice=Puck --output=./tutorial/step-2.wav
npm run generate-speech -- "ステップ3: 自動実行開始" --voice=Puck --output=./tutorial/step-3.wav
```

### 3. アプリ内音声ガイド

```bash
# UIフィードバック音声
npm run generate-speech -- "処理が完了しました" --voice=Aoede --output=./app/sounds/completed.wav
npm run generate-speech -- "エラーが発生しました" --voice=Fenrir --output=./app/sounds/error.wav
npm run generate-speech -- "お待ちください" --voice=Kore --output=./app/sounds/waiting.wav
```

## Error Handling

### API Key未設定エラー

```
❌ エラー: GOOGLE_API_KEY is required
```

**解決方法**:
```bash
echo "GOOGLE_API_KEY=your_api_key_here" >> .env
```

### レート制限エラー

Gemini APIのレート制限に達した場合、自動的に指数バックオフでリトライします（最大3回）。

バッチ処理では、各リクエスト間に2秒の遅延が自動で挿入されます。

### テキスト長制限

Gemini TTS APIには、1リクエストあたりのテキスト長制限があります（通常5000文字程度）。

長文の場合は、文章を分割してバッチ生成を使用してください。

## Advanced Usage

### TypeScript/ESMでの使用

```typescript
import { generateSpeech } from './scripts/tools/generate-speech.ts';

const outputPath = await generateSpeech({
  text: 'Miyabiへようこそ',
  output: './assets/welcome.wav',
  voice: 'Kore',
  apiKey: process.env.GOOGLE_API_KEY
});

console.log(`Generated: ${outputPath}`);
```

### Python連携

```python
import subprocess
import os

def generate_speech(text, output_path, voice='Kore'):
    """Generate speech using Gemini TTS via npm script"""
    cmd = [
        'npm', 'run', 'generate-speech', '--',
        text,
        f'--output={output_path}',
        f'--voice={voice}'
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode == 0:
        print(f"✅ Speech generated: {output_path}")
        return True
    else:
        print(f"❌ Error: {result.stderr}")
        return False

# 使用例
generate_speech(
    "Miyabiは完全自律型開発プラットフォームです",
    "./assets/intro.wav",
    voice="Kore"
)
```

## Troubleshooting

### 音声が生成されない

1. **API Key確認**: `cat .env | grep GOOGLE_API_KEY`
2. **npm scriptの確認**: `npm run generate-speech:help`
3. **ファイル権限確認**: 出力ディレクトリが書き込み可能か確認
4. **ログ確認**: エラーメッセージを確認

### 音声品質が悪い

- より詳細なテキストを提供（句読点、感嘆符などを適切に使用）
- 異なる音声オプション（Puck, Charon, Kore, Fenrir, Aoede）を試す
- テキストを短く分割して生成

### MCP経由で使用できない

1. Claude Codeセッションを再起動
2. `.claude/mcp.json`を確認
3. MCP serverログを確認：`node .claude/mcp-servers/image-generation.js`

## Related Documents

- [Image Generation Guide](./IMAGE_GENERATION_GUIDE.md)
- [MCP Troubleshooting](./MCP_TROUBLESHOOTING.md)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)

---

**Last Updated**: 2025-10-13
**Version**: 2.0.0
