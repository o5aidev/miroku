/**
 * Authentication Service
 * Handles API calls for authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

/**
 * Auth Service Class
 */
export class AuthService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: User | null = null;

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadFromStorage();
  }

  /**
   * Login with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'ログインに失敗しました');
    }

    const data: AuthResponse = await response.json();

    // Save tokens and user info
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken || null;
    this.user = data.user;

    // Save to localStorage if rememberMe is true
    if (credentials.rememberMe && data.refreshToken) {
      this.saveToStorage();
    } else {
      // Save only accessToken to sessionStorage
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${API_BASE_URL}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('Refresh token not found');
    }

    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      this.clearAuth();
      throw new Error('トークンの更新に失敗しました');
    }

    const data: AuthResponse = await response.json();
    this.accessToken = data.accessToken;
    this.user = data.user;

    // Update storage
    if (localStorage.getItem('refreshToken')) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
    } else {
      sessionStorage.setItem('accessToken', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    }

    return data.accessToken;
  }

  /**
   * Get current user
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && this.user !== null;
  }

  /**
   * Save tokens to localStorage
   */
  private saveToStorage(): void {
    if (this.accessToken) {
      localStorage.setItem('accessToken', this.accessToken);
    }
    if (this.refreshToken) {
      localStorage.setItem('refreshToken', this.refreshToken);
    }
    if (this.user) {
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }

  /**
   * Load tokens from localStorage
   */
  private loadFromStorage(): void {
    // Try localStorage first (for "remember me")
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');

    if (accessToken && userStr) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.user = JSON.parse(userStr);
      return;
    }

    // Try sessionStorage
    const sessionAccessToken = sessionStorage.getItem('accessToken');
    const sessionUserStr = sessionStorage.getItem('user');

    if (sessionAccessToken && sessionUserStr) {
      this.accessToken = sessionAccessToken;
      this.user = JSON.parse(sessionUserStr);
    }
  }

  /**
   * Clear all auth data
   */
  private clearAuth(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;

    // Clear from storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
  }
}

// Export singleton instance
export const authService = new AuthService();
