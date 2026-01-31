/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform]` on the table `PlatformAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `PlatformAccount_platform_handle_key` ON `PlatformAccount`;

-- CreateIndex
CREATE UNIQUE INDEX `PlatformAccount_userId_platform_key` ON `PlatformAccount`(`userId`, `platform`);
