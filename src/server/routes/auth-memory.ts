import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { AuthService } from '../utils/auth';

// 内存存储（临时解决方案）
const users = new Map();
const userIdCounter = 1;

const auth = new Hono();

// 简单的用户类
class MemoryUser {
  constructor(username, email, passwordHash) {
    this.id = `user_${userIdCounter.value++}`;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = 'user';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

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
    const existingUser = Array.from(users.values()).find(u => u.email === email);
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
    const existingUsername = Array.from(users.values()).find(u => u.username === username);
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

    // Create user
    const newUser = new MemoryUser(username, email, passwordHash);
    users.set(newUser.id, newUser);

    // Generate token
    const token = AuthService.generateToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    });

    console.log('User registered (memory)', { userId: newUser.id, email });

    return c.json({
      success: true,
      data: {
        user: newUser.toJSON(),
        token,
      }
    });

  } catch (error) {
    console.error('Registration failed', { error });
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
    const user = Array.from(users.values()).find(u => u.email === email);

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

    console.log('User logged in (memory)', { userId: user.id, email });

    return c.json({
      success: true,
      data: {
        user: user.toJSON(),
        token,
      }
    });

  } catch (error) {
    console.error('Login failed', { error });
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
      return c.json({
        success: false,
        error: {
          code: 'NO_AUTH_HEADER',
          message: 'No authorization header',
        }
      }, 401);
    }

    const token = AuthService.extractToken(authHeader);
    const payload = AuthService.verifyToken(token);

    // Get user from memory
    const user = Array.from(users.values()).find(u => u.id === payload.userId);

    if (!user) {
      return c.json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        }
      }, 401);
    }

    return c.json({
      success: true,
      data: {
        user: user.toJSON(),
        valid: true,
      }
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'TOKEN_INVALID',
        message: 'Token is invalid',
      }
    }, 401);
  }
});

export default auth;