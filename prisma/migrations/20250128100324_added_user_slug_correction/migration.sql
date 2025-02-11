/*
  Warnings:

  - You are about to drop the column `slug` on the `RadarUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RadarUser_slug_key";

-- AlterTable
ALTER TABLE "RadarUser" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "slug" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");
