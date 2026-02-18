CREATE TABLE `project_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`dateCompleted` timestamp NOT NULL,
	`complexity` int NOT NULL DEFAULT 50,
	`responsibility` int NOT NULL DEFAULT 50,
	`impact` int NOT NULL DEFAULT 50,
	`projectUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `project_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `project_skill_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`skillName` varchar(200) NOT NULL,
	`skillCategory` varchar(100),
	`weight` int NOT NULL DEFAULT 100,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `project_skill_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_skills` MODIFY COLUMN `level` int NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `user_skills` ADD `score` varchar(20) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `user_skills` ADD `projectCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `user_skills` ADD `lastEventDate` timestamp;