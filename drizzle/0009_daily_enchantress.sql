CREATE TABLE `scheduler_task` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`job_key` text NOT NULL,
	`cron` text,
	`enabled` integer DEFAULT 1 NOT NULL,
	`payload` text,
	`last_run_at` text,
	`last_status` text,
	`last_error` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_config` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`webhook_key` text NOT NULL,
	`scene` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
DROP TABLE `webhook_key`;