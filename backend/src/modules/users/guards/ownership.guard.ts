import {
  type CanActivate,
  type ExecutionContext,
  Injectable
} from '@nestjs/common'

import { type IRequestWithUser } from '@/core/types/request-with-user'

import { UsersService } from '../users.service'

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) { }

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<IRequestWithUser>()
    const userId = req.params.id

    const user = await this.usersService.findOneById(userId)

    if (user.id === req.params.id) {
      return true
    }

    return false
  }
}
