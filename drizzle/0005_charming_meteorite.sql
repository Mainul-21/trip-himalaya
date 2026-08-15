ALTER TABLE `reviews` ADD `reviewerImage` text;--> statement-breakpoint
ALTER TABLE `reviews` ADD `rating` int DEFAULT 5 NOT NULL;