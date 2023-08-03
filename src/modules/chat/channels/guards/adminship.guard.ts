import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  Logger
} from '@nestjs/common'

import { ChannelsService } from '@/modules/chat/channels/channels.service'

@Injectable()
export class AdminshipGuard implements CanActivate {
  private readonly logger = new Logger(AdminshipGuard.name)

  constructor(private readonly channelService: ChannelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const userId = request.session.userId
    const channelId = request.params.channelId

    const channel = await this.channelService.findOneById(channelId)
    if (!channel) {
      this.logger.warn(`Channel with ID : ${channelId} not found`)
      return false
    }

    if (!channel.admins.find((admin) => userId === admin.id)) {
      this.logger.warn(
        `User with ID : ${userId} is not an admin of channel with ID : ${channelId}`
      )
      return false
    }

    return true
  }
}
