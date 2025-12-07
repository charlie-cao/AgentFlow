import { Hono } from 'hono';
import { ollama } from '../services/ollama';
import { requireAuth } from '../middleware/auth';

const ollamaRoute = new Hono();

// Apply authentication to all routes
ollamaRoute.use('*', requireAuth);

// List models
ollamaRoute.get('/models', async (c) => {
  try {
    const models = await ollama.listModels();
    return c.json({
      success: true,
      data: models,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'MODELS_FETCH_FAILED',
        message: 'Failed to fetch models',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Check if model exists
ollamaRoute.get('/models/:modelName/exists', async (c) => {
  const modelName = c.req.param('modelName');

  try {
    const exists = await ollama.hasModel(modelName);
    return c.json({
      success: true,
      data: { exists },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'MODEL_CHECK_FAILED',
        message: 'Failed to check model',
      }
    }, 500);
  }
});

// Pull model
ollamaRoute.post('/models/:modelName/pull', async (c) => {
  const modelName = c.req.param('modelName');

  // For now, we'll handle basic pulling
  // In production, you might want to handle this as a background job
  try {
    const promise = new Promise((resolve, reject) => {
      let progressData = [];

      ollama.pullModel(modelName, (progress) => {
        progressData.push(progress);
        // You could emit this via SSE to show progress
      }).then(() => {
        resolve(progressData);
      }).catch((error) => {
        reject(error);
      });
    });

    await promise;

    return c.json({
      success: true,
      data: {
        message: `Model ${modelName} pulled successfully`,
      },
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'MODEL_PULL_FAILED',
        message: 'Failed to pull model',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Generate completion
ollamaRoute.post('/generate', async (c) => {
  const body = await c.req.json();

  try {
    const response = await ollama.generate({
      model: body.model,
      prompt: body.prompt,
      system: body.system,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      format: body.format,
    });

    return c.json({
      success: true,
      data: response,
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'GENERATE_FAILED',
        message: 'Failed to generate completion',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Chat completion
ollamaRoute.post('/chat', async (c) => {
  const body = await c.req.json();

  try {
    const response = await ollama.chat({
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      format: body.format,
    });

    return c.json({
      success: true,
      data: response,
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'CHAT_FAILED',
        message: 'Failed to complete chat',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Generate streaming completion (returns SSE)
ollamaRoute.post('/generate/stream', async (c) => {
  const body = await c.req.json();

  // Set SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  try {
    const stream = ollama.generateStream({
      model: body.model,
      prompt: body.prompt,
      system: body.system,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      format: body.format,
    });

    // Send events
    for await (const chunk of stream) {
      c.req.raw.waitUntil(
        c.res.send(`data: ${JSON.stringify(chunk)}\n\n`)
      );
    }

    // Send done event
    c.req.raw.waitUntil(
      c.res.send(`data: ${JSON.stringify({ done: true })}\n\n`)
    );

    return c.res;

  } catch (error) {
    // Send error event
    c.req.raw.waitUntil(
      c.res.send(`data: ${JSON.stringify({
        error: {
          code: 'STREAM_GENERATE_FAILED',
          message: 'Failed to generate stream',
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      })}\n\n`)
    );

    return c.res;
  }
});

// Chat streaming completion (returns SSE)
ollamaRoute.post('/chat/stream', async (c) => {
  const body = await c.req.json();

  // Set SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');

  try {
    const stream = ollama.chatStream({
      model: body.model,
      messages: body.messages,
      temperature: body.temperature,
      max_tokens: body.max_tokens,
      format: body.format,
    });

    // Send events
    for await (const chunk of stream) {
      c.req.raw.waitUntil(
        c.res.send(`data: ${JSON.stringify(chunk)}\n\n`)
      );
    }

    // Send done event
    c.req.raw.waitUntil(
      c.res.send(`data: ${JSON.stringify({ done: true })}\n\n`)
    );

    return c.res;

  } catch (error) {
    // Send error event
    c.req.raw.waitUntil(
      c.res.send(`data: ${JSON.stringify({
        error: {
          code: 'STREAM_CHAT_FAILED',
          message: 'Failed to chat stream',
          details: error instanceof Error ? error.message : 'Unknown error',
        }
      })}\n\n`)
    );

    return c.res;
  }
});

// Delete model
ollamaRoute.delete('/models/:modelName', async (c) => {
  const modelName = c.req.param('modelName');

  try {
    await ollama.deleteModel(modelName);
    return c.json({
      success: true,
      data: {
        message: `Model ${modelName} deleted successfully`,
      },
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'MODEL_DELETE_FAILED',
        message: 'Failed to delete model',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

// Show model info
ollamaRoute.get('/models/:modelName', async (c) => {
  const modelName = c.req.param('modelName');

  try {
    const info = await ollama.showModel(modelName);
    return c.json({
      success: true,
      data: info,
    });

  } catch (error) {
    return c.json({
      success: false,
      error: {
        code: 'MODEL_INFO_FAILED',
        message: 'Failed to get model info',
        details: error instanceof Error ? error.message : 'Unknown error',
      }
    }, 500);
  }
});

export default ollamaRoute;