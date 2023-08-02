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
        // fix: this line make a bug when the channel messages are not loaded
        channel.messages.push(this.bindRoomToInvite(message))
      } else {
        const newChannel: Channel = await fetcher.get(`/channels/${channelId}`)
        if (newChannel !== null) {
          this.setChannelInfos(loggedUser, newChannel)
          this.channelsList?.data?.push(newChannel as Channel)
        }
      }
    },

    // ****************** //
    // asyncFetchChannels //
    // ****************** //

    async asyncFetchChannels(): Promise<Channel[]> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []

      const response: Channel[] = await fetcher.get(
        `/user/${loggedUser.id}/channels`
      )

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

    async createDmChannel(ownerId: string, receiverId: string): Promise<void> {
      const channelParam = {
        isDm: true,
        ownerId,
        membersIds: [ownerId, receiverId]
      }

      const response: Channel = await fetcher.post(
        `/channels/create`,
        channelParam
      )
      this.setChannelInfos(loggedUser, response)

      this.channelsList?.data?.push(response)

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
      ownerId: string,
      receiversId: string[],
      passwordRequired: boolean,
      password: string | null
    ): Promise<void> {
      const channelParam = {
        isDm: false,
        name: channelName,
        ownerId,
        membersIds: [ownerId, ...receiversId],
        passwordRequired,
        password
      }

      const response: Channel = await fetcher.post(
        `/channels/create`,
        channelParam
      )

      response.messages = []

      this.channelsList?.data?.push(response)

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
        queryFn: fetcher.get(`/user/${loggedUser.id}/channels`),
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
        const channel = this.getChannel()
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

    // ****************** //
    // fetchExistingGroup //
    // ****************** //

    async fetchExistingGroup(channelName: string): Promise<Channel | null> {
      const response = await fetcher.get(`/channels/group/${channelName}`)
      return response
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
        if (response.status === 200) {
          // todo: handle join --> update the local state if necessary
        } else {
          // todo: Handle any errors --> throw an error or return a specific value to be handled by the caller
        }
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
