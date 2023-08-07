import { HttpException, HttpStatus } from '@nestjs/common'

export class CannotActOnSelf extends HttpException {
  constructor() {
    super('Cannot act on self.', HttpStatus.UNAUTHORIZED)
  }
}

export class CannotKickBanMuteAdmin extends HttpException {
  constructor() {
    super(
      'Only the owner of the group can kick, ban, or mute an admin.',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class CannotModifyPassword extends HttpException {
  constructor() {
    super(
      'Only the owner of the group can set, change, or remove the password.',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class CannotSetAdmin extends HttpException {
  constructor() {
    super(
      'Only the owner of the group can set a user as an admin.',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class ChannelMembersNotFound extends HttpException {
  constructor() {
    super(
      'No members found in this channel for the given IDs.',
      HttpStatus.NOT_FOUND
    )
  }
}

export class ChannelNotFound extends HttpException {
  constructor() {
    super('Channel not found.', HttpStatus.NOT_FOUND)
  }
}

export class InvalidGroupPassword extends HttpException {
  constructor() {
    super('Invalid group password.', HttpStatus.UNAUTHORIZED)
  }
}

export class MissingChannelId extends HttpException {
  constructor() {
    super('Channel ID is missing.', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyAdmin extends HttpException {
  constructor() {
    super('User is already a gorup admin.', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyBanned extends HttpException {
  constructor() {
    super('User is already banned.', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyKicked extends HttpException {
  constructor() {
    super('User is already kicked.', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyMuted extends HttpException {
  constructor() {
    super('User is already muted.', HttpStatus.BAD_REQUEST)
  }
}

export class UserAlreadyInChannel extends HttpException {
  constructor() {
    super('User is already a member of this channel.', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInChannel extends HttpException {
  constructor() {
    super('User not in channel.', HttpStatus.BAD_REQUEST)
  }
}
