# Miyabi ライセンス戦略 - オープンコアモデル

**作成日**: 2025-10-11
**Version**: 1.0.0
**ステータス**: **推奨案**

---

## 🎯 推奨ライセンス構造: 3層オープンコアモデル

初期ユーザーの反応が良い今こそ、将来の収益化を見据えた**戦略的ライセンス設計**が重要です。

**基本方針**:
- ✅ **コミュニティを殺さない** - オープンソースのメリットを最大化
- ✅ **収益化の道筋を確保** - Pro/Enterprise版で明確な差別化
- ✅ **法的リスク最小化** - 大手が真似しにくい構造

---

## 📋 推奨ライセンス構造

### 🟢 Layer 1: Miyabi Core (オープンソース)

**ライセンス**: **Apache License 2.0** ← **MIT Licenseから変更を推奨**

**理由**:
1. **特許保護**: Apache 2.0には特許条項があり、大手企業の特許攻撃から防御できる
2. **商標保護**: "Miyabi"ブランドを保護しやすい
3. **エンタープライズフレンドリー**: 企業が採用しやすい（MITよりも法的に明確）
4. **成功事例**: Kubernetes, TensorFlow, Android（全てApache 2.0）

**対象コード**:
```
packages/cli/
├── src/commands/
│   ├── init.ts          ✅ Apache 2.0
│   ├── install.ts       ✅ Apache 2.0
│   ├── status.ts        ✅ Apache 2.0
│   └── config.ts        ✅ Apache 2.0
├── src/setup/           ✅ Apache 2.0
├── templates/           ✅ Apache 2.0
│   ├── labels.yml
│   └── workflows/
└── .claude/             ✅ Apache 2.0
```

**機能**:
- ✅ 基本CLI (`init`, `install`, `status`, `config`)
- ✅ 53ラベル体系
- ✅ 12+ GitHub Actions
- ✅ 基本Agent機能（制限付き）
- ✅ Claude Code統合

**公開場所**:
- GitHub: https://github.com/ShunsukeHayashi/Miyabi （Public）
- npm: `miyabi` （無料）

---

### 🟡 Layer 2: Miyabi Pro (クローズドソース)

**ライセンス**: **Miyabi Pro License (独自EULA)** ← 新規作成

**理由**:
1. **ソースコード非公開**: 競合が機能をコピーできない
2. **利用制限**: 商用利用は有料ライセンス必須
3. **再配布禁止**: Pro版を勝手に再配布できない

**対象コード**:
```
packages/cli-pro/        ⚠️ クローズドソース（新規パッケージ）
├── src/agents/
│   ├── codegen-pro.ts   🔒 GPT-4/Claude Opus統合
│   ├── review-pro.ts    🔒 詳細レポート生成
│   └── deploy-pro.ts    🔒 マルチクラウド対応
├── src/dashboard/       🔒 Web ダッシュボード
├── src/analytics/       🔒 チームメトリクス
└── src/webhooks/        🔒 カスタムWebhook
```

**機能**:
- 🔒 高度なAgent機能（GPT-4, Claude Opus）
- 🔒 Webダッシュボード & アナリティクス
- 🔒 Webhook統合（Slack, Discord）
- 🔒 プライオリティサポート
- 🔒 SSO, 監査ログ

**配布方法**:
- npm: `@miyabi/pro` （Private package）
- ライセンスキー認証（サーバーサイド検証）

**ライセンス条項例**:
```
Miyabi Pro License Agreement

1. ライセンス付与
   本ライセンスは、有効なサブスクリプション期間中のみ有効です。

2. 制限事項
   (a) ソースコードの閲覧・改変・再配布を禁止
   (b) リバースエンジニアリングを禁止
   (c) 商用利用は有料ライセンス必須
   (d) ライセンスキーの共有禁止

3. サブスクリプション
   月額$49または年額$490で提供されます。

4. 終了条項
   サブスクリプション終了後、Pro機能へのアクセスは停止されます。
```

---

### 🔴 Layer 3: Miyabi Enterprise (デュアルライセンス)

**ライセンス**: **Miyabi Enterprise License (カスタムEULA)** + **オンプレミス版は買い切りオプション**

**理由**:
1. **柔軟な契約形態**: SaaS版とオンプレミス版で異なる条件
2. **カスタマイズ許可**: 企業独自の改変を認める（Non-disclosure契約下）
3. **買い切りオプション**: 永続ライセンスで大口顧客を獲得

**対象コード**:
```
packages/cli-enterprise/  ⚠️ 完全クローズド
├── src/onpremise/        🔒 オンプレミス対応
├── src/sso/              🔒 LDAP/Active Directory
├── src/rbac/             🔒 Role-Based Access Control
├── src/custom-agents/    🔒 カスタムAgent SDK
└── src/compliance/       🔒 GDPR/HIPAA対応
```

**機能**:
- 🔒 オンプレミス/プライベートクラウド
- 🔒 カスタムAgent開発SDK
- 🔒 LDAP/AD統合、RBAC
- 🔒 99.9% SLA、専任CSM
- 🔒 GDPR/HIPAA/FedRAMP対応

**価格モデル**:
1. **SaaS版**: $499/月～（サブスクリプション）
2. **オンプレミス版（買い切り）**: $50,000～（永続ライセンス + 年間サポート20%）

**ライセンス条項例**:
```
Miyabi Enterprise License Agreement

1. ライセンス付与
   (a) SaaS版: サブスクリプション期間中のみ
   (b) オンプレミス版: 永続的な利用権（買い切り）

2. カスタマイズ
   企業は独自の改変が可能（Non-disclosure契約下）

3. サポート & メンテナンス
   年間サポート契約（ライセンス費用の20%）

4. データ所有権
   企業のデータは完全に企業に帰属
```

---

## 🏆 成功事例から学ぶライセンス戦略

### 1. GitLab（最も近いモデル）

**ライセンス構造**:
- **Core**: MIT License（オープンソース）
- **Premium/Ultimate**: Proprietary License（クローズド）

**収益**: $500M ARR（2023）

**学び**:
- オープンソースでコミュニティ構築
- Premium機能を明確に差別化（CI/CD, Security Scanning）
- Self-hosted版とSaaS版の両方を提供

**Miyabiへの応用**:
✅ 同じモデルを採用（Core = Apache 2.0, Pro/Enterprise = Proprietary）

---

### 2. Elastic（危険な前例）

**ライセンス構造**（変更前）:
- **Elasticsearch**: Apache 2.0

**問題**:
- AWSがElasticsearchを無料で提供（AWS Elasticsearch Service）
- Elasticの収益を奪った

**対策**（変更後）:
- **2021年**: Apache 2.0 → **Server Side Public License (SSPL)** に変更
- SaaSプロバイダーは有料ライセンス必須

**学び**:
⚠️ Apache 2.0のままだと、AWSなどの大手が勝手にSaaS化できる

**Miyabiへの応用**:
⚠️ **Pro/Enterprise機能は絶対にクローズドに保つ**
⚠️ CoreをSSPLに変更する選択肢も検討（ただし、コミュニティの反発リスクあり）

---

### 3. Sentry（理想的なバランス）

**ライセンス構造**:
- **Sentry Core**: BSL (Business Source License 1.1)
  - 4年後に自動的にApache 2.0に変更
  - SaaSとしての提供は禁止（Sentry社のみ）

**収益**: $100M ARR

**学び**:
- BSLで「SaaS競合を防ぐ」+「将来的にオープンソース化」のバランス
- コミュニティの反発を最小化

**Miyabiへの応用**:
✅ **Pro/Enterprise機能にBSL 1.1を採用する選択肢**
- 4年後にApache 2.0へ自動変更
- SaaSとしての提供はMiyabi社のみ（他社は禁止）

---

## 📜 具体的なライセンスファイル構成

### ルートディレクトリ

```
Miyabi/
├── LICENSE                    # Apache 2.0 (Core用)
├── LICENSE-PRO                # Miyabi Pro License (Pro用)
├── LICENSE-ENTERPRISE         # Miyabi Enterprise License (Enterprise用)
├── NOTICE                     # Apache 2.0必須ファイル
└── packages/
    ├── cli/                   # Core (Apache 2.0)
    │   ├── LICENSE → ../../LICENSE
    │   └── package.json       # "license": "Apache-2.0"
    ├── cli-pro/               # Pro (Proprietary)
    │   ├── LICENSE → ../../LICENSE-PRO
    │   └── package.json       # "license": "SEE LICENSE IN LICENSE-PRO"
    └── cli-enterprise/        # Enterprise (Proprietary)
        ├── LICENSE → ../../LICENSE-ENTERPRISE
        └── package.json       # "license": "SEE LICENSE IN LICENSE-ENTERPRISE"
```

---

## 🛡️ ライセンス違反の検知と対策

### 1. ライセンスキー認証

**Pro/Enterprise版の起動時**:
```typescript
// packages/cli-pro/src/auth/license-check.ts
import axios from 'axios';

async function verifyLicense(licenseKey: string): Promise<boolean> {
  try {
    const response = await axios.post('https://api.miyabi.dev/v1/license/verify', {
      key: licenseKey,
      machineId: getMachineId(),
    });

    if (response.data.valid) {
      return true;
    } else {
      console.error('❌ Invalid license key. Please contact sales@miyabi.dev');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ License verification failed');
    process.exit(1);
  }
}
```

### 2. テレメトリーによる不正利用検知

**匿名化された使用統計**:
```typescript
// Pro/Enterprise版のみ
async function sendTelemetry() {
  await axios.post('https://telemetry.miyabi.dev/v1/usage', {
    licenseKey: hash(licenseKey), // ハッシュ化
    command: 'agent:run',
    timestamp: Date.now(),
    machineIdHash: hash(getMachineId()),
  });
}
```

**不正利用パターン**:
- 同一ライセンスキーが複数のマシンIDで使用されている（シェアの疑い）
- 極端に高い使用頻度（転売の疑い）

### 3. GitHub Actions での検知

**オープンソースリポジトリでPro機能を使おうとしている**:
```yaml
# .github/workflows/detect-pro-usage.yml
name: Detect Pro Usage in Public Repo

on: [push]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check for Pro package
        run: |
          if grep -r "@miyabi/pro" .; then
            echo "❌ @miyabi/pro detected in public repo"
            echo "This violates the Miyabi Pro License"
            exit 1
          fi
```

---

## ⚖️ オープンソースコミュニティとの関係

### コミュニティを大切にする施策

1. **明確なロードマップ公開**
   - Pro機能の一部を将来的にCoreに降格（年1-2機能）
   - 例: 「2年前のPro機能は今年Coreに」

2. **オープンソース貢献者への特典**
   - 100+ commits達成者: Pro版無料
   - バグ報告者: Pro版1ヶ月無料

3. **Community版の継続強化**
   - Pro版だけでなく、Community版にも新機能追加
   - 「Community版は二流」というイメージを避ける

4. **透明性**
   - 収益の10%をオープンソース財団に寄付
   - GitHub Sponsorsを通じた還元

---

## 🚀 ライセンス移行プラン

### Phase 1: 現在（v0.12.0）

**現状**: 全てMIT License

**アクション**: まだ変更しない（タイミング早すぎ）

---

### Phase 2: v1.0.0リリース時（3-6ヶ月後）

**タイミング**: 有料ユーザー100人達成後

**変更内容**:
1. **Core**: MIT → **Apache 2.0** に変更
   - 理由: 特許保護、商標保護
   - 影響: ほぼゼロ（Apache 2.0はMIT互換）

2. **Pro/Enterprise**: 新規パッケージ作成（クローズドソース）
   - `@miyabi/pro` を新規リリース
   - `@miyabi/enterprise` を新規リリース

**コミュニケーション**:
```markdown
# Miyabi v1.0.0 Release Notes

## ライセンス変更のお知らせ

Miyabi Coreは引き続き**オープンソース**です。
ただし、より良い法的保護のため、MIT License → Apache 2.0 License に変更します。

これにより:
- ✅ 特許攻撃からの保護
- ✅ 商標"Miyabi"の保護
- ✅ エンタープライズ企業が採用しやすく

**既存ユーザーへの影響**: ゼロ（Apache 2.0はMIT互換）
```

---

### Phase 3: v2.0.0リリース時（1年後）

**タイミング**: ARR $500K達成後

**検討事項**:
1. **BSL (Business Source License) への移行検討**
   - Pro機能の一部をBSLに（4年後にApache 2.0へ自動変更）
   - SaaS競合を防ぐ

2. **Trademark Policy の強化**
   - "Miyabi"商標登録完了
   - "Miyabi"の商用利用にはライセンス必須

---

## 📝 推奨アクション（今すぐ実行）

### 1. Apache 2.0への移行準備（v1.0.0で実施）

**ファイル追加**:
```bash
# LICENSE ファイルを Apache 2.0 に置き換え
wget https://www.apache.org/licenses/LICENSE-2.0.txt -O LICENSE

# NOTICE ファイル作成（Apache 2.0必須）
cat > NOTICE <<EOF
Miyabi
Copyright 2025 Shunsuke Hayashi

This product includes software developed by
The Apache Software Foundation (http://www.apache.org/).
EOF
```

**package.json 更新**:
```json
{
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/ShunsukeHayashi/Miyabi.git"
  },
  "bugs": {
    "url": "https://github.com/ShunsukeHayashi/Miyabi/issues"
  }
}
```

**各ファイルにヘッダー追加**:
```typescript
/**
 * Copyright 2025 Shunsuke Hayashi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
```

---

### 2. Pro/Enterprise パッケージの準備

**ディレクトリ構造**:
```bash
mkdir -p packages/cli-pro
mkdir -p packages/cli-enterprise

# Pro用 LICENSE ファイル
cat > packages/cli-pro/LICENSE <<EOF
Miyabi Pro License Agreement

Copyright (c) 2025 Shunsuke Hayashi. All rights reserved.

This software and associated documentation files (the "Software") are
licensed, not sold. By installing or using the Software, you agree to
the terms of this license.

1. LICENSE GRANT
   Subject to the terms of this Agreement and payment of applicable fees,
   Licensor grants you a limited, non-exclusive, non-transferable license
   to use the Software.

2. RESTRICTIONS
   You may NOT:
   - Distribute, sublicense, or resell the Software
   - Reverse engineer, decompile, or disassemble the Software
   - Remove or modify any proprietary notices
   - Use the Software to provide SaaS offerings

3. SUBSCRIPTION
   This license is valid only during an active subscription period.

4. TERMINATION
   This license terminates automatically upon subscription expiration.

For questions, contact: sales@miyabi.dev
EOF
```

---

### 3. 商標登録の開始

**日本**:
- 特許庁に「Miyabi」商標登録申請
- 区分: 第9類（ソフトウェア）、第42類（SaaS）

**米国**:
- USPTO（米国特許商標庁）に申請
- 費用: 約$1,000

**弁理士に依頼**:
- 推定費用: 15万円〜30万円（日本）

---

## 🎓 まとめ: 推奨ライセンス構造

| レイヤー | ライセンス | 理由 | いつ変更するか |
|---------|-----------|------|---------------|
| **Core** | Apache 2.0 | 特許保護、商標保護、企業採用しやすい | v1.0.0リリース時 |
| **Pro** | Proprietary (独自EULA) | ソースコード非公開、競合防止 | v1.0.0リリース時 |
| **Enterprise** | Proprietary + 買い切りオプション | 柔軟な契約、大口顧客獲得 | v1.0.0リリース時 |

**Key Point**:
1. ✅ **今は変更しない** - v1.0.0まで待つ（有料ユーザー100人達成後）
2. ✅ **Apache 2.0に移行** - MIT → Apache 2.0（特許保護）
3. ✅ **Pro/Enterpriseはクローズド** - 絶対にオープンソース化しない
4. ✅ **BSL検討** - v2.0.0で「SaaS禁止」条項を追加する選択肢

---

**次のアクション**:
- [ ] Apache 2.0移行準備（v1.0.0で実施）
- [ ] Pro/Enterpriseパッケージ設計
- [ ] 商標登録弁理士に相談
- [ ] ライセンスキー認証システム開発

---

**作成者**: Shunsuke Hayashi
**レビュー推奨**: 弁護士（知的財産専門）
**最終更新**: 2025-10-11
