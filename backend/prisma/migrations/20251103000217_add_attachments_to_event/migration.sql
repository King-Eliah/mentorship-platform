/*
  Warnings:

  - You are about to drop the column `contactRequestsReceived` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `contactRequestsSent` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "replyToId" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "attachments" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "contactRequestsReceived",
DROP COLUMN "contactRequestsSent";

-- CreateIndex
CREATE INDEX "DirectMessage_replyToId_idx" ON "DirectMessage"("replyToId");

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
