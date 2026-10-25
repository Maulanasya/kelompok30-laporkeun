-- AlterTable
ALTER TABLE "KontenEdukasi" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "KontenEdukasi_isPublished_tanggalPublikasi_idx" ON "KontenEdukasi"("isPublished", "tanggalPublikasi");
