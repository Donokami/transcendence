import { defineStore } from 'pinia'

import { useUserStore } from './UserStore'

import fetcher, { useFetcher, type FetcherResponse } from '@/utils/fetcher'

import type { Channel, Message, User } from '@/types'
import type { Ref } from 'vue'

export const useChannelStore = defineStore('channels', {
  state: () => {
    return {
      channelsList: undefined as FetcherResponse<Ref<Channel[]>> | undefined,
      selectedChannel: null as string | null
    }
  },
  actions: {
    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(ownerId: string, receiverId: string): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channelParam = {
        isDm: true,
        ownerId,
        membersIds: [ownerId, receiverId]
      }

      const response: Channel = await fetcher.post(
        `/channels/create/dm`,
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
        `/channels/create/group`,
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

    // ******************** //
    // fetchChannelMessages //
    // ******************** //

    async fetchChannelMessages(channelId: string): Promise<void> {
      try {
        const messages = await fetcher.get(`/channels/${channelId}/messages`)
        const channel = this.getChannel()
        console.log('[Message Fetch] channel : ', channel)
        console.log('[Message Fetch] messages : ', messages)

        if (channel != null) channel.messages = messages
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
    },

    async addMessage(message: Message, channelId?: string): Promise<void> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return

      const channel = this.getChannel(channelId)
      if (channel != null) {
        // fix: this line make a bug when the channel messages are not loaded
        channel.messages.push(message)
      } else {
        const newChannel: Channel = await fetcher.get(`/channels/${channelId}`)
        if (newChannel !== null) {
          this.setChannelInfos(loggedUser, newChannel)
          this.channelsList?.data?.push(newChannel as Channel)
        }
      }
    }
  }
})
