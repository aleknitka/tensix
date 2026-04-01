ALTER TABLE `personas` ADD `temperature` real;--> statement-breakpoint
ALTER TABLE `personas` ADD `top_p` real;--> statement-breakpoint
ALTER TABLE `personas` ADD `max_tokens` integer;--> statement-breakpoint
ALTER TABLE `personas` ADD `presence_penalty` real;--> statement-breakpoint
ALTER TABLE `personas` ADD `frequency_penalty` real;--> statement-breakpoint
ALTER TABLE `personas` ADD `icon_id` text DEFAULT 'user-circle';--> statement-breakpoint
ALTER TABLE `personas` ADD `color_accent` text DEFAULT 'slate';--> statement-breakpoint
ALTER TABLE `personas` ADD `skills` text DEFAULT '[]';