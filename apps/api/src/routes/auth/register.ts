// src/routes/auth/register.ts
import { defineHandler } from "shinro/app";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import bcrypt from "bcrypt";
import { db, users } from "@eventrelay/db";
import { eq } from "drizzle-orm";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const POST = defineHandler(
  zValidator("json", registerSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return c.json({ error: "Email already registered" }, 409);
    }

    const hashed = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ email, password: hashed })
      .returning({ id: users.id, email: users.email, createdAt: users.createdAt });

    return c.json({ user }, 201);
  }
);
