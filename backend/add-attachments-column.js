const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function addAttachmentsColumn() {
  try {
    console.log('🔧 Adding attachments column to Event table...');
    
    // Add the attachments column
    await prisma.$executeRaw`
      ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "attachments" TEXT;
    `;
    
    console.log('✅ Successfully added attachments column!');
    
    // Verify
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Event' AND column_name = 'attachments';
    `;
    
    console.log('📋 Verification:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addAttachmentsColumn();
