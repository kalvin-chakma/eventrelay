// src/routes/(authed)/events.ts
import { defineHandler } from "shinro/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, events } from "@eventrelay/db";

const createEventSchema = z.object({
  type: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const POST = defineHandler(
  zValidator("json", createEventSchema),
  async (c) => {
    const userId = parseInt(c.get("userId"), 10);
    const { type, data } = c.req.valid("json");

    const [event] = await db
      .insert(events)
      .values({
        userId,
        type,
        payload: data,
        status: "pending",
      })
      .returning();

    return c.json(event, 201);
  }
);
