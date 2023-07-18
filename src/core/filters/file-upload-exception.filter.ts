import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    if (exception.field === 'file' && exception.code === 'LIMIT_FILE_SIZE') {
      response.status(400).json({
        statusCode: 400,
        error: 'File too large',
      });
    } else if (exception.message === 'Invalid file type') {
      response.status(400).json({
        statusCode: 400,
        error: 'Invalid file type. Only .jpg, .jpeg, and .png are allowed',
      });
    } else {
      response.status(status).json({
        statusCode: status,
      });
    }
  }
}
