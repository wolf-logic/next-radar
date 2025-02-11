/*
  Warnings:

  - Made the column `ring2` on table `Radar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ring3` on table `Radar` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Radar" ALTER COLUMN "ring2" SET NOT NULL,
ALTER COLUMN "ring3" SET NOT NULL;
