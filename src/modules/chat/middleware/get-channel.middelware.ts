import { Injectable, NestMiddleware, UseFilters } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'
import { ChannelsService } from '../channels/channels.service'
import { ChannelNotFound } from '@/core/exceptions'
import { Channel } from '../channels/entities/channel.entity'
import { GlobalExceptionFilter } from '@/core/filters/global-exception.filters'
import { IRequestWithChannel } from '@/core/types'
@Injectable()
@UseFilters(new GlobalExceptionFilter())
export class ChannelsMiddleware implements NestMiddleware {
  constructor(private readonly channelsService: ChannelsService) {}
  async use(req: IRequestWithChannel, res: Response, next: NextFunction) {
    const { channelId, name } = req.params

    if (!channelId && !name) return next()

    const channel = channelId
      ? await this.channelsService.findOneById(channelId)
      : await this.channelsService.findOneByName(name)

    if (!channel) {
      throw new ChannelNotFound()
    }

    req.channel = channel

    next()
  }
}
