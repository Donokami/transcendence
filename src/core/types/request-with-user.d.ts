import { type Request } from 'express';

import { type User } from '@/modules/users/user.entity';

export interface IRequestWithUser extends Request {
  user: User;
}
