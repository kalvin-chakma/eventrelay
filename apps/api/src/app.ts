import { routes } from '#shinro/routes';
import { logger } from 'hono/logger';
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
  .route('/', routes())
  .onError((error, c) => {
    console.error(error);
    return c.json({ error: 'INTERNAL_ERROR' as const }, 500);
  });

export default app;
