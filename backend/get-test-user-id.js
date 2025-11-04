const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function getTestUser() {
  try {
    // Get the admin user ID that we can use for testing
    const user = await prisma.user.findUnique({
      where: { email: 'eliahabormegah@gmail.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });
    
    if (user) {
      console.log('✅ Test User ID for search:');
      console.log('   Copy this ID:', user.id);
      console.log('   Name:', `${user.firstName} ${user.lastName}`);
      console.log('   Email:', user.email);
    } else {
      console.log('❌ No user found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

getTestUser();
