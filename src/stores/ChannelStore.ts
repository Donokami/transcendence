import { useRouter } from 'vue-router'
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
    // ******** //
    // addAdmin //
    // ******** //

    async addAdmin(user: User, channelId: string): Promise<void> {
      const channel = this.getChannel(channelId)
      if (!channel) return

      channel.admins.push(user)
    },

    // ********* //
    // addMember //
    // ********* //

    addMember(user: User, channelId: string): void {
      const channel = this.getChannel(channelId)

      if (channel != null) {
        channel.members.push(user)
      }
    },

    // *************** //
    // addBannedMember //
    // *************** //

    addBannedMember(user: User, channelId: string): void {
      const channel = this.getChannel(channelId)

      if (channel != null) {
        if (!channel.bannedMembers) channel.bannedMembers = [] as User[]

        channel.bannedMembers.push(user)
      }
    },

    // ********** //
    // addMessage //
    // ********** //

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

    // ************** //
    // addMutedMember //
    // ************** //

    // addMutedMember(user: User, channelId: string): void {
    //   const channel = this.getChannel(channelId)

    //   if (channel != null) {
    //     channel.mutedMembers.push(user)
    //   }
    // },

    // **************** //
    // addToChannelList //
    // **************** //

    addToChannelList(channel: Channel): void {
      this.channelsList?.push(channel)
    },

    // ********* //
    // banMember //
    // ********* //

    async banMember(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/ban`, { userId })
    },

    // **************** //
    // bindRoomToInvite //
    // **************** //

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

    // ******************* //
    // changeGroupPassword //
    // ******************* //

    async changeGroupPassword(
      channelId: string,
      newPassword: string
    ): Promise<void> {
      await fetcher.put(`/channels/${channelId}/password/change`, {
        newPassword
      })
    },

    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(receiverId: string): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channelParam = {
        type: 'dm',
        membersIds: [loggedUser.id, receiverId]
      }

      await fetcher.post(`/channels/create`, channelParam)
    },

    // ****************** //
    // createGroupChannel //
    // ****************** //

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

    // ******************* //
    // deleteGroupPassword //
    // ******************* //

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

    // ************ //
    // fetchChannel //
    // ************ //

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

    // ******************** //
    // fetchChannelMessages //
    // ******************** //

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

    // **************** //
    // getBannedMembers //
    // **************** //

    async getBannedMembers(channelId: string) {
      const channel = this.getChannel(channelId)

      if (channel != null) {
        const bannedMembers = await fetcher.get(
          `/channels/${channelId}/bannedMembers`
        )

        channel.bannedMembers = bannedMembers
      }
    },

    // ********** //
    // getChannel //
    // ********** //

    getChannel(channelId?: string): Channel | null {
      if (channelId == null) {
        channelId = this.selectedChannel as string
      }

      return (
        this.channelsList?.find((channel) => channel.id === channelId) ?? null
      )
    },

    // ****************** //
    // getChannelMessages //
    // ****************** //

    getChannelMessages(channelId?: string): Message[] {
      const channel = this.getChannel(channelId)
      if (channel != null) {
        return channel.messages
      }
      return []
    },

    // ****** //
    // getDms //
    // ****** //

    getDms(): Channel[] {
      return this.channelsList?.filter((channel) => channel.isDm) ?? []
    },

    // ********* //
    // getGroups //
    // ********* //

    getGroups(): Channel[] {
      return this.channelsList?.filter((channel) => !channel.isDm) ?? []
    },

    // ******* //
    // isAdmin //
    // ******* //

    isAdmin(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel?.admins?.length) return false

      return !!(
        channel.admins.some((user) => user.id === userId) ||
        channel.owner.id === userId
      )
    },

    // ******* //
    // isOwner //
    // ******* //

    isOwner(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel) return false

      return channel.owner.id === userId
    },

    // ******* //
    // isBanned //
    // ******* //

    isBanned(userId: string, channelId: string): boolean {
      const channel = this.getChannel(channelId)
      if (!channel?.bannedMembers?.length) return false

      return !!channel.bannedMembers.some(
        (bannedMember) => bannedMember.id === userId
      )
    },

    // ********* //
    // joinGroup //
    // ********* //

    async joinGroup(channelName: string, password?: string): Promise<void> {
      await fetcher.post(`/channels/group/join`, {
        channelName,
        password
      })
    },

    // ********** //
    // kickMember //
    // ********** //

    async kickMember(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/kick`, { userId })
    },

    // ********** //
    // leaveGroup //
    // ********** //

    async leaveGroup(userId: string, channelId: string): Promise<void> {
      const router = useRouter()
      const toast = useToast()
      await fetcher
        .delete(`/channels/${channelId}/leave`, { userId })
        .then(async () => {
          this.selectedChannel = null
          this.removeFromChannelList(channelId)
          toast.success(`You left the channel`)
          return await router.push('/chat')
        })
    },

    // ********* //
    // makeAdmin //
    // ********* //

    async makeAdmin(userId: string, channelId: string): Promise<void> {
      await fetcher.put(`/channels/${channelId}/set-admin`, { userId })
    },

    // ********** //
    // muteMember //
    // ********** //

    async muteMember(userId: string, channelId: string): Promise<void> {
      try {
        await fetcher.put(`/channels/${channelId}/mute`, { userId })
      } catch (error) {
        console.error(error)
        alert(`Failed to mute user with ID : ${userId}`)
      }
    },

    // ********************* //
    // removeFromChannelList //
    // ********************* //

    removeFromChannelList(channelId: string): void {
      const channel = this.getChannel(channelId)

      if (channel != null) {
        const index = this.channelsList?.indexOf(channel)
        if (index != null) {
          this.channelsList?.splice(index, 1)
        }
      }
    },

    // ****************** //
    // removeBannedMember //
    // ****************** //

    removeBannedMember(userId: string, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      const userIndex = channel.bannedMembers.findIndex(
        (user) => user.id === userId
      )
      if (userIndex === -1) return

      channel.bannedMembers.splice(userIndex, 1)
    },

    // ************ //
    // removeMember //
    // ************ //

    removeMember(userId: string, channelId: string): void {
      const channel = this.getChannel(channelId)
      if (!channel) return

      const userIndex = channel.members.findIndex((user) => user.id === userId)
      if (userIndex === -1) return

      channel.members.splice(userIndex, 1)
    },

    // *********** //
    // revokeAdmin //
    // *********** //

    async revokeAdmin(userId: string, channelId: string): Promise<void> {
      await fetcher.delete(`/channels/${channelId}/unset-admin`, { userId })
    },

    // ************ //
    // removeAdmin //
    // ************ //

    async removeAdmin(userId: string, channelId: string): Promise<void> {
      const channel = this.getChannel(channelId)
      if (!channel) return

      const userIndex = channel.admins.findIndex((user) => user.id === userId)
      if (userIndex === -1) return

      channel.admins.splice(userIndex, 1)
    },

    // *************** //
    // setChannelInfos //
    // *************** //

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
    },

    // *********** //
    // sendMessage //
    // *********** //

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
      } catch (err) {
        if (err instanceof ApiError) {
          if (err.code === 'UserIsMuted') {
            const channel = this.getChannel()

            if (channel != null) {
              channel.isMuted = true
            }
          }
          else if (err.code === 'MessageTooLong') {
            toast.error(`Your message exceed 1000 characters limit`)
          }
        }
        console.error(err)
      }
    },

    // *********** //
    // unbanMember //
    // *********** //

    async unbanMember(userId: string, channelId: string): Promise<void> {
      await fetcher.delete(`/channels/${channelId}/unban`, { userId })
    }
  }
})
