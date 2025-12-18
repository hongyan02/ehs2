CREATE SCHEMA "ehs";
--> statement-breakpoint
CREATE TABLE "ehs"."point_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ehs"."point_event" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"category_id" integer NOT NULL,
	"default_point" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ehs"."point_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"point_name" varchar(200) NOT NULL,
	"description" text,
	"event_id" integer NOT NULL,
	"default_point" integer NOT NULL,
	"point" integer NOT NULL,
	"no" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"dept" varchar(100) NOT NULL,
	"month" varchar(7) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ehs"."point_person" (
	"id" serial PRIMARY KEY NOT NULL,
	"no" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"dept" varchar(100),
	"active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "point_person_no_unique" UNIQUE("no")
);
--> statement-breakpoint
CREATE INDEX "idx_point_log_month" ON "ehs"."point_log" USING btree ("month");--> statement-breakpoint
CREATE INDEX "idx_point_log_month_dept" ON "ehs"."point_log" USING btree ("month","dept");--> statement-breakpoint
CREATE INDEX "idx_point_log_no_month" ON "ehs"."point_log" USING btree ("no","month");