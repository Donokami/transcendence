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

export class ChannelMembersNotFound extends HttpException {
  constructor() {
    super(
      'No members found in this channel for the given IDs.',
      HttpStatus.NOT_FOUND
    )
  }
}

export class DmChannelMembersLimit extends HttpException {
  constructor() {
    super(
      'DM channel should not have more than 2 members.',
      HttpStatus.BAD_REQUEST
    )
  }
}

export class ChannelAlreadyExists extends HttpException {
  constructor() {
    super('Channel already exists.', HttpStatus.BAD_REQUEST)
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

export class MissingGroupPassword extends HttpException {
  constructor() {
    super('Group password is missing.', HttpStatus.UNAUTHORIZED)
  }
}

export class UserAlreadyAdmin extends HttpException {
  constructor() {
    super('User is already a group admin.', HttpStatus.BAD_REQUEST)
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

export class UserIsBanned extends HttpException {
  constructor() {
    super('User is banned.', HttpStatus.UNAUTHORIZED)
  }
}

export class UserIsNotAdmin extends HttpException {
  constructor() {
    super('User is not a group admin.', HttpStatus.BAD_REQUEST)
  }
}

export class UserIsNotBanned extends HttpException {
  constructor() {
    super('User is not banned admin.', HttpStatus.BAD_REQUEST)
  }
}

export class UserNotInChannel extends HttpException {
  constructor() {
    super('User not in channel.', HttpStatus.BAD_REQUEST)
  }
}

export class UserIsMuted extends HttpException {
  constructor() {
    super('User is muted.', HttpStatus.BAD_REQUEST)
  }
}
