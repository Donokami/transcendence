import type { User } from './User';

export enum FriendshipStatus {
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

export interface Friendship {
  id: string;
  inActionUserId: string;
  status: FriendshipStatus;
  sender: User;
  receiver: User;
}