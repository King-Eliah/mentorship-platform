-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'REJECTED');

-- AlterEnum
ALTER TYPE "GoalStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "RecentActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "relatedEntityId" TEXT,
    "relatedEntityType" TEXT,
    "metadata" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecentActivity_userId_idx" ON "RecentActivity"("userId");

-- CreateIndex
CREATE INDEX "RecentActivity_type_idx" ON "RecentActivity"("type");

-- CreateIndex
CREATE INDEX "RecentActivity_createdAt_idx" ON "RecentActivity"("createdAt");

-- CreateIndex
CREATE INDEX "RecentActivity_isPublic_idx" ON "RecentActivity"("isPublic");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");
