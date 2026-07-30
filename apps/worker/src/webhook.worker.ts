// apps/worker/src/webhook.worker.ts
import { Worker, type Job } from "bullmq";
import { eq, and } from "drizzle-orm";
import { db, subscriptions } from "@eventrelay/db";
import type { DeliverEventJob } from "@eventrelay/shared-types";

const REDIS_HOST = process.env.REDIS_HOST ?? "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT ?? 6379);

interface DeliveryOutcome {
  subscriptionId: number;
  webhookUrl: string;
  success: boolean;
  responseCode: number | null;
  error?: string;
}

async function deliverToSubscription(
  webhookUrl: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<{ success: boolean; responseCode: number | null; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: eventType,
        data,
      }),
    });

    return {
      success: res.ok,
      responseCode: res.status,
    };
  } catch (err) {
    return {
      success: false,
      responseCode: null,
      error: err instanceof Error ? err.message : "unknown fetch error",
    };
  }
}

async function processDeliverEvent(job: Job<DeliverEventJob>) {
  const { eventId, userId, type, data } = job.data;

  console.log(`[worker] processing job ${job.id}`, job.data);

  const matchingSubscriptions = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.eventType, type),
        eq(subscriptions.active, true)
      )
    );

  if (matchingSubscriptions.length === 0) {
    console.log(
      `[worker] job ${job.id}: no active subscriptions for type "${type}"`
    );
    return;
  }

  const outcomes: DeliveryOutcome[] = [];

  for (const sub of matchingSubscriptions) {
    const result = await deliverToSubscription(
      sub.webhookUrl,
      type,
      data
    );

    outcomes.push({
      subscriptionId: sub.id,
      webhookUrl: sub.webhookUrl,
      success: result.success,
      responseCode: result.responseCode,
      error: result.error,
    });

    if (result.success) {
      console.log(
        `[worker] job ${job.id}: delivered to subscription ${sub.id} (${sub.webhookUrl}) → ${result.responseCode}`
      );
    } else {
      console.error(
        `[worker] job ${job.id}: FAILED delivery to subscription ${sub.id} (${sub.webhookUrl}) → ${
          result.responseCode ?? "network error"
        }${result.error ? `: ${result.error}` : ""}`
      );
    }
  }

  const anyFailed = outcomes.some((outcome) => !outcome.success);

  // Throw error so BullMQ retries based on attempts/backoff configuration
  if (anyFailed) {
    const failedCount = outcomes.filter(
      (outcome) => !outcome.success
    ).length;

    throw new Error(
      `job ${job.id}: ${failedCount}/${outcomes.length} deliveries failed`
    );
  }

  return outcomes;
}

const worker = new Worker<DeliverEventJob>(
  "events",
  async (job: Job<DeliverEventJob>) => {
    if (job.name === "deliver-event") {
      return processDeliverEvent(job);
    }

    console.warn(`[worker] unknown job name: ${job.name}`);
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  }
);

worker.on("ready", () => {
  console.log("worker ready");
});

worker.on(
  "failed",
  (job: Job<DeliverEventJob> | undefined, err: Error) => {
    console.error(`[worker] job ${job?.id} failed:`, err.message);
  }
);

process.on("SIGTERM", async () => {
  console.log("[worker] SIGTERM received, closing...");
  await worker.close();
  process.exit(0);
});
