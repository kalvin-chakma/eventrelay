import { defineHandler } from 'shinro/app';

export const GET = defineHandler((c) => {
  return c.json({ ok: true as const }, 200);
});
