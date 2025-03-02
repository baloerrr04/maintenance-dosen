/*
  Warnings:

  - You are about to drop the `tb_semesters` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `prodi_id` to the `tb_mata_kuliahs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `tb_mata_kuliahs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tb_semesters` DROP FOREIGN KEY `tb_semesters_prodi_id_fkey`;

-- AlterTable
ALTER TABLE `tb_mata_kuliahs` ADD COLUMN `prodi_id` VARCHAR(191) NOT NULL,
    ADD COLUMN `semester` INTEGER NOT NULL;

-- DropTable
DROP TABLE `tb_semesters`;

-- AddForeignKey
ALTER TABLE `tb_mata_kuliahs` ADD CONSTRAINT `tb_mata_kuliahs_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `tb_prodis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
