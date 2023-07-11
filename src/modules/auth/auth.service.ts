import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as qrcode from 'qrcode';
import { authenticator } from 'otplib';
import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';

import { UsersService } from '@/modules/users/users.service';
import { type UserDetails } from '@/core/types/user-details';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  // ************ //
  // validateUser //
  // ************ //

  async validateUser(details: UserDetails) {
    const [user] = await this.usersService.findOneByEmail(details.email);
    if (!user) {
      const newUser = await this.usersService.createOauth(details);
      return newUser;
    }
    return user;
  }

  // *************** //
  // toggleTwoFactor //
  // *************** //

  async toggleTwoFactor(userId: string) {
    const user = await this.usersService.findOneById(userId);

    if (user.isTwoFactorEnabled) {
      user.isTwoFactorEnabled = false;
      user.twoFactorSecret = null;
      await this.usersService.update(user.id, user);

      return { isTwoFactorEnabled: false };
    } else {
      const secret = authenticator.generateSecret();
      user.twoFactorSecret = secret;
      user.isTwoFactorEnabled = true;
      await this.usersService.update(user.id, user);

      const otpauth = authenticator.keyuri(user.email, 'YourService', secret);
      const dataUrl = await qrcode.toDataURL(otpauth);

      return { isTwoFactorEnabled: true, dataUrl };
    }
  }

  // ******************** //
  // verifyTwoFactorToken //
  // ******************** //

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.isTwoFactorEnabled) {
      throw new UnauthorizedException('Invalid user or 2FA not enabled');
    }

    const isValid = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  // ******** //
  // register //
  // ******** //

  async register(email: string, password: string, username: string) {
    const users = await this.usersService.findOneByEmail(email);
    if (users.length > 0) {
      throw new BadRequestException('Email already in use');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const hashedPassword = salt + '.' + hash.toString('hex');

    const user = await this.usersService.create(
      email,
      hashedPassword,
      username,
    );

    return user;
  }

  // ****** //
  // signIn //
  // ****** //

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('Bad password');
    }

    return user;
  }
}
