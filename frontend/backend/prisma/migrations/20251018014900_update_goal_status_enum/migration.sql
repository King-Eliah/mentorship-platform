-- AlterEnum: Remove CANCELLED from GoalStatus
BEGIN;
CREATE TYPE "GoalStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'PAUSED');
ALTER TABLE "Goal" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Goal" ALTER COLUMN "status" TYPE "GoalStatus_new" USING ("status"::text::"GoalStatus_new");
ALTER TYPE "GoalStatus" RENAME TO "GoalStatus_old";
ALTER TYPE "GoalStatus_new" RENAME TO "GoalStatus";
DROP TYPE "GoalStatus_old";
ALTER TABLE "Goal" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;
