CREATE TABLE "ehs"."point_kpi" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"nickname" varchar(50),
	"year" varchar(4) NOT NULL,
	"jan" varchar(10),
	"feb" varchar(10),
	"mar" varchar(10),
	"apr" varchar(10),
	"may" varchar(10),
	"jun" varchar(10),
	"jul" varchar(10),
	"aug" varchar(10),
	"sep" varchar(10),
	"oct" varchar(10),
	"nov" varchar(10),
	"dec" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_point_kpi_user_year" ON "ehs"."point_kpi" USING btree ("username","year");