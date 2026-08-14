ALTER TABLE `blogs` MODIFY COLUMN `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `blogs` MODIFY COLUMN `excerpt` text NOT NULL;--> statement-breakpoint
ALTER TABLE `blogs` MODIFY COLUMN `author` text NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `reviewerName` text NOT NULL;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `location` text;--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `sourceLabel` text;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `title` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `category` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `location` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `duration` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `difficulty` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tours` MODIFY COLUMN `shortDescription` text NOT NULL;