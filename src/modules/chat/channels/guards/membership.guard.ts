import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

import { User } from '@/modules/users/user.entity'

@Injectable()
export class MembershipGuard implements CanActivate {
  private readonly logger = new Logger(MembershipGuard.name)

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const userId = request.session.userId

    if (!request.channel.members.find((member: User) => userId === member.id)) {
      this.logger.warn(
        `User with ID : ${userId} is not a member of channel with ID: ${request.channel.id}`
      )
      return false
    }

    return true
  }
}
