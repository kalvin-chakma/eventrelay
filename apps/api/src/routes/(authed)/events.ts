import { defineHandler } from "shinro/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, events } from "@eventrelay/db";
import { enqueueDeliverEvent } from "../../queue/event.queue";

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

    if (!event) {
      return c.json({ error: "Failed to create event" }, 500);
    }

    await enqueueDeliverEvent({
      eventId: event.id,
      userId: event.userId,
      type: event.type,
      data: data,
    });

    return c.json(event, 201);
  }
);
