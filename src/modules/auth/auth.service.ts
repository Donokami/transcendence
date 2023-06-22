import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UserDetails } from './utils/types';

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
