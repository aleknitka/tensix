ALTER TABLE `personas` ADD `category` text DEFAULT 'general';--> statement-breakpoint
ALTER TABLE `sessions` ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `refined_prompt` text;--> statement-breakpoint
ALTER TABLE `sessions` ADD `parent_id` text REFERENCES sessions(id);