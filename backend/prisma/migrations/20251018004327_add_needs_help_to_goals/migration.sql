-- AlterTable
ALTER TABLE "Goal" ADD COLUMN     "helpRequestedAt" TIMESTAMP(3),
ADD COLUMN     "needsHelp" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Goal_needsHelp_idx" ON "Goal"("needsHelp");
