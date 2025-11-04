const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'eliahabormegah@gmail.com' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
      }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
