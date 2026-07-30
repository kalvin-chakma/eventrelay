import { routes } from '#shinro/routes';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { defineApp } from 'shinro/app';

declare module 'shinro/app' {
  interface ShinroEnv {
    Variables: {
      userId: string;
    };
  }
}

const app = defineApp()
  .use('*', logger())
  .use(
    '*',
    cors({
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:5000',
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .route('/', routes())
  .onError((error, c) => {
    console.error(error);
    return c.json({ error: 'INTERNAL_ERROR' as const }, 500);
  });

export default app;
