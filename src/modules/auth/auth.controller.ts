import {
  Body,
  Controller,
  Post,
  Get,
  Session,
  UseGuards,
  Req,
  UseFilters
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'

import { RegisterUserDto } from '@/modules/users/dtos/register-user.dto'
import { SignInUserDto } from '@/modules/users/dtos/signin-user.dto'

import { AuthService } from './auth.service'
import { VerifyTokenDto } from './dtos/verify-token.dto'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { ApiOperation } from '@nestjs/swagger'

@Controller('auth')
@UseFilters(new GlobalExceptionFilter())
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('42/signIn')
  @UseGuards(AuthGuard('42'))
  @ApiOperation({
    summary: 'Sign in with 42',
    operationId: 'fortyTwoAuth',
    description: 'Sign in with 42',
    tags: ['auth']
  })
  fortyTwoAuth() {
    return { msg: '42 Authentification' }
  }

  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  @ApiOperation({
    summary: 'Callback URI for 42 auth',
    operationId: 'fortyTwoAuthCallback',
    description: 'Callback URI for 42 auth',
    tags: ['auth']
  })
  fortyTwoAuthCallback(@Req() request: any, @Session() session: any) {
    if (request.user && request.user.id) {
      if (request.user.isTwoFactorEnabled) {
        session.twoFactorUserId = request.user.id
      } else {
        session.userId = request.user.id
      }
    }
  }

  @Get('/authStatus')
  @ApiOperation({
    summary: 'Get auth status',
    operationId: 'authStatus',
    description: 'Get auth status',
    tags: ['auth']
  })
  authStatus(@Session() session: any) {
    if (session.userId) {
      return { status: 'authenticated' }
    } else if (session.twoFactorUserId) {
      return { status: 'requires_2fa' }
    } else {
      return { status: 'not_authenticated' }
    }
  }

  @Post('/register')
  @ApiOperation({
    summary: 'Register a new user',
    operationId: 'createUser',
    description: 'Register a new user',
    tags: ['auth']
  })
  async createUser(@Body() body: RegisterUserDto, @Session() session: any) {
    const { password, username } = body
    const user = await this.authService.register(username, password)
    session.userId = user.id
    return user
  }

  @Post('/signIn')
  @ApiOperation({
    summary: 'Sign in with username and password',
    operationId: 'signIn',
    description: 'Sign in with username and password',
    tags: ['auth']
  })
  async signIn(@Body() body: SignInUserDto, @Session() session: any) {
    const user = await this.authService.signIn(body.username, body.password)

    if (user.isTwoFactorEnabled) {
      session.twoFactorUserId = user.id
      return user
    }

    session.userId = user.id
    return user
  }

  @Post('/enableTwoFactor')
  @ApiOperation({
    summary: 'Enable 2FA',
    operationId: 'enableTwoFactor',
    description: 'Enable 2FA',
    tags: ['auth']
  })
  async enableTwoFactor(@Session() session: any) {
    const result = await this.authService.toggleTwoFactor(session.userId)

    return result
  }

  @Post('/verifyToken')
  @ApiOperation({
    summary: 'Verify 2FA token',
    operationId: 'verifyToken',
    description: 'Verify 2FA token',
    tags: ['auth']
  })
  async verifyToken(@Body() body: VerifyTokenDto, @Session() session: any) {
    const token = body.token
    try {
      const user = await this.authService.verifyTwoFactorToken(
        session.twoFactorUserId,
        token
      )

      session.userId = user.id
      session.twoFactorUserId = null

      return user
    } catch (err) {
      throw err
    }
  }

  @Post('/signout')
  @ApiOperation({
    summary: 'Sign out session',
    operationId: 'signOut',
    description: 'Sign out session',
    tags: ['auth']
  })
  signOut(@Session() session: any) {
    session.userId = null
    session.twoFactorUserId = null
    return { status: 'ok' }
  }
}
