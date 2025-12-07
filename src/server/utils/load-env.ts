import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OLLAMA_BASE_URL'
];

// Supabase is optional, but if SUPABASE_URL is set, SUPABASE_ANON_KEY is required
if (process.env.SUPABASE_URL && !process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is required when SUPABASE_URL is set');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is required but not set`);
  }
}

// Export configuration
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.1',
  },
  server: {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.SERVER_PORT || '3000'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || '10MB',
  },
  log: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10'),
    maxAttempts: parseInt(process.env.QUEUE_MAX_ATTEMPTS || '3'),
    backoffType: process.env.QUEUE_BACKOFF_TYPE || 'exponential',
  },
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    enabled: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
  },
} as const;