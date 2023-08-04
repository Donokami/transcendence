import { User } from '@/modules/users/user.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Channel } from './channel.entity'

@Entity()
export class MutedUser {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => Channel, (channel: Channel) => channel.mutedMembers)
  channel: Channel

  @ManyToOne(() => User, (user: User) => user.mutedChannels)
  user: User

  @Column()
  muteEndDate: Date
}
