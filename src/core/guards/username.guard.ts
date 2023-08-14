import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

@Injectable()
export class UsernameGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const userId = req.session.userId

    const user = await this.usersService.findOneById(userId)
    if (!user) {
      return true
    }

    if (!user.username) {
      throw new UnauthorizedException(
        'You are not authorized to access this resource'
      )
    }

    return true
  }
}
