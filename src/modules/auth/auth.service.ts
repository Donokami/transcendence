import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { promisify } from 'util';
import { randomBytes, scrypt as _scrypt } from 'crypto';

import { UsersService } from '@/modules/users/users.service';
import { UserDetails } from './utils/types';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

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

  // ******** //
  // register //
  // ******** //

  async register(email: string, password: string, username: string) {
    const users = await this.usersService.findOneByEmail(email);
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
