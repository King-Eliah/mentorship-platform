// Script to seed the database - can be run via Railway
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@mentorconnect.com' },
      update: {},
      create: {
        email: 'admin@mentorconnect.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        isActive: true,
        emailVerified: true,
        bio: 'Platform Administrator',
      },
    });

    console.log('✅ Admin user created:', {
      email: admin.email,
      password: 'admin123',
      role: admin.role,
    });

    // Create mentor user
    const mentorPassword = await bcrypt.hash('mentor123', 10);
    
    const mentor = await prisma.user.upsert({
      where: { email: 'mentor@mentorconnect.com' },
      update: {},
      create: {
        email: 'mentor@mentorconnect.com',
        password: mentorPassword,
        firstName: 'John',
        lastName: 'Mentor',
        role: 'MENTOR',
        status: 'ACTIVE',
        isActive: true,
        emailVerified: true,
        bio: 'Experienced software engineer passionate about mentoring',
      },
    });

    console.log('✅ Mentor user created:', {
      email: mentor.email,
      password: 'mentor123',
      role: mentor.role,
    });

    // Create mentee user
    const menteePassword = await bcrypt.hash('mentee123', 10);
    
    const mentee = await prisma.user.upsert({
      where: { email: 'mentee@mentorconnect.com' },
      update: {},
      create: {
        email: 'mentee@mentorconnect.com',
        password: menteePassword,
        firstName: 'Jane',
        lastName: 'Mentee',
        role: 'MENTEE',
        status: 'ACTIVE',
        isActive: true,
        emailVerified: true,
        bio: 'Aspiring developer looking to learn and grow',
      },
    });

    console.log('✅ Mentee user created:', {
      email: mentee.email,
      password: 'mentee123',
      role: mentee.role,
    });

    console.log('🎉 Database seeding completed successfully!');
    
    return {
      success: true,
      users: {
        admin: { email: 'admin@mentorconnect.com', password: 'admin123' },
        mentor: { email: 'mentor@mentorconnect.com', password: 'mentor123' },
        mentee: { email: 'mentee@mentorconnect.com', password: 'mentee123' },
      }
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { seedDatabase };
