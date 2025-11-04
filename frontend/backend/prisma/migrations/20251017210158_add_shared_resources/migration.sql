-- CreateTable
CREATE TABLE "SharedResource" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedResource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedResource_resourceId_idx" ON "SharedResource"("resourceId");

-- CreateIndex
CREATE INDEX "SharedResource_sharedById_idx" ON "SharedResource"("sharedById");

-- CreateIndex
CREATE INDEX "SharedResource_sharedWithId_idx" ON "SharedResource"("sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedResource_resourceId_sharedWithId_key" ON "SharedResource"("resourceId", "sharedWithId");

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedResource" ADD CONSTRAINT "SharedResource_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
