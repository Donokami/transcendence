import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotInChannel extends HttpException {
  constructor() {
    super('User not in channel', HttpStatus.BAD_REQUEST)
  }
}
