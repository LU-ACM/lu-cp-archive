/*
  Warnings:

  - A unique constraint covering the columns `[user_id,title,month,year]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `month` to the `achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `achievements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "achievements" DROP CONSTRAINT "achievements_user_id_fkey";

-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "achievements_user_id_title_month_year_key" ON "achievements"("user_id", "title", "month", "year");

-- AddForeignKey
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
