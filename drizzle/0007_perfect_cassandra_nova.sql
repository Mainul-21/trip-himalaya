CREATE TABLE `agencyProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`brandName` varchar(160) NOT NULL,
	`tagline` varchar(220) NOT NULL,
	`logoUrl` text NOT NULL,
	`phone` varchar(40) NOT NULL,
	`whatsapp` varchar(40) NOT NULL,
	`email` varchar(320) NOT NULL,
	`address` text NOT NULL,
	`instagramUrl` varchar(2048) NOT NULL,
	`facebookUrl` varchar(2048) NOT NULL,
	`youtubeUrl` varchar(2048) NOT NULL,
	`googleMapsUrl` varchar(2048) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agencyProfiles_id` PRIMARY KEY(`id`)
);
