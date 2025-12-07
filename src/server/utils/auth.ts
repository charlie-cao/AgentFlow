import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './load-env';
import type { JWTPayload } from '@shared/types';

export class AuthError extends Error {
  constructor(message: string, public code: string = 'AUTH_ERROR') {
    super(message);
    this.name = 'AuthError';
  }
}

export class AuthService {
  // Generate JWT token
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JWTPayload;
    } catch (error) {
      throw new AuthError('Invalid token', 'INVALID_TOKEN');
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Extract token from Authorization header
  static extractToken(authHeader?: string): string {
    if (!authHeader) {
      throw new AuthError('No authorization header', 'NO_AUTH_HEADER');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new AuthError('Invalid authorization format', 'INVALID_AUTH_FORMAT');
    }

    return parts[1];
  }

  // Generate API key
  static generateApiKey(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash API key
  static async hashApiKey(apiKey: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(apiKey, saltRounds);
  }
}

// Middleware to authenticate JWT token
export function authenticateToken(token: string): JWTPayload {
  try {
    const cleanToken = token.replace('Bearer ', '');
    return AuthService.verifyToken(cleanToken);
  } catch (error) {
    throw new AuthError('Authentication failed', 'AUTH_FAILED');
  }
}

// Role-based access control
export function hasRole(userRole: string, requiredRoles: string[]): boolean {
  if (!userRole) return false;

  const roleHierarchy = {
    'viewer': 0,
    'user': 1,
    'admin': 2,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;

  return requiredRoles.some(role => {
    const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] ?? -1;
    return userLevel >= requiredLevel;
  });
}

// Check if user has permission for a resource
export function hasPermission(
  userRole: string,
  action: string,
  resource: string,
  resourceOwnerId?: string,
  userId?: string
): boolean {
  // Admin can do everything
  if (userRole === 'admin') return true;

  // Users can manage their own resources
  if (resourceOwnerId && userId && resourceOwnerId === userId) {
    return true;
  }

  // Define permissions
  const permissions: Record<string, Record<string, string[]>> = {
    'user': {
      'projects': ['read', 'create'],
      'workflows': ['read', 'create', 'update'],
      'executions': ['read', 'create'],
      'agents': ['read', 'create', 'update'],
    },
    'viewer': {
      'projects': ['read'],
      'workflows': ['read'],
      'executions': ['read'],
      'agents': ['read'],
    },
  };

  const userPermissions = permissions[userRole];
  if (!userPermissions) return false;

  return userPermissions[resource]?.includes(action) ?? false;
}