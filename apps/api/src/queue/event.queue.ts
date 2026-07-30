import { Queue } from "bullmq";
import type { DeliverEventJob } from "@eventrelay/shared-types";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const eventQueue = new Queue<DeliverEventJob>("events", { connection });
