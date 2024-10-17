/*
  Warnings:

  - You are about to drop the column `menuId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_menuId_fkey";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "menuId";

-- CreateTable
CREATE TABLE "MenuItemOnMenu" (
    "menuId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,

    CONSTRAINT "MenuItemOnMenu_pkey" PRIMARY KEY ("menuId","menuItemId")
);

-- CreateIndex
CREATE INDEX "MenuItemOnMenu_menuId_idx" ON "MenuItemOnMenu"("menuId");

-- CreateIndex
CREATE INDEX "MenuItemOnMenu_menuItemId_idx" ON "MenuItemOnMenu"("menuItemId");

-- AddForeignKey
ALTER TABLE "MenuItemOnMenu" ADD CONSTRAINT "MenuItemOnMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemOnMenu" ADD CONSTRAINT "MenuItemOnMenu_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
