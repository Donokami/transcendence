import { Body, Controller, Post, Session } from '@nestjs/common';

import { AuthService } from './auth.service';

import { UserDto } from '@/modules/users/dtos/user.dto';
import { CreateUserDto } from '@/modules/users/dtos/create-user.dto';

import { Serialize } from '@/core/interceptors/serialize.interceptor';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const { email, password, username } = body;

    console.log('[DEBUG] - BACK - createUser called in user.controller.ts');

    const user = await this.authService.signup(email, password, username);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }
}
