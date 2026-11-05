CREATE TABLE "commercial_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"draft" jsonb NOT NULL,
	"snapshot" jsonb,
	"reference" text,
	"revision_of" uuid,
	"pdf" "bytea",
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "commercial_documents_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "document_counters" (
	"kind" text PRIMARY KEY NOT NULL,
	"next_number" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"approved_by" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "commercial_documents" ADD CONSTRAINT "commercial_documents_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commercial_documents_job_idx" ON "commercial_documents" USING btree ("job_id");