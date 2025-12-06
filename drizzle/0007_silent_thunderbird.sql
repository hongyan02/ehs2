CREATE TABLE `permission_definition` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`routes` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `permission_definition_code_unique` ON `permission_definition` (`code`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_permission` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`employee_id` text NOT NULL,
	`permissions` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_user_permission`("id", "employee_id", "permissions", "created_at", "updated_at") SELECT "id", "employee_id", "permissions", "created_at", "updated_at" FROM `user_permission`;--> statement-breakpoint
DROP TABLE `user_permission`;--> statement-breakpoint
ALTER TABLE `__new_user_permission` RENAME TO `user_permission`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `user_permission_employee_id_unique` ON `user_permission` (`employee_id`);