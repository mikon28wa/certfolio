-- Skill History table for tracking skill development over time
-- Stores periodic snapshots of user skill levels for time-series visualization

CREATE TABLE IF NOT EXISTS `skill_history` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `skillName` varchar(200) NOT NULL,
  `skillCategory` varchar(100),
  `level` int NOT NULL DEFAULT 0,
  `totalPoints` decimal(10, 2) NOT NULL DEFAULT 0.00,
  `certificateCount` int NOT NULL DEFAULT 0,
  `projectCount` int NOT NULL DEFAULT 0,
  `snapshotDate` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_skill_date` (`userId`, `skillName`, `snapshotDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
