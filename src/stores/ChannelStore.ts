import { defineStore } from 'pinia'

import { useUserStore } from './UserStore'

import fetcher from '@/utils/fetcher'

import type { Channel } from '@/types/Channel'
import type { Message } from '@/types/Message'
import type { User } from '@/types/user'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    channelsList: [] as unknown as Promise<Channel[]>,
    selectedChannel: null as unknown as Channel
  }),
  actions: {
    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(
      ownerId: string,
      receiverId: string
    ): Promise<Channel | null> {
      const channelParam = {
        isDm: true,
        ownerId,
        membersIds: [ownerId, receiverId]
      }

      try {
        const response: Channel = await fetcher.post(
          `/channels/create/dm`,
          channelParam
        )

        this.channelsList.push(response) // fix: not working

        console.log('New DM channel created ! Id : ', response.id)
        console.log(
          'New DM channel pushed to channelsList in store : ',
          this.channelsList
        )
        return response
      } catch (error) {
        console.error(error)
        return null
      }
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
    ): Promise<Channel | null> {
      const channelParam = {
        isDm: false,
        name: channelName,
        ownerId,
        membersIds: [ownerId, ...receiversId],
        passwordRequired,
        password
      }
      try {
        const response: Channel = await fetcher.post(
          `/channels/create/channel`,
          channelParam
        )

        this.channelsList.push(response) // fix: not working

        console.log('New group channel created ! Id : ', response.id)
        console.log(
          'New group channel pushed to channelsList in store : ',
          this.channelsList
        )

        return response
      } catch (error) {
        console.error(error)
        return null
      }
    },

    // ************* //
    // fetchChannels //
    // ************* //

    async fetchChannels(): Promise<Channel[]> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []
      try {
        this.channelsList = fetcher.get(`/user/${loggedUser.id}/channels`)
        const response = await this.channelsList
        return response
      } catch (error) {
        console.error(error)
        return []
      }
    },

    async getChannels(): Promise<Channel[]> {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []
      const channels = await this.channelsList

      const response = await this.channelsList
      channels.map((channel: Channel) => {
        if (channel.isDm) {
          const receiverUser = channel.members[0]
          console.log('receiverUser : ', receiverUser)
          if (receiverUser === undefined) channel.name

          if (receiverUser != null) {
            channel.name = 'ta mere la query' // todo: needs an obvious fix (see backend)
            channel.image = receiverUser.profilePicture
          }
        }
        return channel
      })
      console.log('response : ', response)

      return response
    },

    // ****** //
    // getDms //
    // ****** //

    async getDms(): Promise<Channel[]> {
      const channels = await this.getChannels()
      console.log('channels : ', channels)
      return channels.filter((channel) => channel.isDm)
    },

    // **************** //
    // getGroupChannels //
    // **************** //

    async getGroupChannels(): Promise<Channel[]> {
      const channels = await this.getChannels()
      return channels.filter((channel) => !channel.isDm)
    },

    // ******************** //
    // fetchChannelMessages //
    // ******************** //

    async fetchChannelMessages() {
      try {
        const response: Message[] = await fetcher.get(
          `/id/${this.selectedChannel?.id}/messages`
        )
        this.selectedChannel.messages = response
        const channel = this.getChannel()
        if (channel != null) channel.messages = response
      } catch (error) {
        console.error(error)
      }
    },

    // *********** //
    // fetchDmList //
    // *********** //

    // async fetchDmList(id: string): Promise<Channel[]> {
    //   const { loggedUser } = useUserStore()
    //   const response: Channel[] = await fetcher.get(`/channels/${id}/dm-list`)

    //   response.forEach((channel: Channel) => {
    //     channel.receiver = channel.members.filter((user: User) => {
    //       if (!loggedUser) {
    //         return false
    //       }
    //       return user.id !== loggedUser.id
    //     })[0]
    //   })

    //   return response
    // },

    // ********************** //
    // fetchGroupChannelsList //
    // ********************** //

    // async fetchGroupChannelsList(id: string): Promise<Channel[]> {
    //   const response: Channel[] = await fetcher.get(
    //     `/channels/${id}/group-channels-list`
    //   )

    //   return response
    // },

    // ********** //
    // getChannel //
    // ********** //

    async getChannel(channelId?: string): Channel | undefined {
      if (!channelId) {
        channelId = this.selectedChannel.id
      }
      const channels = await this.getChannels()
      return channels.find((channel) => channel.id === channelId)
    },

    // ****************** //
    // getChannelMessages //
    // ****************** //

    getChannelMessages() {
      const channel = this.getChannel()
      if (channel != null) {
        return channel.messages
      }
    },

    // ************* //
    // refreshDmList //
    // ************* //

    // async refreshDmList() {
    //   const { loggedUser } = useUserStore()
    //   if (!loggedUser) {
    //     return []
    //   }
    //   try {
    //     const response = await this.fetchDmList(loggedUser.id)
    //     this.dmList = response
    //     console.log(`[UserStore] - dmList : `, this.dmList)
    //   } catch (error) {
    //     console.error(`[UserStore] - Failed to fetch DMs! Error: `, error)
    //   }
    // },

    // ************************ //
    // refreshGroupChannelsList //
    // ************************ //

    // async refreshGroupChannelsList() {
    //   const { loggedUser } = useUserStore()
    //   if (!loggedUser) {
    //     return []
    //   }
    //   try {
    //     const response = await this.fetchGroupChannelsList(loggedUser.id)
    //     this.groupChannelsList = response
    //     console.log(
    //       `[UserStore] - groupChannelsList : `,
    //       this.groupChannelsList
    //     )
    //   } catch (error) {
    //     console.error(
    //       `[UserStore] - Failed to fetch group channels ! Error: `,
    //       error
    //     )
    //   }
    // },

    // *********** //
    // sendMessage //
    // *********** //

    async sendMessage(message: string) {
      const { loggedUser } = useUserStore()
      try {
        await fetcher.post(`/channels/${this.selectedChannel.id}/messages`, {
          userId: loggedUser?.id,
          messageBody: message,
          date: new Date()
        })
      } catch (error) {
        console.error(error)
      }
    },

    async addMessage(message: Message) {
      const channel = await this.getChannel()
      this.selectedChannel.messages.push(message)
      console.log('channel : ', channel)
    }
  }
})
