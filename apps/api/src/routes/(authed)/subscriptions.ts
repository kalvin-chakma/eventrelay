import { defineHandler } from "shinro/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, subscriptions } from "@eventrelay/db";

const createSubscriptionSchema = z.object({
  eventType: z.string().min(1),
  url: z.string().url(),
});

export const POST = defineHandler(
  zValidator("json", createSubscriptionSchema),
  async (c) => {
    const userId = parseInt(c.get("userId"));
    const { eventType, url } = c.req.valid("json");

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        eventType,
        webhookUrl: url,
      })
      .returning();

    return c.json(subscription, 201);
  }
);

export const GET = defineHandler(async (c) => {
  const userId = parseInt(c.get("userId"), 10);

  const userSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return c.json(userSubscriptions);
});
