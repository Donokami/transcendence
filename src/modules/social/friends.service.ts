import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { request } from 'http';

import { User } from '@/modules/users/user.entity';
import { UsersService } from '@/modules/users/users.service';

import { Friend } from './entities/friend.entity';
import { BlockedUser } from './entities/blockedUser.entity';
import { PendingRequest } from './entities/pendingRequest.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private friendRepository: Repository<Friend>,
    @InjectRepository(BlockedUser)
    private blockedUserRepository: Repository<BlockedUser>,
  ) {}

  async addFriend(data): Promise<any> {
    return this.friendRepository.save(data);
  }

  async blockUser(data): Promise<any> {
    return this.blockedUserRepository.save(data);
  }

  async deleteFriend(currentUser: User, friendUser: User) {
    try {
      const relation: any = await this.getRelation(currentUser, friendUser);
      await this.friendRepository.delete(relation);
    } catch (error) {
      console.log(error);
    }
  }
  async getFriends(currentUser: User): Promise<any> {
    const requestFrom = await this.friendRepository.find({
      where: {
        userA: currentUser,
      },
      relations: ['userB'],
      select: {
        userB: {
          id: true,
          username: true,
          profile_picture: true,
          status: true,
        },
      },
    });

    const requestTo = await this.friendRepository.find({
      where: {
        userB: currentUser,
      },
      relations: ['userA'],
      select: {
        userA: {
          id: true,
          username: true,
          profile_picture: true,
          status: true,
        },
      },
    });

    const friendList = [];

    for (let i = 0; i < requestFrom.length; i++) {
      if (
        !requestTo.find((item) => item.userA.id === requestFrom[i].userB.id)
      ) {
        friendList.push(requestFrom[i].userB);
        console.log('yes');
      }
      console.log('no');
    }

    for (let i = 0; i < requestTo.length; i++) {
      if (
        !requestFrom.find((item) => item.userB.id === requestTo[i].userA.id)
      ) {
        friendList.push(requestTo[i].userA);
        console.log('yes');
      }
      console.log('alreadyFriends');
    }

    console.log('FriendList', friendList);
    return friendList;
  }

  async getRelation(currentUser: User, userReceived: User) {
    const relation1 = await this.friendRepository.find({
      where: {
        userA: currentUser,
        userB: userReceived,
      },
    });
    const relation2 = await this.friendRepository.find({
      where: {
        userA: userReceived,
        userB: currentUser,
      },
    });

    if (relation1.length) return relation1;
    else if (relation2.length) return relation2;
  }

  async getBlockedRelation(currentUser: User, otherUser: User) {
    const relation1 = await this.blockedUserRepository.find({
      where: {
        currentUser: currentUser,
        otherUser: otherUser,
      },
    });

    if (relation1.length) {
      console.log('relqtion bloc-k 1', relation1);
      return relation1;
    }
  }

  async getBlockedUsers(currentUser: User): Promise<any> {
    const blockedList = await this.blockedUserRepository.find({
      //The relations when They send me a Friend request;
      where: {
        currentUser: currentUser,
      },
      relations: ['otherUser'],
      select: {
        otherUser: {
          id: true,
          nickname: true,
          profile_picture: true,
          status: true,
        },
      },
    });

    const blockedList2 = [];
    console.log('blockedList', blockedList);
    for (let i = 0; i < blockedList.length; i++) {
      blockedList2.push(blockedList[i].otherUser);
    }

    console.log('blockedList service', blockedList2);
    return blockedList2;
  }

  async unblockUser(currentUser: User, otherUser: User) {
    try {
      console.log('here', currentUser, otherUser);
      const relation: any = await this.getBlockedRelation(
        currentUser,
        otherUser,
      );
      console.log('unblock', relation);
      await this.blockedUserRepository.delete(relation);
    } catch (error) {
      console.log(error);
    }
  }
}
