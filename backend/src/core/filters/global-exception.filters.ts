import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  ContextType,
  HttpStatus,
  HttpException,
  Logger
} from '@nestjs/common'
import { Request, Response } from 'express'
import { QueryFailedError } from 'typeorm'
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError'
import { CannotCreateEntityIdMapError } from 'typeorm/error/CannotCreateEntityIdMapError'
import { GlobalResponseError } from '../utils/global.response.error'
import { CONSTRAINS, dbConfig } from '../constants'

interface IError {
  statusCode: number
  error: string
  message: string[]
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    switch (host.getType<ContextType>()) {
      case 'http':
        return this.handleHttpError(exception, host)
      case 'ws':
        return this.handleWsError(exception, host)
    }
  }

  handleHttpError(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    let message: string
    let code: string

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof HttpException) {
      const httpException: HttpException = exception as HttpException

      status = httpException.getStatus()
      if (
        typeof httpException.getResponse() === 'string' ||
        !Array.isArray((httpException.getResponse() as IError).message)
      ) {
        message =
          ((httpException.getResponse() as IError)
            .message as unknown as string) ||
          (httpException.getResponse() as string)
      } else {
        message = (httpException.getResponse() as IError).message.join(', ')
      }
      code = httpException.constructor.name
    }

    switch (exception.constructor) {
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        code = 'QueryFailedError'
        message = (exception as QueryFailedError).message
        if ((exception as any).code === CONSTRAINS.UNIQUE_VIOLATION) {
          switch (dbConfig.type) {
            case 'postgres':
              message = (exception as any)['detail'].replace(
                /^Key \((.*)\)=\((.*)\) (.*)/,
                '$1 $2 already exists'
              ) // todo: to test on production mode
              break
            case 'sqlite':
              message = (exception as any)['driverError'].toString()
              break
          }
        }
        break
      case EntityNotFoundError: // this is another TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as EntityNotFoundError).message
        code = 'EntityNotFoundError'
        break
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as CannotCreateEntityIdMapError).message
        code = 'CannotCreateEntityIdMapError'
        break
      default:
        status ??= status == 0x1f4 ? HttpStatus.UNPROCESSABLE_ENTITY : status
        message ??= 'Unprocessable Entity'
        code ??= 'UnprocessableEntity'
    }

    if (process.env.NODE_ENV === 'production') {
      Logger.error(message, `${request.method} ${request.url}`)
    } else {
      Logger.error(
        message,
        (exception as Error).stack,
        `${request.method} ${request.url}`
      )
    }

    response
      .status(status)
      .json(GlobalResponseError(status, message, code, request))
  }

  handleWsError(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToWs()
    const client = ctx.getClient()
    const message = (exception as Error).message

    if (exception instanceof HttpException) {
      client.emit('error', {
        code: (exception as HttpException).getStatus(),
        type: (exception as HttpException).constructor.name,
        message: exception.message
      })
    } else {
      client.emit('error', {
        code: HttpStatus.UNPROCESSABLE_ENTITY,
        type: 'UnprocessableEntity',
        message: 'Unprocessable Entity'
      })
    }
    if (process.env.NODE_ENV === 'production') {
      Logger.error(message)
    } else {
      Logger.error(message, (exception as Error).stack)
    }
  }
}
