-- AlterTable
ALTER TABLE "IncidentReport" ADD COLUMN     "attachments" JSONB,
ADD COLUMN     "involvedParties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "witnessNames" TEXT;
