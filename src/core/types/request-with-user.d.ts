import { Request } from 'express';

import { User } from '@/modules/users/user.entity';

export interface RequestWithUser extends Request {
  user: User;
}
