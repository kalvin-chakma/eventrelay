import { defineClient } from "@eventrelay/api/client";

export const api = defineClient(
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
);
