-- CreateTable
CREATE TABLE `Contest` (
    `id` VARCHAR(191) NOT NULL,
    `clistId` VARCHAR(50) NOT NULL,
    `resource` VARCHAR(100) NOT NULL,
    `host` VARCHAR(100) NOT NULL,
    `event` VARCHAR(255) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `duration` INTEGER NULL,
    `href` VARCHAR(500) NOT NULL,
    `nProblems` INTEGER NULL,
    `parsedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Contest_clistId_key`(`clistId`),
    INDEX `Contest_startTime_idx`(`startTime`),
    INDEX `Contest_resource_idx`(`resource`),
    INDEX `Contest_clistId_idx`(`clistId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContestReminder` (
    `id` VARCHAR(191) NOT NULL,
    `reminderTime` DATETIME(3) NOT NULL,
    `notified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `contestId` VARCHAR(191) NOT NULL,

    INDEX `ContestReminder_userId_idx`(`userId`),
    INDEX `ContestReminder_reminderTime_idx`(`reminderTime`),
    INDEX `ContestReminder_notified_idx`(`notified`),
    UNIQUE INDEX `ContestReminder_userId_contestId_key`(`userId`, `contestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContestReminder` ADD CONSTRAINT `ContestReminder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContestReminder` ADD CONSTRAINT `ContestReminder_contestId_fkey` FOREIGN KEY (`contestId`) REFERENCES `Contest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
