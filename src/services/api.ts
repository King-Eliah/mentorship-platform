// Simple API utilities for frontend-only app
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const apiUtils = {
  async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  formatError(error: any): APIError {
    if (error instanceof APIError) {
      return error;
    }
    return new APIError(error.message || 'An error occurred');
  }
};