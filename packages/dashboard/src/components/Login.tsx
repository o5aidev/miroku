/**
 * Login Component
 * Simple login form with username, password, and "remember me" checkbox
 */

import { useState, FormEvent } from 'react';

interface LoginProps {
  onLogin: (name: string, password: string, rememberMe: boolean) => Promise<void>;
}

export function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onLogin(name, password, rememberMe);
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white/10 p-8 shadow-2xl backdrop-blur-md">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-3xl shadow-lg">
            🤖
          </div>
          <h2 className="text-3xl font-bold text-white">Miyabi</h2>
          <p className="mt-2 text-sm text-gray-300">お客様ログイン</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200">
                名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="お名前を入力"
                autoComplete="username"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-colors focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="パスワードを入力"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/10 text-purple-600 focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                ログイン状態を保持
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                ログイン中...
              </span>
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* Test Accounts Info */}
        <div className="mt-6 rounded-lg bg-blue-500/10 border border-blue-500/30 px-4 py-3 text-xs text-blue-200">
          <p className="font-semibold mb-1">テストアカウント:</p>
          <p>名前: <span className="font-mono">admin</span> / パスワード: <span className="font-mono">admin123</span></p>
          <p>名前: <span className="font-mono">testuser</span> / パスワード: <span className="font-mono">test123</span></p>
          <p>名前: <span className="font-mono">customer</span> / パスワード: <span className="font-mono">customer123</span></p>
        </div>
      </div>
    </div>
  );
}
