import { Response } from 'express';
import { HttpStatus, HttpStatusCode } from '../constants/http-status';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const sendSuccess = <T>(
  res: Response,
  message = 'Operation successful',
  data: T = {} as T,
  statusCode: HttpStatusCode = HttpStatus.OK
): Response => {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  errors: any[] = [],
  statusCode: HttpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR
): Response => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    errors,
  };
  return res.status(statusCode).json(responseBody);
};
