import { defineMiddleware } from "shinro/app";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export default defineMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" as const }, 401);
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.sub) {
      return c.json({ error: "Invalid token payload" as const }, 401);
    }

    c.set("userId", payload.sub);
    await next();
  } catch (err) {
    return c.json({ error: "Invalid or expired token" as const }, 401);
  }
});
