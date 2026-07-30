import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, count, sql, desc } from "drizzle-orm";
import { db, events, deliveryLogs } from "@eventrelay/db";
import type { ShinroEnv } from "shinro/app";

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const dashboard = new Hono<ShinroEnv>()
  .get("/", async (c) => {
    const userId = Number(c.get("userId"));

    const [stats] = await db
      .select({
        total: sql<number>`count(distinct ${events.id})`,
        success: sql<number>`count(*) filter (where ${deliveryLogs.status} = 'success')`,
        failed: sql<number>`count(*) filter (where ${deliveryLogs.status} = 'failed')`,
      })
      .from(events)
      .leftJoin(deliveryLogs, eq(deliveryLogs.eventId, events.id))
      .where(eq(events.userId, userId));

    return c.json({
      total: Number(stats?.total ?? 0),
      success: Number(stats?.success ?? 0),
      failed: Number(stats?.failed ?? 0),
    });
  })

  // GET /dashboard/events -> paginated list
  .get("/events", zValidator("query", paginationSchema), async (c) => {
    const userId = Number(c.get("userId"));
    const { page, limit } = c.req.valid("query");
    const offset = (page - 1) * limit;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(events)
        .where(eq(events.userId, userId))
        .orderBy(desc(events.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(events).where(eq(events.userId, userId)),
    ]);

    return c.json({
      data: rows,
      pagination: {
        page,
        limit,
        total: Number(total),
        totalPages: Math.ceil(Number(total) / limit),
      },
    });
  })

  // GET /dashboard/events/:id -> single event + its delivery logs
  .get("/events/:id", zValidator("param", idParamSchema), async (c) => {
    const userId = Number(c.get("userId"));
    const { id: eventId } = c.req.valid("param");

    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, eventId), eq(events.userId, userId)));

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    const logs = await db
      .select()
      .from(deliveryLogs)
      .where(eq(deliveryLogs.eventId, eventId))
      .orderBy(desc(deliveryLogs.createdAt));

    return c.json({ ...event, deliveryLogs: logs });
  });

export default dashboard;
