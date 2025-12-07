import { Hono } from 'hono';

const workflows = new Hono();

workflows.get('/', (c) => {
  return c.json({
    success: true,
    data: [],
  });
});

workflows.post('/', (c) => {
  return c.json({
    success: true,
    data: { id: 'test-workflow' },
  });
});

export default workflows;