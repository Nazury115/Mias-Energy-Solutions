ALTER TABLE "commercial_documents" ADD COLUMN "review_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "commercial_documents" ADD COLUMN "review_reason" text;--> statement-breakpoint
ALTER TABLE "commercial_documents" ADD COLUMN "submitted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "commercial_documents" ADD COLUMN "submitted_by" text;--> statement-breakpoint
ALTER TABLE "commercial_documents" ADD COLUMN "xlsx" "bytea";