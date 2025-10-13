# 認証システム (Authentication System)

Miyabiプロジェクトの認証システムドキュメント

## 概要

お客様向けのログイン機能を提供する認証システムです。JWT（JSON Web Token）ベースの認証を使用し、セキュアなパスワード管理と「ログイン状態を保持」機能を実装しています。

## 機能一覧

### 1. ログイン機能
- 名前とパスワードによる認証
- パスワードはbcryptでハッシュ化して安全に保存
- アクセストークンは30分有効
- 「ログイン状態を保持」チェックボックスでリフレッシュトークン発行（30日間有効）

### 2. ログアウト機能
- トークンをクリア
- LocalStorageとSessionStorageの両方から認証情報を削除

### 3. トークンリフレッシュ機能
- 「ログイン状態を保持」を選択した場合、リフレッシュトークンで新しいアクセストークンを取得可能

### 4. セッション管理
- `rememberMe: false` → SessionStorageに保存（ブラウザを閉じると消える）
- `rememberMe: true` → LocalStorageに保存（ブラウザを閉じても維持）

## アーキテクチャ

### バックエンド (api/)

#### 1. 型定義 (`api/lib/types.ts`)
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  name: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
  };
}
```

#### 2. ユーザーサービス (`api/services/user-service.ts`)
- インメモリストレージでユーザー管理
- bcryptjsでパスワードハッシュ化
- ユーザーの作成・検索・認証機能

**デフォルトテストユーザー**:
| 名前 | パスワード | ロール |
|------|-----------|--------|
| admin | admin123 | admin |
| testuser | test123 | user |
| customer | customer123 | user |

#### 3. 認証ルート (`api/routes/auth.ts`)

##### POST `/v1/auth/login`
ログイン

**リクエスト**:
```json
{
  "name": "admin",
  "password": "admin123",
  "rememberMe": true
}
```

**レスポンス**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 1800,
  "user": {
    "id": "user_123",
    "name": "admin",
    "email": "admin@miyabi.example.com",
    "role": "admin"
  }
}
```

##### POST `/v1/auth/refresh`
トークンリフレッシュ

**リクエスト**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**レスポンス**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 1800,
  "user": {
    "id": "user_123",
    "name": "admin",
    "email": "admin@miyabi.example.com",
    "role": "admin"
  }
}
```

##### POST `/v1/auth/logout`
ログアウト（要認証）

**ヘッダー**:
```
Authorization: Bearer <accessToken>
```

**レスポンス**:
```json
{
  "message": "Logged out successfully"
}
```

##### GET `/v1/auth/me`
現在のユーザー情報取得（要認証）

**ヘッダー**:
```
Authorization: Bearer <accessToken>
```

**レスポンス**:
```json
{
  "id": "user_123",
  "name": "admin",
  "email": "admin@miyabi.example.com",
  "role": "admin",
  "createdAt": "2025-10-13T10:00:00.000Z",
  "updatedAt": "2025-10-13T10:00:00.000Z"
}
```

#### 4. 認証ミドルウェア (`api/middleware/auth.ts`)
- JWTトークンの検証
- アクセストークン有効期限: **30分**
- リフレッシュトークン有効期限: **30日**

### フロントエンド (packages/dashboard/)

#### 1. ログインコンポーネント (`src/components/Login.tsx`)
- 名前入力フィールド
- パスワード入力フィールド（type="password"）
- 「ログイン状態を保持」チェックボックス
- テストアカウント情報表示
- エラーメッセージ表示
- ローディング状態

#### 2. 認証サービス (`src/services/auth.ts`)
- APIとの通信
- トークン管理（LocalStorage/SessionStorage）
- ログイン・ログアウト・リフレッシュ機能

#### 3. App統合 (`src/App.tsx`)
- 認証状態の管理
- 未認証時はログイン画面表示
- 認証済みの場合はダッシュボード表示
- ヘッダーにユーザー名とログアウトボタン表示

## セキュリティ

### パスワード保存
- bcryptjsでハッシュ化（ソルトラウンド: 10）
- 平文パスワードは保存しない

### トークン管理
- JWT_SECRET環境変数で署名
- アクセストークン: 30分で期限切れ
- リフレッシュトークン: 30日で期限切れ

### ストレージ
- `rememberMe: false` → SessionStorage（ブラウザを閉じると削除）
- `rememberMe: true` → LocalStorage（永続的に保存）

## 使い方

### 1. APIサーバーの起動

```bash
# 環境変数を設定
export JWT_SECRET="your-secret-key-here"

# APIサーバー起動
cd api
npm install
npm run dev
```

### 2. フロントエンドの起動

```bash
# ダッシュボード起動
cd packages/dashboard
npm install
npm run dev
```

### 3. ログイン

ブラウザで `http://localhost:5173` にアクセスし、テストアカウントでログイン：

- 名前: `admin`
- パスワード: `admin123`
- 「ログイン状態を保持」にチェックを入れると、ブラウザを閉じても認証状態が保持されます

## 環境変数

### api/.env
```env
JWT_SECRET=your-secret-key-here
PORT=3000
NODE_ENV=development
```

### packages/dashboard/.env
```env
VITE_API_URL=http://localhost:3000
```

## 実装ファイル

### バックエンド
- `api/lib/types.ts` - 型定義
- `api/services/user-service.ts` - ユーザー管理
- `api/routes/auth.ts` - 認証ルート
- `api/middleware/auth.ts` - 認証ミドルウェア
- `api/index.ts` - APIエントリーポイント

### フロントエンド
- `packages/dashboard/src/components/Login.tsx` - ログインUI
- `packages/dashboard/src/services/auth.ts` - 認証サービス
- `packages/dashboard/src/App.tsx` - アプリケーションルート

## トラブルシューティング

### ログインできない
1. APIサーバーが起動しているか確認
2. CORS設定を確認（api/index.tsで設定済み）
3. JWT_SECRET環境変数が設定されているか確認

### トークンが期限切れ
- アクセストークンは30分で期限切れ
- 「ログイン状態を保持」を選択した場合は、リフレッシュトークンで自動更新可能
- それ以外の場合は再ログインが必要

### LocalStorageが保存されない
- ブラウザのプライベートモードではLocalStorageが無効化される場合があります
- ブラウザのストレージ設定を確認してください

## 今後の拡張

- [ ] パスワードリセット機能
- [ ] メール認証
- [ ] 2要素認証（2FA）
- [ ] ソーシャルログイン（Google, GitHub）
- [ ] トークンブラックリスト（ログアウト時の即時無効化）
- [ ] データベース統合（Supabase, PostgreSQL）
- [ ] レート制限（ブルートフォース攻撃対策）

---

**作成日**: 2025年10月13日
**バージョン**: 1.0.0
