CREATE TABLE `application` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_code` text NOT NULL,
	`application_time` text NOT NULL,
	`applicant` text NOT NULL,
	`applicant_no` text NOT NULL,
	`approve_time` text,
	`approver` text,
	`approver_no` text,
	`origin` text,
	`purpose` text,
	`status` integer DEFAULT 0 NOT NULL,
	`create_time` text NOT NULL,
	`updated_time` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `application_application_code_unique` ON `application` (`application_code`);--> statement-breakpoint
CREATE TABLE `application_detail` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_code` text NOT NULL,
	`material_code` text NOT NULL,
	`material_name` text NOT NULL,
	`spec` text,
	`unit` text NOT NULL,
	`quantity` integer NOT NULL,
	`type` text,
	`remark` text
);
--> statement-breakpoint
CREATE TABLE `material_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_code` text NOT NULL,
	`material_code` text NOT NULL,
	`material_name` text NOT NULL,
	`spec` text,
	`unit` text NOT NULL,
	`quantity` integer NOT NULL,
	`operation` text NOT NULL,
	`location` text,
	`origin` text,
	`remark` text,
	`time` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `materialStore` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_code` text NOT NULL,
	`material_name` text NOT NULL,
	`spec` text,
	`unit` text NOT NULL,
	`num` integer DEFAULT 0 NOT NULL,
	`threshold` integer DEFAULT 0 NOT NULL,
	`type` text,
	`location` text,
	`supplier` text,
	`create_time` text NOT NULL,
	`updated_time` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materialStore_material_code_unique` ON `materialStore` (`material_code`);