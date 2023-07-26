import { HttpException, HttpStatus } from '@nestjs/common'

export class FriendRequestNotFound extends HttpException {
  constructor() {
    super('Friend request not found', HttpStatus.NOT_FOUND)
  }
}

export class FriendRequestAlreadyExists extends HttpException {
  constructor() {
    super('Friend request already exists', HttpStatus.BAD_REQUEST)
  }
}

export class OnlyReceiverCanAcceptFriendRequest extends HttpException {
  constructor() {
    super(
      'Only the receiver can accept this friend request',
      HttpStatus.UNAUTHORIZED
    )
  }
}

export class FriendRequestAlreadyAccepted extends HttpException {
  constructor() {
    super('Friend request already accepted', HttpStatus.BAD_REQUEST)
  }
}

export class FriendRequestAlreadyBlocked extends HttpException {
  constructor() {
    super('Friend request already blocked', HttpStatus.BAD_REQUEST)
  }
}

export class FriendRequestBlocked extends HttpException {
  constructor() {
    super('Friend request blocked', HttpStatus.UNAUTHORIZED)
  }
}

export class SameIdsError extends HttpException {
  constructor() {
    super('Ids supplied must be different', HttpStatus.BAD_REQUEST)
  }
}

export class FriendRequestNotBlocked extends HttpException {
  constructor() {
    super('Friend request not blocked', HttpStatus.BAD_REQUEST)
  }
}

export class BlockerCannotUnblock extends HttpException {
  constructor() {
    super(
      'The blocker cannot unblock the friend request',
      HttpStatus.UNAUTHORIZED
    )
  }
}
