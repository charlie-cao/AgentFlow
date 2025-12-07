import { Context, Next } from 'hono';
import { AuthService, AuthError, hasRole } from '../utils/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// JWT Authentication middleware
export async function requireAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    const token = AuthService.extractToken(authHeader);
    const payload = AuthService.verifyToken(token);

    // Verify user still exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
      columns: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AuthError('User not found', 'USER_NOT_FOUND');
    }

    // Attach user to context
    c.set('user', user);
    c.set('userId', payload.userId);

    await next();
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        }
      }, 401);
    }

    return c.json({
      success: false,
      error: {
        code: 'AUTH_FAILED',
        message: 'Authentication failed',
      }
    }, 401);
  }
}

// Role-based access control middleware
export function requireRole(roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user || !hasRole(user.role, roles)) {
      return c.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions',
        }
      }, 403);
    }

    await next();
  };
}

// Optional authentication - doesn't fail if no token
export async function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      const token = AuthService.extractToken(authHeader);
      const payload = AuthService.verifyToken(token);

      const user = await db.query.users.findFirst({
        where: eq(users.id, payload.userId),
        columns: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });

      if (user) {
        c.set('user', user);
        c.set('userId', payload.userId);
      }
    }
  } catch {
    // Ignore auth errors for optional auth
  }

  await next();
}