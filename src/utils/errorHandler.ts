import { AppError } from './AppError';

export interface ErrorResponse {
  message: string;
  status: number;
}

export const handleError = (error: any): ErrorResponse => {
  // Check if it's an AppError - return its message and statusCode
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.statusCode,
    };
  }

  // Otherwise, return 500 with internal server error message
  return {
    message: 'Internal Server Error',
    status: 500,
  };
};

