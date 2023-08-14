import { HttpException, HttpStatus } from '@nestjs/common'

export class TwoFaDisabled extends HttpException {
  constructor() {
    super('2FA is disabled', HttpStatus.UNAUTHORIZED)
  }
}

export class InvalidTwoFaToken extends HttpException {
  constructor() {
    super('Invalid 2FA token', HttpStatus.UNAUTHORIZED)
  }
}

export class InvalidPassword extends HttpException {
  constructor() {
    super('Invalid password', HttpStatus.UNAUTHORIZED)
  }
}

export class MissingUsername extends HttpException {
  constructor() {
    super('Username is missing', HttpStatus.BAD_REQUEST)
  }
}

export class UsernameExists extends HttpException {
  constructor() {
    super('Username already exists', HttpStatus.BAD_REQUEST)
  }
}

export class UserHasUsername extends HttpException {
  constructor() {
    super('User already has a username', HttpStatus.BAD_REQUEST)
  }
}
