-- AlterTable
ALTER TABLE `Flashcard` ADD COLUMN `frequency` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `FlashcardSource` (
    `id` VARCHAR(191) NOT NULL,
    `flashcardId` VARCHAR(191) NOT NULL,
    `paper` VARCHAR(191) NOT NULL,
    `year` VARCHAR(191) NOT NULL,
    `session` VARCHAR(191) NOT NULL,
    `questionNumber` VARCHAR(191) NOT NULL,

    INDEX `FlashcardSource_flashcardId_idx`(`flashcardId`),
    INDEX `FlashcardSource_year_idx`(`year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FlashcardSource` ADD CONSTRAINT `FlashcardSource_flashcardId_fkey` FOREIGN KEY (`flashcardId`) REFERENCES `Flashcard`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
