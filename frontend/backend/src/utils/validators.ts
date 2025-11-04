import { body, ValidationChain } from 'express-validator';

export const registerValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('role').optional().isIn(['MENTOR', 'MENTEE', 'ADMIN']),
];

export const loginValidation: ValidationChain[] = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const eventValidation: ValidationChain[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type')
    .isIn(['WORKSHOP', 'WEBINAR', 'NETWORKING', 'MENTORING_SESSION', 'SOCIAL', 'OTHER'])
    .withMessage('Invalid event type'),
  body('startTime').isISO8601().withMessage('Valid start time is required'),
  body('endTime').isISO8601().withMessage('Valid end time is required'),
];

export const goalValidation: ValidationChain[] = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH'])
    .withMessage('Invalid priority'),
];

export const groupValidation: ValidationChain[] = [
  body('name').notEmpty().withMessage('Group name is required'),
  body('description').notEmpty().withMessage('Description is required'),
];

export const messageValidation: ValidationChain[] = [
  body('content').notEmpty().withMessage('Message content is required'),
];
