import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Inquiries from the contact form. Increment 008 will link these to customer accounts and jobs.
export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  preferredReply: text("preferred_reply").notNull(),
  service: text("service").notNull(),
  area: text("area"),
  message: text("message").notNull(),
  sourcePath: text("source_path"),
  networkHash: text("network_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index("inquiries_network_created_idx").on(table.networkHash, table.createdAt),
  index("inquiries_phone_idx").on(table.phone),
  index("inquiries_email_idx").on(table.email),
]);

// One notification email per inquiry. Status: pending → sent, or failed (retried until attempts run out).
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").notNull().references(() => inquiries.id, { onDelete: "cascade" }),
  recipient: text("recipient").notNull(),
  replyTo: text("reply_to"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
}, table => [index("notifications_status_idx").on(table.status, table.attempts)]);
