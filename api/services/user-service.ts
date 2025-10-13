/**
 * User Service
 * Handles user authentication and management
 */

import bcrypt from 'bcryptjs';
import { User, LoginCredentials } from '../lib/types';

/**
 * In-memory user storage
 * In production, replace with database (Supabase, PostgreSQL, etc.)
 */
const users: Map<string, User> = new Map();

/**
 * Initialize default test users
 */
async function initializeDefaultUsers(): Promise<void> {
  const defaultUsers: Array<{ name: string; email: string; password: string; role: 'user' | 'admin' }> = [
    { name: 'admin', email: 'admin@miyabi.example.com', password: 'admin123', role: 'admin' },
    { name: 'testuser', email: 'test@miyabi.example.com', password: 'test123', role: 'user' },
    { name: 'customer', email: 'customer@example.com', password: 'customer123', role: 'user' },
  ];

  for (const userData of defaultUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: userData.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.set(user.name, user);
  }
}

// Initialize default users on module load
initializeDefaultUsers().catch(console.error);

/**
 * UserService class
 */
export class UserService {
  /**
   * Find user by name
   */
  async findByName(name: string): Promise<User | null> {
    return users.get(name) || null;
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    for (const user of users.values()) {
      if (user.id === id) {
        return user;
      }
    }
    return null;
  }

  /**
   * Verify user credentials
   */
  async verifyCredentials(credentials: LoginCredentials): Promise<User | null> {
    const user = await this.findByName(credentials.name);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Create a new user
   */
  async createUser(
    name: string,
    email: string,
    password: string,
    role: 'user' | 'admin' = 'user'
  ): Promise<User> {
    // Check if user already exists
    if (users.has(name)) {
      throw new Error(`User with name "${name}" already exists`);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(name, user);
    return user;
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.updatedAt = new Date();
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    users.delete(user.name);
  }

  /**
   * List all users (admin only)
   */
  async listUsers(): Promise<Array<Omit<User, 'passwordHash'>>> {
    return Array.from(users.values()).map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

// Export singleton instance
export const userService = new UserService();
