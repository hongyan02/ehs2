CREATE TABLE `dutyLog` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`no` text NOT NULL,
	`date` text NOT NULL,
	`shift` integer NOT NULL,
	`log` text NOT NULL,
	`todo` text,
	`create_time` text NOT NULL,
	`update_time` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dutySchedule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`shift` integer NOT NULL,
	`name` text NOT NULL,
	`no` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dutyStaff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`no` text NOT NULL,
	`position` text,
	`shift` integer NOT NULL,
	`phone` text,
	`status` integer NOT NULL
);
