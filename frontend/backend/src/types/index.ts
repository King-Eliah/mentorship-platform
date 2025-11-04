import { Request } from 'express';
import { Role } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
  };
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

// Export messaging types
export * from './messaging';
