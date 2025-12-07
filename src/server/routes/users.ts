import { Hono } from 'hono';

const users = new Hono();

users.get('/', (c) => {
  return c.json({
    success: true,
    data: [],
  });
});

export default users;