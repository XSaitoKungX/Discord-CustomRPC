ALTER TABLE `profiles` ADD `activity_type` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `details_url` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `state_url` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `stream_url` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `large_image_url` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `small_image_url` text;--> statement-breakpoint
ALTER TABLE `profiles` ADD `timestamp_mode` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `profiles` ADD `start_timestamp` integer;--> statement-breakpoint
ALTER TABLE `profiles` ADD `end_timestamp` integer;