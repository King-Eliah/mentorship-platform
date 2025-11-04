const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:wZwxUsQlIORrOAFKiJMhJoBvghdhieeD@tramway.proxy.rlwy.net:15536/railway'
    }
  }
});

async function seedEvents() {
  try {
    console.log('🌱 Seeding events...');

    // Get the first admin/mentor user to be the event creator
    const creator = await prisma.user.findFirst({
      where: {
        OR: [
          { role: 'ADMIN' },
          { role: 'MENTOR' }
        ]
      }
    });

    if (!creator) {
      console.error('❌ No admin or mentor user found. Please create a user first.');
      process.exit(1);
      return;
    }

    console.log(`📝 Creating events for user: ${creator.firstName} ${creator.lastName} (${creator.email})`);

    // Create sample events
    const events = [
      {
        creatorId: creator.id,
        title: 'Web Development Workshop',
        description: 'Learn the fundamentals of modern web development including HTML, CSS, JavaScript, and React. Perfect for beginners and intermediate developers.',
        type: 'WORKSHOP',
        location: 'Tech Hub Conference Room A',
        isVirtual: false,
        startTime: new Date('2025-11-15T14:00:00Z'),
        endTime: new Date('2025-11-15T17:00:00Z'),
        maxAttendees: 30,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Career Development Webinar',
        description: 'Expert panel discussion on career growth strategies, networking tips, and professional development in the tech industry.',
        type: 'WEBINAR',
        isVirtual: true,
        meetingLink: 'https://zoom.us/j/example123',
        startTime: new Date('2025-11-20T18:00:00Z'),
        endTime: new Date('2025-11-20T19:30:00Z'),
        maxAttendees: 100,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Tech Networking Mixer',
        description: 'Connect with fellow developers, mentors, and industry professionals in an informal setting. Great opportunity to expand your network!',
        type: 'NETWORKING',
        location: 'Innovation Center Rooftop',
        isVirtual: false,
        startTime: new Date('2025-11-22T17:00:00Z'),
        endTime: new Date('2025-11-22T20:00:00Z'),
        maxAttendees: 50,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'One-on-One Mentoring Session',
        description: 'Personalized mentoring session to discuss your career goals, review your projects, and get guidance on your learning path.',
        type: 'MENTORING_SESSION',
        isVirtual: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        startTime: new Date('2025-11-18T10:00:00Z'),
        endTime: new Date('2025-11-18T11:00:00Z'),
        maxAttendees: 1,
        isPublic: false,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Team Building Social Event',
        description: 'Join us for a fun evening of games, activities, and team bonding. A great way to get to know your fellow mentees and mentors!',
        type: 'SOCIAL',
        location: 'Community Center',
        isVirtual: false,
        startTime: new Date('2025-11-25T19:00:00Z'),
        endTime: new Date('2025-11-25T22:00:00Z'),
        maxAttendees: 40,
        isPublic: true,
        status: 'UPCOMING'
      }
    ];

    // Create events
    for (const eventData of events) {
      const event = await prisma.event.create({
        data: eventData
      });
      console.log(`✅ Created event: ${event.title}`);
    }

    console.log('🎉 Successfully seeded all events!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedEvents();
