import { HttpException, HttpStatus } from '@nestjs/common'

export class ChannelMembersNotFound extends HttpException {
  constructor() {
    super('No members found for the given IDs', HttpStatus.NOT_FOUND)
  }
}

export class ChannelNotFound extends HttpException {
  constructor() {
    super('Channel not found', HttpStatus.NOT_FOUND)
  }
}

export class InvalidGroupPassword extends HttpException {
  constructor() {
    super('Invalid group password', HttpStatus.UNAUTHORIZED)
  }
}

export class MissingChannelId extends HttpException {
  constructor() {
    super('Channel ID is missing', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyAdmin extends HttpException {
  constructor() {
    super('User is already an admin', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyBanned extends HttpException {
  constructor() {
    super('User is already banned', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyKicked extends HttpException {
  constructor() {
    super('User is already kicked', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyMuted extends HttpException {
  constructor() {
    super('User is already muted', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyInChannel extends HttpException {
  constructor() {
    super('User is already a member of this channel', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInChannel extends HttpException {
  constructor() {
    super('User not in channel', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotOwner extends HttpException {
  constructor() {
    super('You must own the group to perform this action', HttpStatus.FORBIDDEN)
  }
}
