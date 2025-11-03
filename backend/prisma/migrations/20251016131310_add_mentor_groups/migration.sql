-- CreateTable
CREATE TABLE "MentorGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "mentorId" TEXT NOT NULL,
    "menteeIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxMembers" INTEGER DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorGroup_mentorId_idx" ON "MentorGroup"("mentorId");

-- CreateIndex
CREATE INDEX "MentorGroup_isActive_idx" ON "MentorGroup"("isActive");

-- AddForeignKey
ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
