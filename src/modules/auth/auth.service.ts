import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UserDetails } from './utils/types';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(details: UserDetails) {
    const [user] = await this.usersService.find(details.email);
    if (!user) {
      const newUser = await this.usersService.createOauth(details);
      return newUser;
    }
    return user;
  }

  async enableTwoFactor(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const secret = authenticator.generateSecret();
    user.twoFactorSecret = secret;
    user.isTwoFactorEnabled = true;
    await this.usersService.update(user.id, user);

    const otpauth = authenticator.keyuri(user.email, 'Transcendence', secret);
    const dataUrl = await qrcode.toDataURL(otpauth);

    return dataUrl;
  }

  async verifyTwoFactorToken(userId: string, token: string) {
    const user = await this.usersService.findOne(userId);
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

  async register(email: string, password: string, username: string) {
    const users = await this.usersService.find(email);
    if (users.length) {
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

  async signIn(email: string, password: string) {
    const [user] = await this.usersService.find(email);
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
