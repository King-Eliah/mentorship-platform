// Quick script to upgrade user to admin
import { PrismaClient } from '@prisma/client';

const DATABASE_URL = 'postgresql://postgres:wZwxUsQlIORpOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway';

async function upgradeToAdmin() {
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL
      }
    }
  });

  try {
    const user = await prisma.user.update({
      where: { email: 'eliahabormegah@gmail.com' },
      data: { 
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ User upgraded to ADMIN:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToAdmin();
