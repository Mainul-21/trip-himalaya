CREATE TABLE `mediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storageKey` varchar(520) NOT NULL,
	`url` text NOT NULL,
	`filename` varchar(180) NOT NULL,
	`mimeType` varchar(80) NOT NULL,
	`sizeBytes` int NOT NULL,
	`uploadedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mediaAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `mediaAssets_storageKey_unique` UNIQUE(`storageKey`)
);
