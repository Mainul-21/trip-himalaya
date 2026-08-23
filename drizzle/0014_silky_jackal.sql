ALTER TABLE `agencyProfiles` ADD `reviewSectionTitle` varchar(160);--> statement-breakpoint
ALTER TABLE `agencyProfiles` ADD `reviewSectionIntro` varchar(500);--> statement-breakpoint
ALTER TABLE `agencyProfiles` ADD `reviewCtaLabel` varchar(80);--> statement-breakpoint
ALTER TABLE `agencyProfiles` ADD `reviewCtaEnabled` boolean DEFAULT true NOT NULL;