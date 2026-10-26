/*
  Warnings:

  - A unique constraint covering the columns `[kelas]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kelas" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_kelas_key" ON "User"("kelas");
