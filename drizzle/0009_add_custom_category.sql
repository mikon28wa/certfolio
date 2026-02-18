-- Add customCategory column to certificates table
ALTER TABLE `certificates` ADD COLUMN `customCategory` VARCHAR(100);

-- Add customCategory column to courseLibrary table
ALTER TABLE `courseLibrary` ADD COLUMN `customCategory` VARCHAR(100);
