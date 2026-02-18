CREATE TABLE `certificates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`issuer` varchar(300) NOT NULL,
	`issueDate` timestamp,
	`description` text,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileName` varchar(300),
	`mimeType` varchar(100),
	`isPublic` boolean NOT NULL DEFAULT true,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `certificates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profileSlug` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_profileSlug_unique` UNIQUE(`profileSlug`);