import { HttpException, HttpStatus } from '@nestjs/common'

export class RoomNotFound extends HttpException {
  constructor() {
    super('This room does not exist or has been deleted', HttpStatus.NOT_FOUND)
  }
}

export class RoomAlreadyExists extends HttpException {
  constructor() {
    super('You already made a room', HttpStatus.BAD_REQUEST)
  }
}

export class RoomNameCannotBeEmpty extends HttpException {
  constructor() {
    super('You cannot set an empty name to a room', HttpStatus.BAD_REQUEST)
  }
}
export class UserAlreadyInRoom extends HttpException {
  constructor() {
    super('You are already in the room', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyInARoom extends HttpException {
  constructor() {
    super(
      'You are already in a room. Leave the room before joining another one',
      HttpStatus.BAD_REQUEST
    )
  }
}

export class RoomIsFull extends HttpException {
  constructor() {
    super('This room is full', HttpStatus.BAD_REQUEST)
  }
}

export class RoomIsPrivate extends HttpException {
  constructor() {
    super('This room is private', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInRoom extends HttpException {
  constructor() {
    super('User not in room', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotOwner extends HttpException {
  constructor() {
    super('You must own the room to perform this', HttpStatus.FORBIDDEN)
  }
}

export class GameAlreadyStarted extends HttpException {
  constructor() {
    super('The game already started', HttpStatus.FORBIDDEN)
  }
}

export class GameNotStarted extends HttpException {
  constructor() {
    super("The game hasn't started. Wait before playing", HttpStatus.FORBIDDEN)
  }
}
