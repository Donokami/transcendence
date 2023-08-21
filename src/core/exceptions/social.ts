import { HttpException, HttpStatus } from '@nestjs/common'

export class FriendRequestNotFound extends HttpException {
  constructor() {
    super('Friend request not found', HttpStatus.NOT_FOUND)
  }
}

export class FriendshipAlreadyAccepted extends HttpException {
  constructor() {
    super('Friend request already accepted', HttpStatus.BAD_REQUEST)
  }
}

export class FriendshipAlreadyBlocked extends HttpException {
  constructor() {
    super('Friendship status is already blocked', HttpStatus.BAD_REQUEST)
  }
}

export class FriendshipAlreadyExists extends HttpException {
  constructor() {
    super('Friend request already exists', HttpStatus.BAD_REQUEST)
  }
}

export class FriendshipAlreadyPending extends HttpException {
  constructor() {
    super('Friend request already pending', HttpStatus.BAD_REQUEST)
  }
}

export class FriendshipBlocked extends HttpException {
  constructor() {
    super('Friendship status is blocked', HttpStatus.UNAUTHORIZED)
  }
}

export class FriendshipNotBlocked extends HttpException {
  constructor() {
    super('Friendship status is not blocked', HttpStatus.BAD_REQUEST)
  }
}

export class FriendshipNotFound extends HttpException {
  constructor() {
    super('Friendship is not found', HttpStatus.NOT_FOUND)
  }
}

export class MissingBlockerId extends HttpException {
  constructor() {
    super('Blocker ID is missing', HttpStatus.BAD_REQUEST)
  }
}

export class MissingObservedUserId extends HttpException {
  constructor() {
    super('Observed user ID is missing', HttpStatus.BAD_REQUEST)
  }
}

export class MissingUnblockerId extends HttpException {
  constructor() {
    super('Unblocker ID is missing', HttpStatus.BAD_REQUEST)
  }
}

export class OnlyBlockerCanUnblock extends HttpException {
  constructor() {
    super(
      'Only the blocker can unblock the friendship',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class OnlyReceiverCanHandleFriendRequest extends HttpException {
  constructor() {
    super(
      'Only the receiver can accept or reject a friend request',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class SameIdsError extends HttpException {
  constructor() {
    super('Supplied IDs must be different', HttpStatus.BAD_REQUEST)
  }
}
