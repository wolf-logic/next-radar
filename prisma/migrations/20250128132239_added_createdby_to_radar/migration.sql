-- DropIndex
DROP INDEX "Radar_slug_key";

-- AlterTable
ALTER TABLE "Radar" ADD COLUMN     "createdBy" VARCHAR(255);
