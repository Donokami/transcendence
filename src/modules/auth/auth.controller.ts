import {
  Body,
  Controller,
  Post,
  Put,
  Get,
  Session,
  UseGuards,
  Req,
  UseFilters,
  UseInterceptors,
  ClassSerializerInterceptor
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'

import { RegisterUserDto } from '@/modules/users/dtos/register-user.dto'
import { SignInUserDto } from '@/modules/users/dtos/signin-user.dto'
import { SetUsernameDto } from './dtos/set-username.dto'

import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { VerifyTokenDto } from './dtos/verify-token.dto'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { ApiOperation } from '@nestjs/swagger'

import { User } from '../users/user.entity'
import { IRequestWithUser, ISession } from '@/core/types'
import {
  MissingUsername,
  UsernameExists,
  UserHasUsername,
  UserNotFound
} from '@/core/exceptions'

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new GlobalExceptionFilter())
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Get('42/signIn')
  @UseGuards(AuthGuard('42'))
  @ApiOperation({
    summary: ' h 42',
    operationId: 'fortyTwoAuth',
    description: 'Sign in with 42',
    tags: ['auth']
  })
  async fortyTwoAuth(): Promise<{ msg: string }> {
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
  async fortyTwoAuthCallback(
    @Req() request: IRequestWithUser,
    @Session() session: ISession
  ): Promise<void> {
    if (request.user && request.user.id) {
      if (request.user.isTwoFactorEnabled) {
        session.twoFactorUserId = request.user.id
      } else {
        session.userId = request.user.id
      }
    }
  }

  @Get('/status')
  @ApiOperation({
    summary: 'Get auth status',
    operationId: 'authStatus',
    description: 'Get auth status',
    tags: ['auth']
  })
  async authStatus(@Session() session: ISession): Promise<{ status: string }> {
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
  async createUser(
    @Body() body: RegisterUserDto,
    @Session() session: ISession
  ): Promise<Partial<User>> {
    const { password: bPassword, username: bUsername } = body
    const user = await this.authService.register(bUsername, bPassword)
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
  async signIn(
    @Body() body: SignInUserDto,
    @Session() session: ISession
  ): Promise<User> {
    const user = await this.authService.signIn(body.username, body.password)

    if (user.isTwoFactorEnabled) {
      session.twoFactorUserId = user.id
      return user
    }

    session.userId = user.id
    return user
  }

  @Put('/set-username')
  @ApiOperation({
    summary: 'Set username',
    operationId: 'setUsername',
    description: 'Set user username',
    tags: ['auth']
  })
  async setusername(
    @Body() body: SetUsernameDto,
    @Session() session: ISession
  ): Promise<Partial<User>> {
    const { username } = body
    if (!username) {
      throw new MissingUsername()
    }

    const isUsernameTaken = await this.usersService.findOneByUsername(username)
    if (isUsernameTaken) {
      throw new UsernameExists()
    }

    const user = await this.usersService.findOneById(session.userId)
    if (user.username) {
      throw new UserHasUsername()
    }

    await this.usersService.update(session.userId, {
      username
    })

    return user
  }

  @Get('/2fa')
  @ApiOperation({
    summary: 'Get the 2FA QR Code',
    tags: ['auth']
  })
  async twoFactor(
    @Session() session: ISession
  ): Promise<Record<string, string | boolean>> {
    const user = await this.usersService.findOneByIdWithAuthInfos(
      session.userId
    )
    if (!user) {
      throw new UserNotFound()
    }

    let dataUrl = null
    if (user.isTwoFactorEnabled) {
      dataUrl = await this.authService.buildTwoFactorQrCode(user)
      return { isTwoFactorEnabled: user.isTwoFactorEnabled, dataUrl: dataUrl }
    }
  }
  @Post('/2fa')
  @ApiOperation({
    summary: 'Enable 2FA',
    operationId: 'enableTwoFactor',
    description: 'Enable 2FA',
    tags: ['auth']
  })
  async enableTwoFactor(
    @Session() session: ISession
  ): Promise<Record<string, string | boolean>> {
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
  async verifyToken(
    @Body() body: VerifyTokenDto,
    @Session() session: ISession
  ): Promise<Partial<User>> {
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
  async signOut(@Session() session: ISession): Promise<{ status: string }> {
    session.userId = null
    session.twoFactorUserId = null
    return { status: 'ok' }
  }
}
