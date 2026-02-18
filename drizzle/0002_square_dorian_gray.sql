CREATE TABLE `collection_certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`collectionId` int NOT NULL,
	`certificateId` int NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `collection_certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text,
	`slug` varchar(150) NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `fileUrl` text;--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `fileKey` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `skills` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `level` enum('beginner','intermediate','advanced','expert');--> statement-breakpoint
ALTER TABLE `certificates` ADD `category` enum('it','marketing','management','healthcare','other');--> statement-breakpoint
ALTER TABLE `certificates` ADD `priority` enum('normal','important') DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `isVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `certificates` ADD `verificationUrl` text;--> statement-breakpoint
ALTER TABLE `certificates` ADD `externalUrl` text;