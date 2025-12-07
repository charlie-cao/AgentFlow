import { Hono } from 'hono';

const agents = new Hono();

agents.get('/', (c) => {
  return c.json({
    success: true,
    data: [],
  });
});

agents.post('/', (c) => {
  return c.json({
    success: true,
    data: { id: 'test-agent' },
  });
});

export default agents;