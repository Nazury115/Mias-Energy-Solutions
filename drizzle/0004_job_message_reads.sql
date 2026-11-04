CREATE TABLE "job_message_reads" (
	"event_id" uuid NOT NULL,
	"reader_id" text NOT NULL,
	"reader_name" text NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_message_reads_event_id_reader_id_pk" PRIMARY KEY("event_id","reader_id")
);
--> statement-breakpoint
ALTER TABLE "job_message_reads" ADD CONSTRAINT "job_message_reads_event_id_job_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."job_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_message_reads" ADD CONSTRAINT "job_message_reads_reader_id_user_id_fk" FOREIGN KEY ("reader_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;