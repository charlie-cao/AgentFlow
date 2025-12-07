import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { config } from './utils/load-env';
import { logger } from './utils/logger';
import { serveStatic } from 'hono/bun';
import { initializeDatabase } from './db';
import { testSupabaseConnection, isSupabaseEnabled } from './services/supabase';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import workflowRoutes from './routes/workflows';
import workflowsAdvanced from './routes/workflows-advanced';
import agentRoutes from './routes/agents';
import executionRoutes from './routes/executions';
import ollamaRoutes from './routes/ollama';
import sseRoutes from './routes/sse';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', cors({
  origin: config.server.corsOrigin,
  credentials: true,
}));

app.use('*', honoLogger((message, ...rest) => {
  logger.info(message, { rest });
}));

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/projects', projectRoutes);
app.route('/api/workflows', workflowRoutes);
app.route('/api/workflows', workflowsAdvanced);
app.route('/api/agents', agentRoutes);
app.route('/api/executions', executionRoutes);
app.route('/api/ollama', ollamaRoutes);
app.route('/api/sse', sseRoutes);

// Serve static files (for production)
app.use('/static/*', serveStatic({ root: './client/dist' }));

// Serve frontend app (SPA)
app.get('*', async (c) => {
  // In development, let Vite handle the frontend
  if (process.env.NODE_ENV !== 'production') {
    return c.text('Frontend is served by Vite dev server on port 5173', 200);
  }

  try {
    const html = await Bun.file('./client/dist/index.html').text();
    return c.html(html);
  } catch {
    return c.text('Frontend not built. Run `bun run build:client` first.', 503);
  }
});

// Error handler
app.onError((err, c) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  if (err.name === 'AuthError') {
    return c.json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      }
    }, 401);
  }

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    }
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    }
  }, 404);
});

// Start server
async function startServer() {
  // Initialize database
  await initializeDatabase();

  // Initialize Supabase if enabled
  if (isSupabaseEnabled()) {
    logger.info('Supabase is enabled, testing connection...');
    const supabaseConnected = await testSupabaseConnection();
    if (supabaseConnected) {
      logger.info('Supabase connection established');
    } else {
      logger.warn('Supabase connection test failed, but continuing without Supabase');
    }
  } else {
    logger.info('Supabase is not configured, using SQLite only');
  }

  logger.info(`Starting server on ${config.server.host}:${config.server.port}`);
}

startServer();

export default {
  port: config.server.port,
  fetch: app.fetch,
  hostname: config.server.host,
};