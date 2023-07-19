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
import { CONSTRAINS } from '../constants'

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

  handleHttpError(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    let message = (exception as any).message.message
    let code = 'HttpException'

    Logger.error(
      message,
      (exception as any).stack,
      `${request.method} ${request.url}`
    )

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof HttpException) {
      status = (exception as HttpException).getStatus()
      message = (exception as HttpException).message
    }

    switch (exception.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus()
        break
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY
        code = (exception as any).code
        console.log((exception as any).code, 'QueryFailedError')

        if ((exception as any).code === CONSTRAINS.UNIQUE_VIOLATION) {
          message = 'User already exists'
          break
        }
        message = (exception as QueryFailedError).message
        break
      case EntityNotFoundError: // this is another TypeOrm error
        console.log((exception as any).code, 'EntityNotFoundError')
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as EntityNotFoundError).message
        code = (exception as any).code
        break
      case CannotCreateEntityIdMapError: // and another
        console.log((exception as any).code, 'CannotCreateEntityIdMapError')
        status = HttpStatus.UNPROCESSABLE_ENTITY
        message = (exception as CannotCreateEntityIdMapError).message
        code = (exception as any).code
        break
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR
    }

    response
      .status(status)
      .json(GlobalResponseError(status, message, code, request))
  }

  handleWsError(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToWs()
    const client = ctx.getClient()
    const message = (exception as any).message.message

    Logger.error(message, (exception as any).stack)

    if (exception instanceof HttpException) {
      client.emit('error', {
        message: exception.message
      })
    } else {
      client.emit('error', {
        message: 'Internal server error'
      })
    }
  }
}
