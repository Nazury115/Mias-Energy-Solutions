import { boolean, index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Better Auth tables (spec 007). Column names follow Better Auth's model; role/phone/status are our additions.
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, table => [index("session_user_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("account_user_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("verification_identifier_idx").on(table.identifier)]);

// Staff/Owner invitations; only a SHA-256 hash of the emailed token is stored (INV-01, SEC-02).
export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: text("invited_by").references(() => user.id, { onDelete: "set null" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Failed sign-ins and reset/confirmation requests, for lockout and limits (AUTH-03). Keys are an account or a hashed network.
export const authAttempts = pgTable("auth_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  key: text("key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("auth_attempts_lookup_idx").on(table.kind, table.key, table.createdAt)]);

// Who changed which account or invitation, and when (INV-03).
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  targetUserId: text("target_user_id").references(() => user.id, { onDelete: "set null" }),
  detail: text("detail").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  reviewStatus: text("review_status").notNull().default("received"),
  reviewReason: text("review_reason"),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index("inquiries_network_created_idx").on(table.networkHash, table.createdAt),
  index("inquiries_phone_idx").on(table.phone),
  index("inquiries_email_idx").on(table.email),
]);

// One outbox row per event/channel, including company, account and customer notifications.
// Pending/failed rows are claimed as sending; sent currently means captured locally.
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "cascade" }),
  kind: text("kind").notNull().default("inquiry"),
  channel: text("channel").notNull().default("email"),
  eventKey: text("event_key").unique(),
  jobId: uuid("job_id").references(() => jobs.id, { onDelete: "cascade" }),
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

// A conversion creates exactly one job. Retain the inquiry while the job exists.
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(),
  inquiryId: uuid("inquiry_id").notNull().unique().references(() => inquiries.id, { onDelete: "restrict" }),
  scope: text("scope").notNull(),
  nextStep: text("next_step").notNull(),
  stage: text("stage").notNull().default("assessment"),
  assigneeId: text("assignee_id").notNull().references(() => user.id, { onDelete: "restrict" }),
  customerId: text("customer_id").references(() => user.id, { onDelete: "set null" }),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("jobs_customer_idx").on(table.customerId)]);

// Queries for customer pages select only customer-visible rows, never private note payloads.
export const jobEvents = pgTable("job_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }),
  actorName: text("actor_name").notNull(),
  audience: text("audience").notNull(),
  kind: text("kind").notNull(),
  body: text("body").notNull(),
  eventKey: text("event_key").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [index("job_events_job_idx").on(table.jobId, table.createdAt)]);

export const customerInvitations = pgTable("customer_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
  email: text("email").notNull(), name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  invitedBy: text("invited_by").notNull().references(() => user.id, { onDelete: "restrict" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
