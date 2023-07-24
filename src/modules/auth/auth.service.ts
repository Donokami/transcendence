import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'

import * as qrcode from 'qrcode'
import { authenticator } from 'otplib'
import { promisify } from 'util'
import { randomBytes, scrypt as _scrypt } from 'crypto'

import { UsersService } from '@/modules/users/users.service'
import { type IUserDetails } from '@/core/types/user-details'
import { QueryFailedError } from 'typeorm'
import {
  InvalidPassword,
  InvalidTwoFaToken,
  TwoFaDisabled,
  UserNotFound
} from '@/core/exceptions'

const scrypt = promisify(_scrypt)

@Injectable()
export class AuthService {
  // *********** //
  // CONSTRUCTOR //
  // *********** //

  constructor(private readonly usersService: UsersService) { }

  // ****** //
  // LOGGER //
  // ****** //

  private logger = new Logger(AuthService.name)

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // ************ //
  // validateUser //
  // ************ //

  async validateUser(details: IUserDetails) {
    const user = await this.usersService.findOneByEmailWithAuthInfos(
      details.email
    )
    if (!user) {
      const newUser = await this.usersService.createOauth(details)
      return newUser
    }
    return user
  }

  // *************** //
  // toggleTwoFactor //
  // *************** //

  async toggleTwoFactor(userId: string) {
    const user = await this.usersService.findOneByIdWithAuthInfos(userId)

    if (user.isTwoFactorEnabled) {
      user.isTwoFactorEnabled = false
      user.twoFactorSecret = null
      await this.usersService.update(user.id, user)

      return { isTwoFactorEnabled: false }
    } else {
      const secret = authenticator.generateSecret()
      user.twoFactorSecret = secret
      user.isTwoFactorEnabled = true
      await this.usersService.update(user.id, user)

      const otpauth = authenticator.keyuri(user.email, 'YourService', secret)
      const dataUrl = await qrcode.toDataURL(otpauth)

      return { isTwoFactorEnabled: true, dataUrl }
    }
  }

  // ******************** //
  // verifyTwoFactorToken //
  // ******************** //

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findOneById(userId)
    if (!user) {
      throw new UserNotFound()
    }
    if (!user.isTwoFactorEnabled) {
      this.logger.warn('2FA is disabled')
      throw new TwoFaDisabled()
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret
    })

    if (!isValid) {
      this.logger.warn('Invalid 2FA token')
      throw new InvalidTwoFaToken()
    }

    return user
  }

  // ******** //
  // register //
  // ******** //

  async register(email: string, password: string, username: string) {
    const salt = randomBytes(8).toString('hex')
    const hash = (await scrypt(password, salt, 32)) as Buffer
    const hashedPassword = salt + '.' + hash.toString('hex')

    const newUser = await this.usersService.create(
      email,
      hashedPassword,
      username
    )
    return newUser
  }

  // ****** //
  // signIn //
  // ****** //

  async signIn(email: string, password: string) {
    const user = await this.usersService.findOneByEmailWithAuthInfos(email)
    if (!user) {
      this.logger.warn('User not found')
      throw new UserNotFound()
    }

    const [salt, storedHash] = user.password.split('.')

    const hash = (await scrypt(password, salt, 32)) as Buffer

    if (storedHash !== hash.toString('hex')) {
      this.logger.warn('Bad password')
      throw new InvalidPassword()
    }

    return user
  }
}
