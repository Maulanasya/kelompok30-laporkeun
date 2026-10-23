/*
  Warnings:

  - You are about to drop the column `sesiId` on the `Chat` table. All the data in the column will be lost.
  - Added the required column `laporanId` to the `Chat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_sesiId_fkey";

-- DropIndex
DROP INDEX "Chat_sesiId_createdAt_idx";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "sesiId",
ADD COLUMN     "laporanId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Chat_laporanId_createdAt_idx" ON "Chat"("laporanId", "createdAt");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "Laporan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
