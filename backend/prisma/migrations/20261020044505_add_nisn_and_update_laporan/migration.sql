/*
  Warnings:

  - You are about to drop the column `laporanId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `buktiUrl` on the `Laporan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nisn]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sesiId` to the `Chat` table without a default value. This is not possible if the table is not empty.
  - Made the column `senderId` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `lokasiKejadian` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pelaporId` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `waktuKejadian` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `kategori` on the `Laporan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `nisn` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KategoriKasus" AS ENUM ('BULLYING', 'KEKERASAN_VERBAL', 'KEKERASAN_FISIK', 'PELECEHAN_LAINNYA');

-- CreateEnum
CREATE TYPE "JenisSesi" AS ENUM ('BK', 'PSIKOLOG');

-- CreateEnum
CREATE TYPE "StatusSesi" AS ENUM ('AKTIF', 'SELESAI');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PSIKOLOG';

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_laporanId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_senderId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "laporanId",
ADD COLUMN     "sesiId" TEXT NOT NULL,
ADD COLUMN     "sudahBaca" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "senderId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Laporan" DROP COLUMN "buktiUrl",
ADD COLUMN     "lokasiKejadian" TEXT NOT NULL,
ADD COLUMN     "pelaporId" TEXT NOT NULL,
ADD COLUMN     "waktuKejadian" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "isAnonim" SET DEFAULT false,
DROP COLUMN "kategori",
ADD COLUMN     "kategori" "KategoriKasus" NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "nisn" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BuktiLaporan" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "tipeFile" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BuktiLaporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatStatusLaporan" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "pengubahId" TEXT NOT NULL,
    "statusSebelumnya" "StatusLaporan",
    "statusBaru" "StatusLaporan" NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatStatusLaporan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesiKonsultasi" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruBkId" TEXT,
    "psikologId" TEXT,
    "jenis" "JenisSesi" NOT NULL DEFAULT 'BK',
    "status" "StatusSesi" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SesiKonsultasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontenEdukasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "ringkasan" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "gambarSampul" TEXT,
    "tanggalPublikasi" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "penulisId" TEXT NOT NULL,

    CONSTRAINT "KontenEdukasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kodeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RiwayatStatusLaporan_laporanId_idx" ON "RiwayatStatusLaporan"("laporanId");

-- CreateIndex
CREATE INDEX "SesiKonsultasi_siswaId_idx" ON "SesiKonsultasi"("siswaId");

-- CreateIndex
CREATE INDEX "SesiKonsultasi_psikologId_idx" ON "SesiKonsultasi"("psikologId");

-- CreateIndex
CREATE INDEX "Chat_sesiId_createdAt_idx" ON "Chat"("sesiId", "createdAt");

-- CreateIndex
CREATE INDEX "Laporan_pelaporId_idx" ON "Laporan"("pelaporId");

-- CreateIndex
CREATE INDEX "Laporan_status_idx" ON "Laporan"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_nisn_key" ON "User"("nisn");

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuktiLaporan" ADD CONSTRAINT "BuktiLaporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatStatusLaporan" ADD CONSTRAINT "RiwayatStatusLaporan_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatStatusLaporan" ADD CONSTRAINT "RiwayatStatusLaporan_pengubahId_fkey" FOREIGN KEY ("pengubahId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesiKonsultasi" ADD CONSTRAINT "SesiKonsultasi_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesiKonsultasi" ADD CONSTRAINT "SesiKonsultasi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesiKonsultasi" ADD CONSTRAINT "SesiKonsultasi_guruBkId_fkey" FOREIGN KEY ("guruBkId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesiKonsultasi" ADD CONSTRAINT "SesiKonsultasi_psikologId_fkey" FOREIGN KEY ("psikologId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sesiId_fkey" FOREIGN KEY ("sesiId") REFERENCES "SesiKonsultasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontenEdukasi" ADD CONSTRAINT "KontenEdukasi_penulisId_fkey" FOREIGN KEY ("penulisId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
