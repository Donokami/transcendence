import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

import { ChannelsService } from '@/modules/chat/channels/channels.service'
import { User } from '@/modules/users/user.entity'

@Injectable()
export class AdminshipGuard implements CanActivate {
  private readonly logger = new Logger(AdminshipGuard.name)

  constructor(private readonly channelService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const userId = request.session.userId
    const { channel } = request

    if (userId === channel.owner.id) {
      return true
    }

    if (!channel.admins.find((admin: User) => userId === admin.id)) {
      this.logger.warn(
        `User with ID : ${userId} is not an admin of channel with ID : ${channel.id}`
      )
      return false
    }

    return true
  }
}
