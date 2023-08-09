import { defineStore } from 'pinia'

import { useUserStore } from './UserStore'

import fetcher, { useFetcher, type FetcherResponse } from '@/utils/fetcher'

import type { Channel, Message, User } from '@/types'
import type { Ref } from 'vue'

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

export const useChannelStore = defineStore('channels', {
  state: () => {
    return {
      channelsList: undefined as FetcherResponse<Ref<Channel[]>> | undefined,
      selectedChannel: null as string | null
    }
  },
  actions: {
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
        channel.messages.push(this.bindRoomToInvite(message))
        if (this.selectedChannel !== channel.id) {
          channel.unreadMessages++
        }
      } else {
        const newChannel: Channel = await fetcher.get(
          `/channels/${channelId as string}`
        )
        if (newChannel !== null) {
          this.setChannelInfos(loggedUser, newChannel)
          this.channelsList?.data?.push(newChannel)

          if (this.selectedChannel !== newChannel.id) {
            newChannel.unreadMessages++
          }
        }
      }
    },

    // ****************** //
    // asyncFetchChannels //
    // ****************** //

    async asyncFetchChannels(): Promise<Channel[]> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []

      const response: Channel[] = await fetcher.get(`/user/me/channels`)

      response.forEach((channel: Channel) => {
        this.setChannelInfos(loggedUser, channel)
        return channel
      })

      return response
    },

    // ********* //
    // banMember //
    // ********* //

    async banMember(userId: string, channelId: string): Promise<void> {
      try {
        await fetcher.put(`/channels/${channelId}/ban`, { userId })
        console.log(`User with ID : ${userId} successfully banned from channel`)
      } catch (error) {
        console.error(error)
        alert(`Failed to ban user with ID : ${userId}`)
      }
    },

    // **************** //
    // bindRoomToInvite //
    // **************** //

    bindRoomToInvite(message: Message) {
      const newMessage = message
      try {
        const urlRoom = parseUrl(message)
        if (urlRoom !== null) {
          console.log('url : ', urlRoom)

          newMessage.room = useFetcher({
            queryFn: fetcher.get(`/games/${urlRoom.roomId}`)
          })
        }
      } catch (_) {
        newMessage.room = null
      }
      return newMessage
    },

    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(receiverId: string): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channelParam = {
        isDm: true,
        membersIds: [loggedUser.id, receiverId]
      }

      const response: Channel = await fetcher.post(
        `/channels/create`,
        channelParam
      )

      console.log('New DM channel created ! ID : ', response.id)
      console.log(
        'New DM channel pushed to channelsList in store : ',
        this.channelsList
      )
    },

    // ****************** //
    // createGroupChannel //
    // ****************** //

    async createGroupChannel(
      channelName: string,
      receiversId: string[],
      password: string | null
    ): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channelParam = {
        isDm: false,
        name: channelName,
        membersIds: [loggedUser.id, ...receiversId],
        password
      }

      const response: Channel = await fetcher.post(
        `/channels/create`,
        channelParam
      )

      console.log('New group channel created ! ID : ', response.id)
      console.log(
        'New group channel pushed to channelsList in store : ',
        this.channelsList
      )
    },

    // ************* //
    // fetchChannels //
    // ************* //

    fetchChannels() {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      this.channelsList = useFetcher({
        queryFn: fetcher.get(`/user/me/channels`),
        onSuccess: (data: Channel[]) => {
          data.forEach((channel: Channel) => {
            this.setChannelInfos(loggedUser, channel)
            return channel
          })
        }
      })
    },

    // ******************** //
    // fetchChannelMessages //
    // ******************** //

    async fetchChannelMessages(channelId: string): Promise<void> {
      try {
        const messages = await fetcher.get(`/channels/${channelId}/messages`)
        const channel = this.getChannel(channelId)
        console.log('[Message Fetch] channel : ', channel)
        console.log('[Message Fetch] messages : ', messages)

        const messageFetch = messages.map((message: Message) => {
          return this.bindRoomToInvite(message)
        })

        console.log('[Message Fetch] messages after parsing : ', messageFetch)

        if (channel != null) channel.messages = messageFetch
      } catch (error) {
        console.error(error)
      }
    },

    // ********** //
    // getChannel //
    // ********** //

    getChannel(channelId?: string): Channel | undefined {
      if (channelId == null) {
        channelId = this.selectedChannel as string
      }

      return this.channelsList?.data?.find(
        (channel) => channel.id === channelId
      )
    },

    // ****************** //
    // getChannelMessages //
    // ****************** //

    getChannelMessages(channelId?: string): Message[] | undefined {
      const channel = this.getChannel(channelId)
      if (channel != null) {
        return channel.messages
      }
    },

    // ****** //
    // getDms //
    // ****** //

    getDms(): Channel[] {
      const channels = this.channelsList?.data?.filter(
        (channel) => channel.isDm
      )
      return channels ?? []
    },

    // ********* //
    // getGroups //
    // ********* //

    getGroups(): Channel[] {
      const channels = this.channelsList?.data?.filter(
        (channel) => !channel.isDm
      )
      return channels ?? []
    },

    // *************** //
    // giveAdminRights //
    // *************** //

    async giveAdminRights(userId: string, channelId: string): Promise<void> {
      try {
        await fetcher.put(`/channels/${channelId}/admins`, { userId })
        console.log(`User with ID : ${userId} successfully promoted to admin`)
      } catch (error) {
        console.error(error)
        alert(`Failed to promote user with ID : ${userId} as admin`)
      }
    },

    // ********* //
    // joinGroup //
    // ********* //

    async joinGroup(channelName: string, password?: string): Promise<void> {
      try {
        const response = await fetcher.post(`/channels/group/join`, {
          channelName,
          password
        })

        console.log(response)
      } catch (error) {
        console.error(`Failed to join ${channelName} channel`, error)
        throw error
      }
    },

    // ********** //
    // kickMember //
    // ********** //

    async kickMember(userId: string, channelId: string): Promise<void> {
      try {
        await fetcher.put(`/channels/${channelId}/kick`, { userId })
        console.log(`User with ID : ${userId} successfully kicked from channel`)
      } catch (error) {
        console.error(error)
        alert(`Failed to kick user with ID : ${userId}`)
      }
    },

    // ********** //
    // muteMember //
    // ********** //

    async muteMember(userId: string, channelId: string): Promise<void> {
      try {
        await fetcher.put(`/channels/${channelId}/mute`, { userId })
        console.log(`User with ID : ${userId} successfully muted`)
      } catch (error) {
        console.error(error)
        alert(`Failed to mute user with ID : ${userId}`)
      }
    },

    // *************** //
    // setChannelInfos //
    // *************** //

    setChannelInfos(loggedUser: User, channel: Channel): void {
      channel.messages = []

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
      if (loggedUser == null || this.selectedChannel == null) return
      try {
        await fetcher.post(`/channels/${this.selectedChannel}/messages`, {
          userId: loggedUser?.id,
          messageBody: message,
          date: new Date()
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
})
