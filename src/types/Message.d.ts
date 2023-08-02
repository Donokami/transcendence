import type { User } from './User'
import type { Channel } from './Channel'
import type { FetcherResponse } from '@/utils/fetcher'
import type { Room } from './Room'

export interface Message {
  // MESSAGE INFORMATIONS INSPIRED BY BACKEND MESSAGE ENTITY
  id: string
  messageBody: string
  channel: Channel
  user: User,
  room?: FetcherResponse<Ref<Room>> | null
}
