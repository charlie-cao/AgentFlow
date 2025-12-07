import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ollama } from './src/server/services/ollama';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Test Ollama connection
app.get('/test/ollama', async (c) => {
  try {
    const models = await ollama.listModels();
    return c.json({
      success: true,
      data: models,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Test generation
app.post('/test/generate', async (c) => {
  try {
    const body = await c.req.json();
    const response = await ollama.generate({
      model: body.model || 'qwen3:latest',
      prompt: body.prompt || 'Hello, who are you?',
    });

    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Simple SSE test
app.get('/test/sse', async (c) => {
  const stream = new ReadableStream({
    start(controller) {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        controller.enqueue(`data: ${JSON.stringify({
          message: `Ping ${count}`,
          timestamp: new Date().toISOString()
        })}\n\n`);

        if (count >= 5) {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
});

const port = 3001;
console.log(`Test server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};