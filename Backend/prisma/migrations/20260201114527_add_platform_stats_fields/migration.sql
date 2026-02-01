-- AlterTable
ALTER TABLE `PlatformStats` ADD COLUMN `easySolved` INTEGER NULL,
    ADD COLUMN `hardSolved` INTEGER NULL,
    ADD COLUMN `maxRating` INTEGER NULL,
    ADD COLUMN `mediumSolved` INTEGER NULL,
    ADD COLUMN `stars` INTEGER NULL,
    ADD COLUMN `title` VARCHAR(191) NULL;
