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
