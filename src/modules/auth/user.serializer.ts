import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { type User } from '../users/user.entity';

@Injectable()
export class UserSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  serializeUser(user: User, done: Function) {
    done(null, user.id);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  async deserializeUser(id: string, done: Function) {
    const user = await this.usersService.findOneById(id);
    return user ? done(null, user) : done(null, null);
  }
}
