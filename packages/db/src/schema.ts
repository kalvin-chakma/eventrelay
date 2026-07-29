import {
  pgTable,
  serial,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("events_user_id_idx").on(table.userId),
    typeIdx: index("events_type_idx").on(table.type),
  })
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    eventType: text("event_type").notNull(),
    webhookUrl: text("webhook_url").notNull(),
    active: boolean("active").notNull().default(true),
  },
  (table) => ({
    userIdIdx: index("subscriptions_user_id_idx").on(table.userId),
    eventTypeIdx: index("subscriptions_event_type_idx").on(table.eventType),
  })
);

export const deliveryLogs = pgTable(
  "delivery_logs",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id),
    subscriptionId: integer("subscription_id")
      .notNull()
      .references(() => subscriptions.id),
    status: text("status").notNull(),
    attempt: integer("attempt").notNull().default(1),
    responseCode: integer("response_code"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    eventIdIdx: index("delivery_logs_event_id_idx").on(table.eventId),
    subscriptionIdIdx: index("delivery_logs_subscription_id_idx").on(
      table.subscriptionId
    ),
  })
);
