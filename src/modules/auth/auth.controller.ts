import { Body, Controller, Post, Session } from '@nestjs/common';

import { AuthService } from './auth.service';

import { UserDto } from '@/modules/users/dtos/user.dto';
import { RegisterUserDto } from '@/modules/users/dtos/register-user.dto';
import { SignInUserDto } from '@/modules/users/dtos/signin-user.dto';

import { Serialize } from '@/core/interceptors/serialize.interceptor';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  async createUser(@Body() body: RegisterUserDto, @Session() session: any) {
    const { email, password, username } = body;

    const user = await this.authService.register(email, password, username);
    session.userId = user.id;
    return user;
  }

  @Post('/signIn')
  async signIn(@Body() body: SignInUserDto, @Session() session: any) {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }
}
