/*
  Warnings:

  - You are about to alter the column `quadrant` on the `RadarEntry` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(2)`.

*/
-- AlterTable
ALTER TABLE "RadarEntry" ALTER COLUMN "quadrant" SET DATA TYPE VARCHAR(2);
