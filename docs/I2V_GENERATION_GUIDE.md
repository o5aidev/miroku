# Seedance I2V (Image-to-Video) Generation Guide

## Overview

ByteDanceのSeedance APIを使用して、画像から高品質なビデオを生成するツールです。AI駆動のカメラモーション制御により、静止画に命を吹き込みます。

## Features

- **AI Image-to-Video**: 1枚の画像から5-10秒の動画生成
- **カメラモーション制御**: Fixed（静止）またはDynamic（動的）
- **高品質出力**: 720p / 1080p解像度対応
- **自動タスク管理**: タスク作成 → ポーリング → ダウンロードの自動化
- **リトライ機能**: タスク失敗時の自動リトライ
- **プロンプトベース**: 自然言語でモーション指示

## Requirements

### API Key取得

```bash
# ByteDance ARK APIキーが必要
# 取得方法: https://console.bytepluses.com/
export ARK_API_KEY=your_api_key_here
```

### 環境設定

```bash
# .envファイルに追加
echo "ARK_API_KEY=your_api_key_here" >> .env
```

## Usage

### 1. 基本的な使い方

```bash
# 公開画像URLから動画生成
npm run generate-i2v -- \
  --url="https://example.com/image.png" \
  --prompt="Camera slowly zooms in on the subject"
```

### 2. カメラモーション制御

```bash
# 静止カメラ（Fixed）
npm run generate-i2v -- \
  --url="https://example.com/portrait.png" \
  --prompt="Subject slowly smiles at the camera" \
  --camera-fixed=true

# 動的カメラ（Dynamic）
npm run generate-i2v -- \
  --url="https://example.com/landscape.png" \
  --prompt="Drone flying through mountains at breakneck speed" \
  --camera-fixed=false
```

### 3. 解像度と長さ指定

```bash
# 1080p、10秒の高品質動画
npm run generate-i2v -- \
  --url="https://example.com/image.png" \
  --prompt="Cinematic pan across the scene" \
  --resolution=1080p \
  --duration=10
```

### 4. 出力先指定

```bash
# カスタム出力パス
npm run generate-i2v -- \
  --url="https://example.com/image.png" \
  --prompt="Slow motion effect" \
  --output="./my-video.mp4"
```

## Options

| Option | Description | Values | Default |
|--------|-------------|--------|---------|
| `--url` | 画像URL（公開アクセス可能） | URL string | **必須** |
| `--prompt` | モーション記述プロンプト | Text string | **必須** |
| `--resolution` | 動画解像度 | `720p`, `1080p` | `1080p` |
| `--duration` | 動画の長さ（秒） | `5`, `10` | `5` |
| `--camera-fixed` | カメラ固定 | `true`, `false` | `false` |
| `--output` | 出力動画パス | File path | `assets/generated-i2v/i2v-{timestamp}.mp4` |
| `--api-key` | ARK APIキー | API key string | `$ARK_API_KEY` |

### 画像要件

- **形式**: PNG, JPG, JPEG
- **アクセス**: 公開URL必須（現時点でローカルファイル未対応）
- **推奨サイズ**: 1024x1024以上
- **ファイルサイズ**: 10MB以下推奨

## Prompt Engineering

### 効果的なプロンプトの書き方

#### 基本構造
```
[動作] + [対象] + [速度] + [方向]
```

#### Good Examples

```bash
# ポートレート
--prompt="Camera slowly zooms in on the subject's face with subtle movement"

# 風景
--prompt="Drone camera smoothly pans from left to right across the mountain range"

# 商品撮影
--prompt="Rotate product 360 degrees clockwise with smooth motion"

# ストーリーテリング
--prompt="Dolly shot pulling back to reveal the full scene"
```

#### Bad Examples

```bash
# ❌ 曖昧すぎる
--prompt="Move"

# ❌ 複雑すぎる（複数のアクションを同時指示）
--prompt="Zoom in while panning left and rotating clockwise and tilting up"

# ❌ Seedanceがサポートしない指示
--prompt="Add special effects and transitions"
```

### プロンプトカテゴリ別例

#### カメラムーブメント

| プロンプト | 説明 | camera-fixed |
|-----------|------|--------------|
| "Slow zoom in on subject" | ゆっくりズームイン | `false` |
| "Pan from left to right" | 左から右へパン | `false` |
| "Static shot with subtle movement" | 微動のみ | `true` |
| "Dolly shot pulling back" | 後退ドリーショット | `false` |
| "Crane shot rising upward" | 上昇クレーンショット | `false` |

#### 速度

| プロンプト | 効果 |
|-----------|------|
| "slowly" | ゆっくり |
| "smoothly" | 滑らかに |
| "quickly" | 速く |
| "at breakneck speed" | 高速 |
| "gentle motion" | 穏やかな動き |

## Use Cases

### 1. note.com記事の画像を動画化

```bash
# Miyabi紹介画像から動画生成
npm run generate-i2v -- \
  --url="https://example.com/miyabi-intro.png" \
  --prompt="Camera slowly zooms in to highlight the AI assistant concept" \
  --resolution=1080p \
  --duration=5 \
  --camera-fixed=false \
  --output="./assets/note-article-intro-video.mp4"
```

**用途**:
- SNS投稿の視覚的インパクト強化
- note記事のサムネイル動画
- Twitter/Instagram投稿

### 2. 商品撮影画像から商品動画

```bash
# 商品の360度回転動画
npm run generate-i2v -- \
  --url="https://example.com/product.png" \
  --prompt="Smooth 360-degree rotation clockwise to showcase all product angles" \
  --resolution=1080p \
  --duration=10 \
  --output="./product-showcase.mp4"
```

### 3. 風景写真からシネマティック動画

```bash
# ドローン風景動画
npm run generate-i2v -- \
  --url="https://example.com/landscape.png" \
  --prompt="Drone camera slowly pans across the landscape from left to right" \
  --resolution=1080p \
  --duration=10 \
  --camera-fixed=false \
  --output="./landscape-cinematic.mp4"
```

### 4. ポートレートから感情表現動画

```bash
# 表情の変化を強調
npm run generate-i2v -- \
  --url="https://example.com/portrait.png" \
  --prompt="Subject slowly smiles at the camera with gentle expression change" \
  --camera-fixed=true \
  --duration=5 \
  --output="./portrait-emotion.mp4"
```

## Workflow Integration

### 画像生成 → I2V変換の完全ワークフロー

```bash
#!/bin/bash
# 完全自動化ワークフロー: 画像生成 → I2V変換

# Step 1: Gemini Image Generation
npm run generate-image -- \
  "Modern office with AI assistants working invisibly, professional lighting" \
  --output=./assets/temp-image.png \
  --aspect-ratio=16:9

# Step 2: 画像を公開URLにアップロード（例: Imgur, Cloudinary）
# NOTE: 現時点ではローカルファイル非対応のため、手動アップロードが必要
# 将来的に自動アップロード機能を実装予定

# Step 3: I2V変換
npm run generate-i2v -- \
  --url="https://your-hosting-service.com/temp-image.png" \
  --prompt="Camera slowly pans across the modern office space" \
  --resolution=1080p \
  --duration=5 \
  --output="./assets/final-video.mp4"

# Step 4: さらに音声追加（オプション）
npm run generate-speech -- \
  "Miyabiは見えないアシスタントとして、あなたの仕事を自動化します" \
  --voice=Kore \
  --output=./assets/narration.wav

# Step 5: FFmpegで動画と音声を結合
ffmpeg -i ./assets/final-video.mp4 -i ./assets/narration.wav \
  -c:v copy -c:a aac -b:a 192k -shortest \
  ./assets/final-video-with-audio.mp4
```

### Miyabi画像の動画化例

```bash
# Miyabi紹介画像3枚を動画化
npm run generate-i2v -- \
  --url="https://example.com/miyabi-1-invisible-assistant.png" \
  --prompt="Camera slowly zooms in on the invisible assistant concept" \
  --output="./assets/miyabi-1-video.mp4"

npm run generate-i2v -- \
  --url="https://example.com/miyabi-2-workflow.png" \
  --prompt="Pan from left to right across the 3-step workflow" \
  --output="./assets/miyabi-2-video.mp4"

npm run generate-i2v -- \
  --url="https://example.com/miyabi-3-staff.png" \
  --prompt="Slow rotation to showcase all 6 AI staff members" \
  --output="./assets/miyabi-3-video.mp4"

# FFmpegで3つの動画を結合
echo "file './assets/miyabi-1-video.mp4'" > list.txt
echo "file './assets/miyabi-2-video.mp4'" >> list.txt
echo "file './assets/miyabi-3-video.mp4'" >> list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy ./assets/miyabi-full-video.mp4
```

## Technical Details

### API Flow

```
1. Task Creation
   POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
   {
     "model": "seedance-1-0-pro-250528",
     "content": [
       { "type": "text", "text": "prompt --resolution 1080p --duration 5 --camerafixed false" },
       { "type": "image_url", "image_url": { "url": "https://..." } }
     ]
   }
   → Returns: { "id": "task_id_xxx" }

2. Status Polling (5-second intervals)
   GET https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks/{task_id}
   → Status: "processing" | "completed" | "failed"

3. Video Download
   When status === "completed":
   → Download from: response.result.video_url
```

### Task Lifecycle

```
📥 Task Created (id: xxx)
   ↓
⏳ Processing (polling every 5 seconds)
   ↓ (1-5 minutes typically)
✅ Completed (video_url available)
   ↓
📥 Download video
   ↓
💾 Save to output path
```

### Polling Configuration

```typescript
const POLL_INTERVAL_MS = 5000; // 5 seconds
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max
```

**平均生成時間**: 1-5分（解像度・長さによる）

## Output Specifications

### 動画形式

- **Format**: MP4
- **Codec**: H.264
- **Resolution**: 720p (1280x720) or 1080p (1920x1080)
- **Duration**: 5 or 10 seconds
- **Frame Rate**: 30fps (API default)
- **Camera Motion**: Fixed or Dynamic

### ファイルサイズ目安

| Resolution | Duration | Estimated Size |
|------------|----------|----------------|
| 720p | 5s | 2-5 MB |
| 720p | 10s | 4-10 MB |
| 1080p | 5s | 5-10 MB |
| 1080p | 10s | 10-20 MB |

## Troubleshooting

### ARK_API_KEY not set

```bash
# エラー:
# ❌ ARK_API_KEY is required. Set it as environment variable or pass via --api-key option.

# 解決方法:
export ARK_API_KEY=your_api_key_here

# または .envファイルに追加
echo "ARK_API_KEY=your_api_key_here" >> .env
```

### Local image upload not yet implemented

```bash
# エラー:
# ❌ Local image upload not yet implemented. Please use --url with a public image URL.

# 解決方法:
# 1. 画像を公開ホスティングサービスにアップロード（Imgur, Cloudinary, etc.）
# 2. 公開URLを取得
# 3. --url="{public_url}" を使用
```

**画像アップロードサービス例**:
- **Imgur**: https://imgur.com/upload
- **Cloudinary**: https://cloudinary.com/
- **imgbb**: https://imgbb.com/

### Task timeout

```bash
# エラー:
# ❌ Task timeout after 60 attempts (300s)

# 原因:
# - APIサーバーの負荷が高い
# - 画像が複雑すぎる
# - ネットワークの問題

# 解決方法:
# 1. 再試行する
# 2. 画像サイズを縮小する（1024x1024程度）
# 3. プロンプトをシンプルにする
```

### Task failed

```bash
# エラー:
# ❌ Task failed: [error message]

# 一般的な原因:
# - 画像URLがアクセス不可（404, 403）
# - 画像形式が非対応
# - プロンプトが不適切
# - API制限に達した

# 解決方法:
# 1. 画像URLが公開アクセス可能か確認
# 2. PNG/JPGファイルを使用
# 3. プロンプトを修正
# 4. API利用状況を確認
```

### Network or fetch errors

```bash
# エラー:
# ❌ Failed to create task (500): Internal Server Error

# 解決方法:
# 1. ネットワーク接続を確認
# 2. API Keyが正しいか確認
# 3. しばらく待ってから再試行
# 4. ByteDance APIステータスページを確認
```

## Best Practices

### 1. プロンプト設計

✅ **Good**:
- 具体的なカメラムーブメント（"zoom in", "pan left to right"）
- 速度指定（"slowly", "smoothly"）
- 1つのアクションに集中

❌ **Bad**:
- 曖昧な指示（"Move"）
- 複数アクション同時実行（"Zoom and pan and rotate"）
- 非現実的な要求（"Teleport instantly"）

### 2. 画像選択

✅ **Good**:
- 解像度: 1024x1024以上
- 明確な被写体
- 適切な構図（カメラモーションを想定）
- ファイルサイズ: 10MB以下

❌ **Bad**:
- 低解像度（512x512未満）
- ぼやけた画像
- 極端な構図
- 大きすぎるファイル（>10MB）

### 3. パラメータ選択

| Use Case | Resolution | Duration | camera-fixed |
|----------|-----------|----------|--------------|
| SNS投稿 | 1080p | 5s | false |
| 商品紹介 | 1080p | 10s | false |
| ポートレート | 1080p | 5s | true |
| 風景動画 | 1080p | 10s | false |
| 静止強調 | 720p | 5s | true |

### 4. コスト最適化

```bash
# テスト時は低解像度・短時間
npm run generate-i2v -- \
  --url="..." \
  --prompt="..." \
  --resolution=720p \
  --duration=5

# 本番時のみ高品質
npm run generate-i2v -- \
  --url="..." \
  --prompt="..." \
  --resolution=1080p \
  --duration=10
```

## Advanced Usage

### バッチ処理

```bash
#!/bin/bash
# 複数画像を一括I2V変換

urls=(
  "https://example.com/image1.png"
  "https://example.com/image2.png"
  "https://example.com/image3.png"
)

prompts=(
  "Camera slowly zooms in on subject"
  "Pan from left to right across scene"
  "Smooth 360-degree rotation clockwise"
)

for i in "${!urls[@]}"; do
  echo "Processing image $((i+1))..."
  npm run generate-i2v -- \
    --url="${urls[$i]}" \
    --prompt="${prompts[$i]}" \
    --output="./assets/i2v-output-$((i+1)).mp4"

  # API負荷軽減のため待機
  sleep 10
done
```

### プロンプトテンプレート

```bash
# テンプレート定義
ZOOM_IN="Camera slowly zooms in on {subject} with smooth motion"
PAN_LR="Pan from left to right across {subject}"
ROTATE_360="Smooth 360-degree rotation clockwise around {subject}"

# 使用例
npm run generate-i2v -- \
  --url="..." \
  --prompt="$(echo "$ZOOM_IN" | sed 's/{subject}/the product/')"
```

## Examples

### Example 1: Miyabi紹介画像を動画化

```bash
# 画像1: 見えないアシスタント
npm run generate-i2v -- \
  --url="https://example.com/miyabi-1.png" \
  --prompt="Camera slowly zooms in to highlight the invisible assistant concept" \
  --resolution=1080p \
  --duration=5 \
  --output="./assets/miyabi-intro-1.mp4"

# 結果: 5秒のズームイン動画
```

### Example 2: 商品360度回転

```bash
npm run generate-i2v -- \
  --url="https://example.com/product.png" \
  --prompt="Smooth 360-degree clockwise rotation showcasing all product angles" \
  --resolution=1080p \
  --duration=10 \
  --camera-fixed=false \
  --output="./product-360.mp4"

# 結果: 10秒の回転動画
```

### Example 3: 風景パン

```bash
npm run generate-i2v -- \
  --url="https://example.com/landscape.png" \
  --prompt="Cinematic pan from left to right across the mountain landscape" \
  --resolution=1080p \
  --duration=10 \
  --output="./landscape-pan.mp4"

# 結果: 10秒のパン動画
```

## Related Documents

- [Image Generation Guide](./IMAGE_GENERATION_SETUP.md) - 画像生成の前処理
- [Video Generation Guide](./VIDEO_GENERATION_GUIDE.md) - FFmpegベース動画生成
- [TTS Guide](./GEMINI_TTS_GUIDE.md) - 音声生成との統合
- [TTS Implementation Summary](./TTS_IMPLEMENTATION_SUMMARY.md) - 技術実装詳細

## Roadmap

### 将来の機能追加予定

1. **ローカル画像アップロード** - 自動的に公開URLに変換
2. **MCP Server統合** - Claude Code内で直接使用可能
3. **バッチ処理UI** - 複数画像を一括処理
4. **プロンプトライブラリ** - よく使うプロンプトのプリセット
5. **品質プリセット** - "quick", "balanced", "high-quality"モード
6. **コスト計算** - API使用料の自動計算

---

**Last Updated**: 2025-10-13
**Version**: 1.0.0
**API**: Seedance 1.0 Pro (seedance-1-0-pro-250528)
