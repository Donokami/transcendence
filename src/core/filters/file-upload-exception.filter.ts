import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException
} from '@nestjs/common'
import { Response } from 'express'
import { UnsupportedFileType } from '@/core/exceptions'

@Catch()
export class FileUploadExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500

    if (status === 500) {
      response.status(400).json({
        statusCode: 400,
        code: 'INVALID_FILE',
        error: 'Invalid file'
      })
      return
    }

    if (exception instanceof UnsupportedFileType) {
      response.status(400).json({
        statusCode: 400,
        code: 'INVALID_FILE_TYPE',
        error: 'Unsupported file type'
      })
      return
    }

    if (exception.field === 'file' && exception.code === 'LIMIT_FILE_SIZE') {
      response.status(413).json({
        statusCode: 413,
        code: 'INVALID_FILE_SIZE',
        error: 'File too large'
      })
    } else if (exception.message === 'Invalid file type') {
      response.status(400).json({
        statusCode: 400,
        code: 'INVALID_FILE_TYPE',
        error: 'Unsupported file type'
      })
    } else {
      if (status === 413) {
        response.status(413).json({
          statusCode: 413,
          code: 'INVALID_FILE_SIZE',
          error: 'File too large'
        })
      } else {
        response.status(status).json({
          statusCode: status
        })
      }
    }
  }
}
