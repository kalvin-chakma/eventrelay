import { Queue } from "bullmq";
import type { DeliverEventJob } from "@eventrelay/shared-types";
import { DELIVER_EVENT_JOB_NAME } from "@eventrelay/shared-types";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const eventQueue = new Queue<DeliverEventJob>("events", { connection });

export async function enqueueDeliverEvent(job: DeliverEventJob) {
  return eventQueue.add(DELIVER_EVENT_JOB_NAME, job, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  });
}
