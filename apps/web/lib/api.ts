import { authHeaders } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function request<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers as Record<string, string> | undefined),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// Auth
export function login(email: string, password: string) {
  return request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(email: string, password: string) {
  return request<{ user: { id: number; email: string } }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Dashboard
export interface DashboardStats {
  total: number;
  success: number;
  failed: number;
}

export function getDashboardStats(): Promise<DashboardStats> {
  return request<DashboardStats>("/dashboard");
}


// Events
export interface Event {
  id: number;
  userId: number;
  type: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export interface DeliveryLog {
  id: number;
  eventId: number;
  subscriptionId: number;
  status: string;
  attempt: number;
  responseCode: number | null;
  createdAt: string;
}

export interface EventDetail extends Event {
  deliveryLogs: DeliveryLog[];
}

export interface PaginatedEvents {
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}


// Event API
export function getEvents(page = 1,limit = 20): Promise<PaginatedEvents> {
  return request<PaginatedEvents>(
    `/dashboard/events?page=${page}&limit=${limit}`
  );
}

export function getEvent(id: number): Promise<EventDetail> {
  return request<EventDetail>(
    `/dashboard/events/${id}`
  );
}

export function createEvent(type: string,data: Record<string, unknown>): Promise<Event> {
  return request<Event>("/events", {
    method: "POST",
    body: JSON.stringify({
      type,
      data,
    }),
  });
}

// Subscriptions
export interface Subscription {
  id: number;
  userId: number;
  eventType: string;
  webhookUrl: string;
  active: boolean;
}

export function getSubscriptions() {
  return request<Subscription[]>("/subscriptions");
}

export function createSubscription(eventType: string, url: string) {
  return request<Subscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({ eventType, url }),
  });
}
