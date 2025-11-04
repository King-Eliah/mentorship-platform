const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function resetPassword() {
  try {
    const newPassword = 'Admin@123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('🔧 Resetting password for eliahabormegah@gmail.com...');
    
    const user = await prisma.user.update({
      where: { email: 'eliahabormegah@gmail.com' },
      data: { password: hashedPassword },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    });
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Role:', user.role);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
