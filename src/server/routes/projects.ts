import { Hono } from 'hono';

const projects = new Hono();

projects.get('/', (c) => {
  return c.json({
    success: true,
    data: [],
  });
});

projects.post('/', (c) => {
  return c.json({
    success: true,
    data: { id: 'test-project' },
  });
});

export default projects;