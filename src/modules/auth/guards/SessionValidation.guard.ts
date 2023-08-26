import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'

import { UsersService } from '@/modules/users/users.service'

@Injectable()
export class SessionValidationGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()

    const userId = req.session.userId
    if (!userId) return true

    const user = await this.usersService.findOneById(userId)
    if (!user) {
      req.session.userId = null
    }

    return true
  }
}
