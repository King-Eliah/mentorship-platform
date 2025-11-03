const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
      return;
    }

    console.log(`📝 Creating events for user: ${creator.firstName} ${creator.lastName}`);

    // Create sample events
    const events = [
      {
        creatorId: creator.id,
        title: 'Web Development Workshop',
        description: 'Learn the fundamentals of modern web development including HTML, CSS, JavaScript, and React. Perfect for beginners and intermediate developers.',
        type: 'WORKSHOP',
        location: 'Tech Hub Conference Room A',
        isVirtual: false,
        startTime: new Date('2025-10-25T14:00:00Z'),
        endTime: new Date('2025-10-25T17:00:00Z'),
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
        startTime: new Date('2025-10-28T18:00:00Z'),
        endTime: new Date('2025-10-28T19:30:00Z'),
        maxAttendees: 100,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Monthly Networking Mixer',
        description: 'Connect with fellow mentors and mentees in a casual social setting. Share experiences, build relationships, and expand your professional network.',
        type: 'NETWORKING',
        location: 'Downtown Coffee & Co.',
        isVirtual: false,
        startTime: new Date('2025-11-05T17:30:00Z'),
        endTime: new Date('2025-11-05T19:30:00Z'),
        maxAttendees: 50,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'One-on-One Mentoring Session',
        description: 'Personalized mentoring session covering goal setting, skill development, and career planning. Book your slot today!',
        type: 'MENTORING_SESSION',
        isVirtual: true,
        meetingLink: 'https://meet.google.com/example-abc',
        startTime: new Date('2025-10-22T10:00:00Z'),
        endTime: new Date('2025-10-22T11:00:00Z'),
        maxAttendees: 1,
        isPublic: false,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Data Science Fundamentals Workshop',
        description: 'Introduction to data science concepts, Python for data analysis, and machine learning basics. Hands-on exercises included.',
        type: 'WORKSHOP',
        location: 'Innovation Lab',
        isVirtual: false,
        startTime: new Date('2025-11-10T13:00:00Z'),
        endTime: new Date('2025-11-10T16:00:00Z'),
        maxAttendees: 25,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Tech Industry Trends Webinar',
        description: 'Stay ahead of the curve with insights into emerging technologies, industry trends, and future career opportunities.',
        type: 'WEBINAR',
        isVirtual: true,
        meetingLink: 'https://teams.microsoft.com/example',
        startTime: new Date('2025-11-15T16:00:00Z'),
        endTime: new Date('2025-11-15T17:30:00Z'),
        maxAttendees: 200,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Team Building Social Event',
        description: 'Fun team building activities, games, and refreshments. A great opportunity to unwind and connect with colleagues.',
        type: 'SOCIAL',
        location: 'Riverside Park Pavilion',
        isVirtual: false,
        startTime: new Date('2025-11-20T15:00:00Z'),
        endTime: new Date('2025-11-20T18:00:00Z'),
        maxAttendees: 60,
        isPublic: true,
        status: 'UPCOMING'
      },
      {
        creatorId: creator.id,
        title: 'Resume & Interview Skills Workshop',
        description: 'Learn how to craft compelling resumes, optimize your LinkedIn profile, and ace technical interviews.',
        type: 'WORKSHOP',
        isVirtual: true,
        meetingLink: 'https://zoom.us/j/example456',
        startTime: new Date('2025-10-30T19:00:00Z'),
        endTime: new Date('2025-10-30T21:00:00Z'),
        maxAttendees: 40,
        isPublic: true,
        status: 'UPCOMING'
      }
    ];

    // Create all events
    for (const eventData of events) {
      const event = await prisma.event.create({
        data: eventData,
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      console.log(`✅ Created event: "${event.title}"`);
    }

    console.log(`\n🎉 Successfully created ${events.length} sample events!`);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedEvents()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
