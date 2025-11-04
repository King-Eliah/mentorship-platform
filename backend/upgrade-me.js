const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function upgrade() {
  try {
    const user = await prisma.user.update({
      where: { email: 'eliahabormegah@gmail.com' },
      data: { 
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });
    console.log('✅ SUCCESS! Upgraded to ADMIN');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

upgrade();
