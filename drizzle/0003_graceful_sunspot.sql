CREATE TABLE `course_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseUuid` varchar(200) NOT NULL,
	`title` varchar(500) NOT NULL,
	`issuer` varchar(300) NOT NULL,
	`description` text,
	`duration` int,
	`credits` int,
	`level` enum('beginner','intermediate','advanced','expert'),
	`category` enum('it','marketing','management','healthcare','other'),
	`providerUrl` text,
	`providerName` varchar(200),
	`analyzedBy` int,
	`analysisDate` timestamp NOT NULL DEFAULT (now()),
	`usageCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `course_library_id` PRIMARY KEY(`id`),
	CONSTRAINT `course_library_courseUuid_unique` UNIQUE(`courseUuid`)
);
--> statement-breakpoint
CREATE TABLE `skill_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseLibraryId` int,
	`certificateId` int,
	`skillName` varchar(200) NOT NULL,
	`skillCategory` varchar(100),
	`weight` int NOT NULL,
	`source` enum('llm','manual','library') NOT NULL DEFAULT 'llm',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skill_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillName` varchar(200) NOT NULL,
	`skillCategory` varchar(100),
	`totalPoints` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`progressPercentage` int NOT NULL DEFAULT 0,
	`certificateCount` int NOT NULL DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `certificates` ADD `courseUuid` varchar(200);--> statement-breakpoint
ALTER TABLE `certificates` ADD `courseDuration` int;--> statement-breakpoint
ALTER TABLE `certificates` ADD `courseCredits` int;--> statement-breakpoint
ALTER TABLE `certificates` ADD `completionGrade` varchar(50);--> statement-breakpoint
ALTER TABLE `certificates` ADD `learningHours` int;