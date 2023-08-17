import type { User, Channel, Room } from '@/types'

export interface Message {
  id: string
  messageBody: string
  channel: Channel
  user: User
  isInvite: boolean
  room?: Room | null
}
