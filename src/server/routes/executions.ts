import { Hono } from 'hono';

const executions = new Hono();

executions.get('/', (c) => {
  return c.json({
    success: true,
    data: [],
  });
});

executions.post('/', (c) => {
  return c.json({
    success: true,
    data: { id: 'test-execution' },
  });
});

export default executions;