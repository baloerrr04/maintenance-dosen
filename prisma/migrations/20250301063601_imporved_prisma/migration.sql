/*
  Warnings:

  - You are about to drop the column `jam` on the `tb_jadwals` table. All the data in the column will be lost.
  - You are about to alter the column `hari` on the `tb_jadwals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to drop the column `semester` on the `tb_mata_kuliahs` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kode]` on the table `tb_dosens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dosen_id,hari,time_slot_id]` on the table `tb_jadwals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kelas_id,hari,time_slot_id]` on the table `tb_jadwals` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama,period]` on the table `tb_kelas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode,prodi_id]` on the table `tb_mata_kuliahs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nama]` on the table `tb_prodis` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `period` to the `tb_jadwals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time_slot_id` to the `tb_jadwals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `period` to the `tb_kelas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tb_jadwals` DROP COLUMN `jam`,
    ADD COLUMN `period` ENUM('PAGI', 'SIANG', 'SORE') NOT NULL,
    ADD COLUMN `time_slot_id` VARCHAR(191) NOT NULL,
    MODIFY `hari` ENUM('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU') NOT NULL;

-- AlterTable
ALTER TABLE `tb_kelas` ADD COLUMN `period` ENUM('PAGI', 'SIANG', 'SORE') NOT NULL;

-- AlterTable
ALTER TABLE `tb_mata_kuliahs` DROP COLUMN `semester`;

-- CreateTable
CREATE TABLE `tb_time_slots` (
    `id` VARCHAR(191) NOT NULL,
    `start_time` VARCHAR(191) NOT NULL,
    `end_time` VARCHAR(191) NOT NULL,
    `display_text` VARCHAR(191) NOT NULL,
    `period` ENUM('PAGI', 'SIANG', 'SORE') NOT NULL,
    `day_specific` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tb_time_slots_start_time_end_time_period_key`(`start_time`, `end_time`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `tb_dosens_kode_key` ON `tb_dosens`(`kode`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_jadwals_dosen_id_hari_time_slot_id_key` ON `tb_jadwals`(`dosen_id`, `hari`, `time_slot_id`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_jadwals_kelas_id_hari_time_slot_id_key` ON `tb_jadwals`(`kelas_id`, `hari`, `time_slot_id`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_kelas_nama_period_key` ON `tb_kelas`(`nama`, `period`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_mata_kuliahs_kode_prodi_id_key` ON `tb_mata_kuliahs`(`kode`, `prodi_id`);

-- CreateIndex
CREATE UNIQUE INDEX `tb_prodis_nama_key` ON `tb_prodis`(`nama`);

-- AddForeignKey
ALTER TABLE `tb_jadwals` ADD CONSTRAINT `tb_jadwals_time_slot_id_fkey` FOREIGN KEY (`time_slot_id`) REFERENCES `tb_time_slots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
