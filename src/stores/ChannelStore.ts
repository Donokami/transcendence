import { useToast } from 'vue-toastification'

import { defineStore } from 'pinia'

import { useUserStore } from '@/stores/UserStore'
import type { Channel, Message, User } from '@/types'
import fetcher, { ApiError } from '@/utils/fetcher'

function parseUrl(message: Message): {
  roomId: string
  url: URL
} | null {
  try {
    const url = new URL(message.messageBody)

    if (
      url.pathname.search('room/') > 0 &&
      url.origin === import.meta.env.VITE_APP_URL
    ) {
      const roomId = url.pathname.split('/')[2]
      if (!roomId) return null
      return { roomId, url }
    }
    return null
  } catch {
    return null
  }
}

interface State {
  channelsList: Channel[] | null
  selectedChannel: string | null
}

export const useChannelStore = defineStore('channels', {
  state: (): State => {
    return {
      channelsList: null,
      selectedChannel: null
    }
  },
  actions: {
    async addMessage(message: Message, channelId?: string): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channel = this.getChannel(channelId)
      if (channel != null) {
        if (channel.messages.length === 0) {
          await this.fetchChannelMessages(channel.id)
          if (this.selectedChannel !== channel.id) {
            channel.unreadMessages++
          }
          return
        }
        channel.messages.push(await this.bindRoomToInvite(message))
        if (this.selectedChannel !== channel.id) {
          channel.unreadMessages++
        }
      } else {
        const newChannel: Channel = await fetcher.get(
          `/channels/${channelId as string}`
        )
        if (newChannel !== null) {
          this.setChannelInfos(loggedUser, newChannel)
          this.addToChannelList(newChannel)

          if (this.selectedChannel !== newChannel.id) {
            newChannel.unreadMessages++
          }
        }
      }
    },

    async banMember(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/ban`, { userId })
    },

    async bindRoomToInvite(message: Message) {
      message.isInvite = false
      const newMessage = message
      try {
        const urlRoom = parseUrl(message)
        if (urlRoom !== null) {
          newMessage.isInvite = true
          newMessage.room = await fetcher.get(`/games/${urlRoom.roomId}`)
        }
      } catch (_) {
        newMessage.room = null
      }
      return newMessage
    },

    async changeGroupPassword(
      channelId: string,
      newPassword: string
    ): Promise<void> {
      await fetcher.put(`/channels/${channelId}/password/change`, {
        newPassword
      })
    },
    
    async checkIsMuted(
      channelId: string,
    ): Promise<boolean> {
      return await fetcher.get(`/channels/${channelId}/isMuted`)
    },

    async createDmChannel(receiverId: string): Promise<Channel | undefined> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channelParam = {
        type: 'dm',
        membersIds: [loggedUser.id, receiverId]
      }

      const response: Channel = await fetcher.post(
        `/channels/create`,
        channelParam
      )

      return response
    },

    async createGroupChannel(
      channelName: string,
      receiversId: string[],
      password: string | null,
      isPrivate: boolean
    ): Promise<Channel> {
      const { loggedUser } = useUserStore()

      const response: Channel = await fetcher.post(`/channels/create`, {
        name: channelName,
        type: (() => {
          if (isPrivate) return 'private'
          if (password) return 'protected'
          return 'public'
        })(),
        membersIds: [loggedUser?.id, ...receiversId],
        password
      })

      return response
    },

    async deleteGroupPassword(channelId: string): Promise<void> {
      await fetcher.delete(`/channels/${channelId}/password/delete`)
    },

    async fetchChannels(): Promise<Channel[]> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []

      const response: Channel[] = await fetcher.get(`/user/me/channels`)

      response.forEach((channel: Channel) => {
        this.setChannelInfos(loggedUser, channel)
        return channel
      })

      return response
    },

    async fetchChannel(channelId: string) {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channel = await fetcher.get(`/channels/${channelId}`)
      if (channel != null) {
        this.setChannelInfos(loggedUser, channel)
        this.addToChannelList(channel)
        await this.fetchChannelMessages(channelId)
      }
    },

    async fetchChannelMessages(channelId: string): Promise<void> {
      const messages = await fetcher.get(`/channels/${channelId}/messages`)
      const channel = this.getChannel(channelId)

      if (channel != null) {
        const messageFetch = messages.map(
          async (message: Message) => await this.bindRoomToInvite(message)
        )
        channel.messages = await Promise.all(messageFetch)
      }
    },

    async fetchAdmins(channelId: string): Promise<User[]> {
      const channel = this.getChannel(channelId)
      if (!channel) return []

      channel.admins = await fetcher.get(`/channels/${channelId}/admins`)

      return channel.admins
    },

    async fetchBannedMembers(channelId: string): Promise<User[]> {
      const channel = this.getChannel(channelId)
      if (!channel) return []

      channel.bannedMembers = await fetcher.get(
        `/channels/${channelId}/bannedMembers`
      )

      return channel.bannedMembers
    },

    async fetchOwner(channelId: string): Promise<User> {
      const channel = this.getChannel(channelId)
      if (!channel) return null as unknown as User

      channel.owner = await fetcher.get(`/channels/${channelId}/owner`)

      return channel.owner
    },

    async joinGroup(channelName: string, password?: string): Promise<Channel> {
      const channel: Channel = await fetcher.post(`/channels/group/join`, {
        channelName,
        password
      })

      const { loggedUser } = useUserStore()
      if (loggedUser == null) return channel

      await this.fetchChannel(channel.id)
      this.selectedChannel = channel.id

      this.addMember(loggedUser, channel.id)

      const toast = useToast()
      toast.success(`You joined ${channel.name} channel`)

      return channel
    },

    async kickMember(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/kick`, { userId })
    },

    async leaveGroup(userId: string, channelId: string): Promise<Channel> {
      const channel: Channel = await fetcher.delete(
        `/channels/${channelId}/leave`,
        { userId }
      )

      const { loggedUser } = useUserStore()
      if (loggedUser == null) return channel

      this.removeMember(loggedUser.id, channel.id)
      this.removeAdmin(loggedUser.id, channel.id)

      this.channelsList = await this.fetchChannels()
      this.selectedChannel = null

      const toast = useToast()
      toast.success(`You left ${channel.name} channel`)

      return channel
    },

    async makeAdmin(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/set-admin`, { userId })
    },

    async muteMember(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/mute`, { userId })
    },

    async revokeAdmin(userId: string, channelId: string): Promise<void> {
      await fetcher.delete(`/channels/${channelId}/unset-admin`, { userId })
    },

    async sendMessage(message: string): Promise<void> {
      const { loggedUser } = useUserStore()
      const toast = useToast()
      if (loggedUser == null || this.selectedChannel == null) return
      try {
        await fetcher.post(`/channels/${this.selectedChannel}/messages`, {
          userId: loggedUser?.id,
          messageBody: message,
          date: new Date()
        })
      } catch (err: any) {
        if (err instanceof ApiError) {
          if (err.code === 'UserIsMuted') {
            const channel = this.getChannel()

            if (channel != null) {
              channel.isMuted = true
            }
            toast.error(`You are muted for 30 seconds`)
          } else if (err.code === 'MessageTooLong') {
            toast.error(`Your message exceed 1000 characters limit`)
          }
        } else {
          toast.error('something went wrong')
        }
      }
    },

    async unbanMember(userId: string, channelId: string): Promise<void> {
      await fetcher.delete(`/channels/${channelId}/unban`, { userId })
    },

    addAdmin(user: User, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.admins) channel.admins = [] as User[]

      channel.admins.push(user)
    },

    addMember(user: User, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.members) channel.members = [] as User[]

      if (channel.members.some((member) => member.id === user.id)) return

      channel.members.push(user)
    },

    addBannedMember(user: User, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.bannedMembers) channel.bannedMembers = [] as User[]

      channel.bannedMembers.push(user)
    },

    addToChannelList(channel: Channel): void {
      this.channelsList?.push(channel)
    },

    getChannel(channelId?: string): Channel | null {
      if (channelId == null) {
        channelId = this.selectedChannel as string
      }

      return (
        this.channelsList?.find((channel) => channel.id === channelId) ?? null
      )
    },

    getChannelMessages(channelId?: string): Message[] {
      const channel = this.getChannel(channelId)
      if (channel != null) {
        return channel.messages
      }
      return []
    },

    getDms(): Channel[] {
      return this.channelsList?.filter((channel) => channel.isDm) ?? []
    },

    getGroups(): Channel[] {
      return this.channelsList?.filter((channel) => !channel.isDm) ?? []
    },

    isAdmin(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel) return false

      if (!channel?.admins?.length) return false

      return !!(
        channel.admins.some((user) => user.id === userId) ||
        channel.owner.id === userId
      )
    },

    isBanned(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel) return false

      if (!channel?.bannedMembers?.length) return false

      return !!channel.bannedMembers.some(
        (bannedMember) => bannedMember.id === userId
      )
    },

    isMember(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel) return false

      if (!channel?.members?.length) return false

      return !!channel.members.some((user) => user.id === userId)
    },

    isOwner(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel) return false

      return channel.owner.id === userId
    },

    removeAdmin(userId: string, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.admins) return

      const userIndex = channel.admins?.findIndex((user) => user.id === userId)
      if (userIndex === -1) return

      channel.admins.splice(userIndex, 1)
    },

    removeFromChannelList(channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!this.channelsList) return

      const index = this.channelsList?.indexOf(channel)
      if (!index) return

      this.channelsList?.splice(index, 1)
    },

    removeBannedMember(userId: string, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.bannedMembers) return

      const userIndex = channel.bannedMembers?.findIndex(
        (user) => user.id === userId
      )
      if (userIndex === -1) return

      channel.bannedMembers.splice(userIndex, 1)
    },

    removeMember(userId: string, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      if (!channel.members) return

      const userIndex = channel.members?.findIndex((user) => user.id === userId)
      if (userIndex === -1) return

      channel.members.splice(userIndex, 1)
    },

    setChannelInfos(loggedUser: User, channel: Channel): void {
      channel.messages = []
      channel.bannedMembers = []
      channel.isDm = channel.type === 'dm'

      if (channel.isDm) {
        const receiverUser = channel.members.find(
          (user) => user.id !== loggedUser.id
        )
        if (receiverUser != null) {
          channel.name = receiverUser.username
          channel.image = receiverUser.profilePicture
          channel.dmUser = receiverUser
          channel.unreadMessages = 0
        }
      }
    }
  }
})
