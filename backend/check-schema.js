const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function checkSchema() {
  try {
    // Raw query to check Event table columns
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Event'
      ORDER BY ordinal_position;
    `;
    
    console.log('📋 Event table columns:');
    console.log(result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
