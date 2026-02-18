CREATE TABLE `project_media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`mediaType` enum('image','pdf','link') NOT NULL,
	`fileUrl` text,
	`fileKey` text,
	`fileName` varchar(300),
	`mimeType` varchar(100),
	`externalUrl` text,
	`linkType` varchar(50),
	`caption` varchar(300),
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `project_events` MODIFY COLUMN `complexity` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `project_events` MODIFY COLUMN `responsibility` int NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE `project_events` MODIFY COLUMN `impact` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `project_events` ADD `role` enum('solo','team','lead') DEFAULT 'solo' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_events` ADD `technologies` text;--> statement-breakpoint
ALTER TABLE `project_events` ADD `projectType` varchar(100);--> statement-breakpoint
ALTER TABLE `project_events` ADD `impactDescription` text;--> statement-breakpoint
ALTER TABLE `project_events` ADD `fileUrl` text;--> statement-breakpoint
ALTER TABLE `project_events` ADD `fileKey` text;--> statement-breakpoint
ALTER TABLE `project_events` ADD `fileName` varchar(300);--> statement-breakpoint
ALTER TABLE `project_events` ADD `mimeType` varchar(100);