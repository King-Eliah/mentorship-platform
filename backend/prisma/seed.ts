import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const                                                                                                                                                                                                                                                                 admin = await prisma.user.upsert({
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

  // Create admin profile
  await prisma.profile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      organization: 'Mentorship Platform',
      position: 'Platform Administrator',
    },
  });

  console.log('✅ Admin profile created');

  // Create a mentor user
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

  // Create mentor profile
  await prisma.profile.upsert({
    where: { userId: mentor.id },
    update: {},
    create: {
      userId: mentor.id,
      organization: 'Tech Corp',
      position: 'Senior Developer',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      interests: ['Web Development', 'Mentoring', 'Open Source'],
    },
  });

  await prisma.mentorProfile.upsert({
    where: { userId: mentor.id },
    update: {},
    create: {
      userId: mentor.id,
      expertise: ['Web Development', 'JavaScript', 'React'],
      yearsExperience: 8,
      maxMentees: 5,
      isAvailable: true,
    },
  });

  console.log('✅ Mentor profiles created');

  // Create a mentee user
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

  // Create mentee profile
  await prisma.profile.upsert({
    where: { userId: mentee.id },
    update: {},
    create: {
      userId: mentee.id,
      organization: 'Learning Academy',
      position: 'Student',
      skills: ['HTML', 'CSS', 'JavaScript'],
      interests: ['Web Development', 'Career Growth'],
    },
  });

  console.log('✅ Mentee profile created');

  // Create sample group
  const group = await prisma.group.create({
    data: {
      name: 'Web Developers Community',
      description: 'A community for web developers to share knowledge and resources',
      category: 'Technology',
      isPrivate: false,
      maxMembers: 100,
    },
  });

  console.log('✅ Sample group created:', group.name);

  // Add users to group
  await prisma.groupMember.createMany({
    data: [
      { groupId: group.id, userId: admin.id, role: 'ADMIN' },
      { groupId: group.id, userId: mentor.id, role: 'MODERATOR' },
      { groupId: group.id, userId: mentee.id, role: 'MEMBER' },
    ],
  });

  console.log('✅ Users added to group');

  // Create sample event
  const event = await prisma.event.create({
    data: {
      creatorId: mentor.id,
      title: 'Introduction to React',
      description: 'Learn the basics of React in this hands-on workshop',
      type: 'WORKSHOP',
      location: 'Online',
      isVirtual: true,
      meetingLink: 'https://meet.example.com/react-workshop',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      maxAttendees: 30,
      isPublic: true,
      status: 'UPCOMING',
    },
  });

  console.log('✅ Sample event created:', event.title);

  // Create sample goals for mentee
  await prisma.goal.createMany({
    data: [
      {
        userId: mentee.id,
        title: 'Complete React Course',
        description: 'Finish the comprehensive React development course',
        category: 'Learning',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        userId: mentee.id,
        title: 'Build Portfolio Website',
        description: 'Create a personal portfolio to showcase projects',
        category: 'Project',
        priority: 'MEDIUM',
        status: 'NOT_STARTED',
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      },
    ],
  });

  console.log('✅ Sample goals created');

  // Create welcome notification for mentee
  await prisma.notification.create({
    data: {
      userId: mentee.id,
      type: 'SYSTEM',
      title: 'Welcome to Mentorship Platform!',
      message: 'Start your learning journey by exploring events and connecting with mentors.',
      isRead: false,
    },
  });

  console.log('✅ Welcome notification created');

  console.log('\n🎉 Database seeding completed successfully!\n');
  console.log('📝 Test Accounts Created:');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│ ADMIN                                                   │');
  console.log('│ Email: admin@mentorship.com                             │');
  console.log('│ Password: admin123                                      │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ MENTOR                                                  │');
  console.log('│ Email: mentor@mentorship.com                            │');
  console.log('│ Password: mentor123                                     │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ MENTEE                                                  │');
  console.log('│ Email: mentee@mentorship.com                            │');
  console.log('│ Password: mentee123                                     │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('\n🚀 You can now login with any of these accounts!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
