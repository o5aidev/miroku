# Short Video Generation Guide - TikTok/YouTube Shorts/Instagram Reels

## Overview

FFmpegを使用して、画像とTTS音声から縦型ショート動画（9:16）を生成するツールです。

## Features

- **縦型動画生成**: TikTok/YouTube Shorts/Instagram Reels最適化（1080x1920）
- **画像スライドショー**: 複数画像の結合
- **TTS音声統合**: Gemini TTS生成音声の自動追加
- **テキストオーバーレイ**: タイトル・サブタイトル表示
- **トランジション効果**: フェード・スライド・なし
- **テンプレート機能**: 事前定義されたテンプレート

## Requirements

```bash
# FFmpeg必須
ffmpeg -version

# FFmpegがない場合（macOS）
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg
```

## Usage

### 1. 基本的な使い方

```bash
# 3枚の画像から動画生成
npm run generate-video -- \
  --images="./img1.png,./img2.png,./img3.png" \
  --output="./my-video.mp4"
```

### 2. 音声付き動画

```bash
# TTS音声付き
npm run generate-video -- \
  --images="./img1.png,./img2.png" \
  --audio="./narration.wav" \
  --output="./video-with-audio.mp4"
```

### 3. テキストオーバーレイ

```bash
# タイトルとサブタイトル
npm run generate-video -- \
  --images="./img1.png" \
  --title="Miyabi" \
  --subtitle="見えないアシスタント" \
  --duration=5 \
  --output="./title-video.mp4"
```

### 4. テンプレート使用

```bash
# 事前定義されたテンプレート
npm run generate-video -- --template=miyabi-intro
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `--images` | 画像パス（カンマ区切り） | 必須 |
| `--audio` | 音声ファイルパス | なし |
| `--output` | 出力動画パス | 自動生成 |
| `--duration` | 画像ごとの表示時間（秒） | 3 |
| `--width` | 動画幅（ピクセル） | 1080 |
| `--height` | 動画高さ（ピクセル） | 1920 |
| `--fps` | フレームレート | 30 |
| `--title` | タイトルテキスト | なし |
| `--subtitle` | サブタイトルテキスト | なし |
| `--transition` | トランジション（fade/slide/none） | fade |
| `--template` | テンプレート名 | なし |

## Templates

### miyabi-intro

Miyabi紹介動画テンプレート（3画像 + TTS音声）

```bash
npm run generate-video -- --template=miyabi-intro
```

**内容**:
- 画像1: 見えないアシスタント
- 画像2: 3ステップワークフロー
- 画像3: 6種類のAIスタッフ
- TTS音声: 3つのナレーション（自動生成）
- タイトル: "Miyabi - 見えないアシスタント"
- 長さ: 約15秒

### カスタムテンプレート作成

`scripts/tools/generate-video.ts`の`VIDEO_TEMPLATES`に追加：

```typescript
const VIDEO_TEMPLATES: Record<string, VideoTemplate> = {
  'my-template': {
    name: 'My Custom Template',
    images: ['./assets/img1.png', './assets/img2.png'],
    audioScript: [
      'First narration text',
      'Second narration text',
    ],
    title: 'My Title',
    subtitle: 'My Subtitle',
    duration: 3,
  },
};
```

## Use Cases

### 1. note.com記事プロモーション

```bash
# 記事紹介動画（15秒）
npm run generate-video -- \
  --images="./assets/note-img-1.png,./assets/note-img-2.png,./assets/note-img-3.png" \
  --title="【3分でわかる】Miyabi" \
  --subtitle="見えないアシスタント" \
  --duration=5 \
  --output="./note-promo.mp4"
```

### 2. チュートリアル動画

```bash
# ステップバイステップチュートリアル
npm run generate-video -- \
  --images="./step1.png,./step2.png,./step3.png" \
  --audio="./tutorial-narration.wav" \
  --title="Miyabiの使い方" \
  --duration=10 \
  --output="./tutorial.mp4"
```

### 3. 機能紹介動画（1分）

```bash
# 10個の機能を紹介（各6秒）
npm run generate-video -- \
  --images="./feature1.png,./feature2.png,...,./feature10.png" \
  --duration=6 \
  --transition=slide \
  --output="./feature-showcase.mp4"
```

## Advanced Usage

### 複数動画の結合

```bash
# 3つの動画を結合
echo "file './video1.mp4'" > list.txt
echo "file './video2.mp4'" >> list.txt
echo "file './video3.mp4'" >> list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy ./final-video.mp4
```

### BGM追加

```bash
# 既存動画にBGM追加
ffmpeg -i ./video.mp4 -i ./bgm.mp3 -c:v copy -c:a aac -b:a 192k -shortest ./video-with-bgm.mp4
```

### 動画圧縮

```bash
# ファイルサイズ削減
ffmpeg -i ./video.mp4 -vcodec libx264 -crf 28 ./video-compressed.mp4
```

## Workflow Example: Miyabi Promo Video

完全なワークフロー例（画像生成 → TTS音声 → 動画生成）：

```bash
# Step 1: 画像生成（Gemini Image）
npm run generate-image -- \
  "Modern office with AI assistants working invisibly" \
  --output=./assets/promo-1.png \
  --aspect-ratio=16:9

npm run generate-image -- \
  "3-step workflow infographic" \
  --output=./assets/promo-2.png \
  --aspect-ratio=16:9

npm run generate-image -- \
  "6 AI staff members illustration" \
  --output=./assets/promo-3.png \
  --aspect-ratio=16:9

# Step 2: TTS音声生成
npm run generate-speech -- \
  "Miyabiは見えないアシスタントとして、あなたの仕事を自動化します" \
  --voice=Kore \
  --output=./assets/promo-audio-1.wav

npm run generate-speech -- \
  "朝、やることメモを残すだけで、夕方には完成報告が届きます" \
  --voice=Kore \
  --output=./assets/promo-audio-2.wav

npm run generate-speech -- \
  "6種類のAIスタッフが24時間365日働きます" \
  --voice=Kore \
  --output=./assets/promo-audio-3.wav

# Step 3: 音声結合
echo "file './assets/promo-audio-1.wav'" > audio-list.txt
echo "file './assets/promo-audio-2.wav'" >> audio-list.txt
echo "file './assets/promo-audio-3.wav'" >> audio-list.txt
ffmpeg -f concat -safe 0 -i audio-list.txt -c copy ./assets/promo-audio-combined.wav

# Step 4: 動画生成
npm run generate-video -- \
  --images="./assets/promo-1.png,./assets/promo-2.png,./assets/promo-3.png" \
  --audio="./assets/promo-audio-combined.wav" \
  --title="Miyabi" \
  --subtitle="見えないアシスタント" \
  --transition=fade \
  --output="./miyabi-promo.mp4"
```

## Output Specifications

### 動画形式

- **Format**: MP4 (H.264 + AAC)
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Frame Rate**: 30fps
- **Video Codec**: libx264
- **Audio Codec**: AAC 192kbps
- **Color Space**: yuv420p

### プラットフォーム最適化

| Platform | Aspect Ratio | Max Length | Notes |
|----------|-------------|------------|-------|
| **TikTok** | 9:16 | 60s | ✅ 最適 |
| **YouTube Shorts** | 9:16 | 60s | ✅ 最適 |
| **Instagram Reels** | 9:16 | 90s | ✅ 最適 |
| **Instagram Stories** | 9:16 | 15s | ✅ 最適 |

## Troubleshooting

### FFmpegがない

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows
# https://ffmpeg.org/download.html からダウンロード
```

### メモリ不足エラー

長時間動画や高解像度画像の場合：

```bash
# 画像を事前に最適化
mogrify -resize 1920x1080 ./images/*.png

# または動画生成時に低解像度で
npm run generate-video -- --images=... --width=720 --height=1280
```

### 音声と動画の長さが一致しない

```bash
# 音声の長さを確認
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ./audio.wav

# 動画の長さを音声に合わせる
npm run generate-video -- --images=... --duration=<calculated>
```

### テキストオーバーレイが表示されない

日本語フォントが必要な場合：

```bash
# macOS: Hiragino Sans使用（システムフォント）
# Linux: IPAフォントインストール
sudo apt install fonts-ipafont fonts-ipaexfont
```

## Tips & Best Practices

### 1. 画像の準備

- **推奨解像度**: 1024x1024以上
- **アスペクト比**: 正方形または16:9
- **ファイル形式**: PNG（透過対応）またはJPG
- **ファイルサイズ**: 5MB以下

### 2. TTS音声の最適化

- **文字数**: 1シーンあたり30-50文字
- **速度**: ゆっくりめ（句読点を適切に使用）
- **音声**: Kore（汎用）、Charon（ナレーション）推奨

### 3. 動画の構成

```
00:00-00:03  イントロ（タイトル）
00:03-00:10  メインコンテンツ（2-3シーン）
00:10-00:15  アウトロ（CTA）
```

### 4. ファイルサイズ削減

```bash
# 圧縮率調整（crf 18-28, 低いほど高画質）
npm run generate-video -- --images=... --output=./video.mp4
ffmpeg -i ./video.mp4 -vcodec libx264 -crf 25 ./video-compressed.mp4
```

## Integration with Other Tools

### 画像生成 + TTS + 動画

全自動ワークフロー:

```bash
#!/bin/bash
# generate-promo-video.sh

# 1. 画像生成
npm run generate-image -- "Prompt 1" --output=./img1.png --aspect-ratio=16:9
npm run generate-image -- "Prompt 2" --output=./img2.png --aspect-ratio=16:9

# 2. TTS生成
npm run generate-speech -- "Text 1" --output=./audio1.wav
npm run generate-speech -- "Text 2" --output=./audio2.wav

# 3. 音声結合
echo "file './audio1.wav'" > audio-list.txt
echo "file './audio2.wav'" >> audio-list.txt
ffmpeg -f concat -safe 0 -i audio-list.txt -c copy ./audio-combined.wav

# 4. 動画生成
npm run generate-video -- \
  --images="./img1.png,./img2.png" \
  --audio="./audio-combined.wav" \
  --title="My Video" \
  --output="./final-video.mp4"
```

## Examples

### Example 1: Miyabi紹介動画

```bash
npm run generate-video -- \
  --images="./assets/miyabi-note-article-image-1-invisible-assistant.png,./assets/miyabi-note-article-image-2-workflow.png,./assets/miyabi-note-article-image-3-staff.png" \
  --title="Miyabi" \
  --subtitle="見えないアシスタント" \
  --transition=none \
  --duration=5 \
  --output="./assets/miyabi-intro.mp4"
```

**結果**:
- ファイルサイズ: 372KB
- 長さ: 15秒
- 解像度: 1080x1920

### Example 2: テンプレート使用

```bash
npm run generate-video -- --template=miyabi-intro
```

自動的に：
- 3枚の画像を選択
- TTS音声を生成（3つのナレーション）
- 音声を結合
- タイトル・サブタイトル追加
- 動画を生成

## Related Documents

- [Image Generation Guide](./IMAGE_GENERATION_SETUP.md)
- [TTS Generation Guide](./GEMINI_TTS_GUIDE.md)
- [TTS Implementation Summary](./TTS_IMPLEMENTATION_SUMMARY.md)

---

**Last Updated**: 2025-10-13
**Version**: 1.0.0
