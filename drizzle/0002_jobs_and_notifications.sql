CREATE TABLE "customer_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"token_hash" text NOT NULL,
	"invited_by" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customer_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "job_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"actor_id" text,
	"actor_name" text NOT NULL,
	"audience" text NOT NULL,
	"kind" text NOT NULL,
	"body" text NOT NULL,
	"event_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_events_event_key_unique" UNIQUE("event_key")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"inquiry_id" uuid NOT NULL,
	"scope" text NOT NULL,
	"next_step" text NOT NULL,
	"stage" text DEFAULT 'assessment' NOT NULL,
	"assignee_id" text NOT NULL,
	"customer_id" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_reference_unique" UNIQUE("reference"),
	CONSTRAINT "jobs_inquiry_id_unique" UNIQUE("inquiry_id")
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "review_status" text DEFAULT 'received' NOT NULL;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "review_reason" text;--> statement-breakpoint
ALTER TABLE "inquiries" ADD COLUMN "version" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "channel" text DEFAULT 'email' NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "event_key" text;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "job_id" uuid;--> statement-breakpoint
ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_invitations" ADD CONSTRAINT "customer_invitations_invited_by_user_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_events" ADD CONSTRAINT "job_events_actor_id_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_inquiry_id_inquiries_id_fk" FOREIGN KEY ("inquiry_id") REFERENCES "public"."inquiries"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assignee_id_user_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_user_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_events_job_idx" ON "job_events" USING btree ("job_id","created_at");--> statement-breakpoint
CREATE INDEX "jobs_customer_idx" ON "jobs" USING btree ("customer_id");--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_key_unique" UNIQUE("event_key");