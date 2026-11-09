ALTER TABLE "publications" ADD COLUMN "source_slug" text;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "repository_hero" jsonb;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "repository_hidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "publications" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_source_slug_unique" UNIQUE("source_slug");