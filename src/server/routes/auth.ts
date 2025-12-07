import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { AuthService, AuthError } from '../utils/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

const auth = new Hono();

// Register schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Register endpoint
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { username, email, password } = c.req.valid('json');

  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return c.json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists',
        }
      }, 409);
    }

    // Check username
    const existingUsername = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (existingUsername) {
      return c.json({
        success: false,
        error: {
          code: 'USERNAME_EXISTS',
          message: 'Username already taken',
        }
      }, 409);
    }

    // Hash password
    const passwordHash = await AuthService.hashPassword(password);

    // Generate user ID
    const userId = nanoid();

    // Create user
    const [newUser] = await db.insert(users).values({
      id: userId,
      username,
      email,
      passwordHash,
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

    // Generate token
    const token = AuthService.generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    logger.info('User registered', { userId: newUser.id, email });

    return c.json({
      success: true,
      data: {
        user: newUser,
        token,
      }
    });

  } catch (error) {
    logger.error('Registration failed', { error });
    return c.json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user',
      }
    }, 500);
  }
});

// Login endpoint
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  try {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      }, 401);
    }

    // Check password
    const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        }
      }, 401);
    }

    // Generate token
    const token = AuthService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in', { userId: user.id, email });

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      }
    });

  } catch (error) {
    logger.error('Login failed', { error });
    return c.json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to login',
      }
    }, 500);
  }
});

// Verify token endpoint
auth.get('/verify', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      throw new AuthError('No authorization header', 'NO_AUTH_HEADER');
    }

    const token = AuthService.extractToken(authHeader);
    const payload = AuthService.verifyToken(token);

    // Get user from database
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

    return c.json({
      success: true,
      data: {
        user,
        valid: true,
      }
    });

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
        code: 'TOKEN_INVALID',
        message: 'Token is invalid',
      }
    }, 401);
  }
});

// Refresh token endpoint
auth.post('/refresh', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      throw new AuthError('No authorization header', 'NO_AUTH_HEADER');
    }

    const token = AuthService.extractToken(authHeader);
    const payload = AuthService.verifyToken(token);

    // Get user from database
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

    // Generate new token
    const newToken = AuthService.generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return c.json({
      success: true,
      data: {
        token: newToken,
      }
    });

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
        code: 'REFRESH_FAILED',
        message: 'Failed to refresh token',
      }
    }, 401);
  }
});

export default auth;