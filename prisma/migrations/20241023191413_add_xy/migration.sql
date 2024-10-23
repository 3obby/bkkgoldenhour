/*
  Warnings:

  - Added the required column `x` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `z` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "x" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "z" DOUBLE PRECISION NOT NULL;
