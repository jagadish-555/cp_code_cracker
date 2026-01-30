-- CreateTable
CREATE TABLE `Problem` (
    `id` VARCHAR(191) NOT NULL,
    `platform` ENUM('cf', 'lc', 'cc', 'ac') NOT NULL,
    `platformProblemId` VARCHAR(100) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `difficulty` VARCHAR(50) NULL,
    `tags` JSON NULL,
    `url` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Problem_platform_idx`(`platform`),
    INDEX `Problem_difficulty_idx`(`difficulty`),
    UNIQUE INDEX `Problem_platform_platformProblemId_key`(`platform`, `platformProblemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserProblem` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `problemId` VARCHAR(191) NOT NULL,
    `status` ENUM('attempted', 'solved') NOT NULL DEFAULT 'attempted',
    `attempts` INTEGER NOT NULL DEFAULT 1,
    `solvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `UserProblem_userId_status_idx`(`userId`, `status`),
    UNIQUE INDEX `UserProblem_userId_problemId_key`(`userId`, `problemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserProblem` ADD CONSTRAINT `UserProblem_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserProblem` ADD CONSTRAINT `UserProblem_problemId_fkey` FOREIGN KEY (`problemId`) REFERENCES `Problem`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
