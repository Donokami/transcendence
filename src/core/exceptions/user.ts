import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotFound extends HttpException {
  constructor() {
    super('User not found', HttpStatus.NOT_FOUND)
  }
}

export class UserAlreadyExists extends HttpException {
  constructor() {
    super('User already exists', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotAuthenticated extends HttpException {
  constructor() {
    super('User not authenticated', HttpStatus.UNAUTHORIZED)
  }
}

export class UserNotAuthorized extends HttpException {
  constructor() {
    super('User not authorized', HttpStatus.FORBIDDEN)
  }
}
