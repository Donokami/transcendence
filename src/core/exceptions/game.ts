import { HttpException, HttpStatus } from '@nestjs/common'

export class RoomNotFound extends HttpException {
  constructor() {
    super('Game not found', HttpStatus.NOT_FOUND)
  }
}

export class RoomNeedsAnOwner extends HttpException {
  constructor() {
    super('Room needs an owner', HttpStatus.BAD_REQUEST)
  }
}

export class RoomAlreadyExists extends HttpException {
  constructor() {
    super('Room already exists', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyInRoom extends HttpException {
  constructor() {
    super('User already in room', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyInvited extends HttpException {
  constructor() {
    super('User already invited', HttpStatus.BAD_REQUEST)
  }
}

export class RoomIsFull extends HttpException {
  constructor() {
    super('Room is full', HttpStatus.BAD_REQUEST)
  }
}

export class RoomIsPrivate extends HttpException {
  constructor() {
    super('Room is private', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInvited extends HttpException {
  constructor() {
    super('User not invited', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInRoom extends HttpException {
  constructor() {
    super('User not in room', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotOwner extends HttpException {
  constructor() {
    super('User not owner', HttpStatus.BAD_REQUEST)
  }
}
