-- Trip Himalaya live Agency Profile recovery
-- Use only after the inspection query returned "empty set" for the 24 required profile columns.
-- This file ADDS columns only. It does not delete, truncate, update, or recreate any data.
-- Run this in TiDB Cloud SQL Editor with the trip_himalaya database selected.

ALTER TABLE `agencyProfiles` ADD COLUMN `reviewSectionTitle` varchar(160) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `reviewSectionIntro` varchar(500) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `reviewCtaLabel` varchar(80) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `reviewCtaEnabled` boolean NOT NULL DEFAULT true;

ALTER TABLE `agencyProfiles` ADD COLUMN `exploreTitle` varchar(220) NOT NULL DEFAULT 'Choose your travel style.';
ALTER TABLE `agencyProfiles` ADD COLUMN `exploreIntro` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `travelStylesJson` text NULL;

ALTER TABLE `agencyProfiles` ADD COLUMN `touristCount` varchar(80) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `tourCount` varchar(80) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `thirdMetricLabel` varchar(80) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `thirdMetricValue` varchar(80) NULL;

ALTER TABLE `agencyProfiles` ADD COLUMN `experiencesTitle` varchar(220) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `experiencesIntro` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `experiencesJson` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `aboutStoryTitle` varchar(220) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `aboutStoryBody` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `aboutStorySecondBody` text NULL;

ALTER TABLE `agencyProfiles` ADD COLUMN `heroTitle` varchar(160) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `heroAccentTitle` varchar(160) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `heroSubtitle` varchar(280) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `heroImagesJson` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `heroBadgesJson` text NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `whyTripTitle` varchar(160) NULL;
ALTER TABLE `agencyProfiles` ADD COLUMN `whyTripItemsJson` text NULL;
