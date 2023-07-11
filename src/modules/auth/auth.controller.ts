import {
  Body,
  Controller,
  Post,
  Get,
  Session,
  UseGuards,
  Req,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { Serialize } from '@/core/interceptors/serialize.interceptor';
import { UserDto } from '@/modules/users/dtos/user.dto';
import { RegisterUserDto } from '@/modules/users/dtos/register-user.dto';
import { SignInUserDto } from '@/modules/users/dtos/signin-user.dto';

import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dtos/verify-token.dto';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('42/signIn')
  @UseGuards(AuthGuard('42'))
  fortyTwoAuth() {
    return { msg: '42 Authentification' };
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  fortyTwoAuthCallback(@Req() request: any, @Session() session: any) {
    if (request.user && request.user.id) {
      if (request.user.isTwoFactorEnabled) {
        session.twoFactorUserId = request.user.id;
      } else {
        session.userId = request.user.id;
      }
    }
  }

  @Get('/authStatus')
  authStatus(@Session() session: any) {
    if (session.userId) {
      return { status: 'authenticated' };
    } else if (session.twoFactorUserId) {
      return { status: 'requires_2fa' };
    } else {
      return { status: 'not_authenticated' };
    }
  }

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

    if (user.isTwoFactorEnabled) {
      session.twoFactorUserId = user.id;
      return user;
    }

    session.userId = user.id;
    return user;
  }

  @Post('/enableTwoFactor')
  async enableTwoFactor(@Session() session: any) {
    const result = await this.authService.toggleTwoFactor(session.userId);
    return result;
  }

  @Post('/verifyToken')
  async verifyToken(@Body() body: VerifyTokenDto, @Session() session: any) {
    const token = body.token;

    try {
      const user = await this.authService.verifyTwoFactorToken(
        session.twoFactorUserId,
        token,
      );

      session.userId = user.id;
      session.twoFactorUserId = null;

      return user;
    } catch (err) {
      throw err;
    }
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }
}
