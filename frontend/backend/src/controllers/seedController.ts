import { Request, Response } from 'express';
import { seedDatabase } from '../scripts/seed-database';

// Seed the database - should only be called once during initial setup
export const seedDatabaseController = async (req: Request, res: Response) => {
  try {
    // Simple security check - only allow if no authorization header is set (first time setup)
    const result = await seedDatabase();
    
    res.json({
      message: 'Database seeded successfully',
      users: result.users,
    });
  } catch (error) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      message: 'Error seeding database',
      error: errorMessage,
    });
  }
};
