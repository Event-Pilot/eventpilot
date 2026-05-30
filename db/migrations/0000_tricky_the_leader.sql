CREATE TABLE `redeem_codes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`task_id` text,
	`used_at` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `redeem_codes_code_unique` ON `redeem_codes` (`code`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`mode` text NOT NULL,
	`activity_name` text NOT NULL,
	`organization_name` text NOT NULL,
	`activity_type` text,
	`expected_participants` integer,
	`date_or_period` text,
	`location` text,
	`budget_range` text,
	`target_audience` text,
	`extra_context` text,
	`pasted_materials` text,
	`status` text DEFAULT 'generating' NOT NULL,
	`preview_output` text,
	`full_output` text,
	`unlocked` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
