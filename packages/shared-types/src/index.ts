export interface EventPayload {
  type: string;
  data: Record<string, unknown>;
}

export interface StoredEvent {
  id: number;
  userId: number;
  type: string;
  payload: Record<string, unknown>;
  status: EventStatus;
  createdAt: string;
}

export type EventStatus = "pending" | "queued" | "delivered" | "failed";

export interface WebhookDeliveryPayload {
  eventId: number;
  subscriptionId: number;
  webhookUrl: string;
  eventType: string;
  data: Record<string, unknown>;
}

export interface DeliveryResult {
  eventId: number;
  subscriptionId: number;
  status: "success" | "failed";
  attempt: number;
  responseCode: number | null;
}

export interface DeliverEventJob {
  eventId: number;
  userId: number;
  type: string;
  data: Record<string, unknown>;
}

export const DELIVER_EVENT_JOB_NAME = "deliver-event" as const;
