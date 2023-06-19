import { Controller, Post, Body, Get, Req, Res } from '@nestjs/common';
import { Response, Request, request, response } from 'express';

import { AuthService } from '@/modules/auth/auth.service';
import { UsersService } from '@/modules/users/users.service';

import { FriendsService } from './friends.service';

@Controller('social')
export class FriendsController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    private readonly friendService: FriendsService,
  ) {}

  @Post('addfriend')
  async addFriend(@Body('id') id: number) {
    this.friendService.addFriend(id);
  }
  @Get('allRequest')
  async allRequest(@Req() request: Request, @Res() response: Response) {
    // const user = await this.authService.getUserCookie(request);
    // response.send(await this.userService.getAllPendingRequest(user));
  }
}
