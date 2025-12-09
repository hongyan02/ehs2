CREATE TABLE `point_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category_name` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `point_event` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` integer NOT NULL,
	`default_point` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `point_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`point_name` text NOT NULL,
	`description` text,
	`event_id` integer NOT NULL,
	`default_point` integer NOT NULL,
	`point` integer NOT NULL,
	`no` text NOT NULL,
	`name` text NOT NULL,
	`dept` text NOT NULL,
	`month` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_point_log_month` ON `point_log` (`month`);--> statement-breakpoint
CREATE INDEX `idx_point_log_month_dept` ON `point_log` (`month`,`dept`);--> statement-breakpoint
CREATE INDEX `idx_point_log_no_month` ON `point_log` (`no`,`month`);--> statement-breakpoint
CREATE TABLE `point_person` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`no` text NOT NULL,
	`name` text NOT NULL,
	`dept` text,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `point_person_no_unique` ON `point_person` (`no`);--> statement-breakpoint
CREATE TABLE `webhook_key` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`description` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `webhook_key_key_unique` ON `webhook_key` (`key`);