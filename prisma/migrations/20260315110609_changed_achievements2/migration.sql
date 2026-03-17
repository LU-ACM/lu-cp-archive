/*
  Warnings:

  - A unique constraint covering the columns `[title,month,year]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "achievements_user_id_title_month_year_key";

-- CreateIndex
CREATE UNIQUE INDEX "achievements_title_month_year_key" ON "achievements"("title", "month", "year");
