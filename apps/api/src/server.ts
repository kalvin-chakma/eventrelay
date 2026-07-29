import app from './app.ts';

const server = Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT ?? 3000),
});

process.once('SIGTERM', () => {
  void server.stop(false);
});

console.log(`API listening on port ${server.port}`);
