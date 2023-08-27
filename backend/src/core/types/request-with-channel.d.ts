import { type Request } from 'express'

import { type Channel } from '@/modules/chat/channels/entities/channel.entity'

export interface IRequestWithChannel extends Request {
  channel: Channel
}
