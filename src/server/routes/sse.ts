import { Hono } from 'hono';
import { sseService } from '../services/sse';

const sse = new Hono();

sse.get('/', async (c) => {
  // Set SSE headers
  c.header('Content-Type', 'text/event-stream');
  c.header('Cache-Control', 'no-cache');
  c.header('Connection', 'keep-alive');
  c.header('X-Accel-Buffering', 'no'); // Disable buffering in nginx

  const userId = c.req.query('userId') || 'anonymous';
  
  console.log(`SSE connection request for userId: ${userId}`);

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Register this client
      const cleanup = sseService.registerClient(userId, controller);
      console.log(`SSE client registered for userId: ${userId}`);

      // Send initial connection event
      try {
        controller.enqueue(new TextEncoder().encode(
          `data: ${JSON.stringify({
            type: 'connected',
            userId,
            timestamp: new Date().toISOString(),
          })}\n\n`
        ));
      } catch (error) {
        console.error('Failed to send initial SSE message:', error);
      }

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(
            `data: ${JSON.stringify({
              type: 'ping',
              timestamp: new Date().toISOString(),
            })}\n\n`
          ));
        } catch (error) {
          console.error('Failed to send ping:', error);
          clearInterval(pingInterval);
          cleanup();
        }
      }, 30000);

      // Clean up on disconnect
      c.req.raw.signal.addEventListener('abort', () => {
        clearInterval(pingInterval);
        cleanup();
        try {
          controller.close();
        } catch (error) {
          // Ignore errors during cleanup
        }
      });
    },
  });

  return c.body(stream);
});

export default sse;