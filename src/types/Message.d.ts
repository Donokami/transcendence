import type { User, Channel, Room } from '@/types'
import type { FetcherResponse } from '@/utils/fetcher'

export interface Message {
  // MESSAGE INFORMATIONS INSPIRED BY BACKEND MESSAGE ENTITY
  id: string
  messageBody: string
  channel: Channel
  user: User
  room?: FetcherResponse<Ref<Room>> | null
}
