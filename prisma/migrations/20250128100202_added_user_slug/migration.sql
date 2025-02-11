/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `RadarUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RadarUser" ADD COLUMN     "slug" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "RadarUser_slug_key" ON "RadarUser"("slug");
