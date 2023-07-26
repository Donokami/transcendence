import { defineStore } from 'pinia'

import { useUserStore } from './UserStore'

import fetcher, { useFetcher, type FetcherResponse } from '@/utils/fetcher'

import type { Channel, Message } from '@/types'
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

    async createDmChannel(ownerId: string, receiverId: string) {
      const channelParam = {
        isDm: true,
        ownerId,
        membersIds: [ownerId, receiverId]
      }

      const response: Channel = await fetcher.post(
        `/channels/create/dm`,
        channelParam
      )

      await this.asyncFetchChannels()

      this.channelsList?.data?.push(response) // fix: bug when creating a dm channel, the name is not set

      console.log('New DM channel created ! Id : ', response.id)
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
    ) {
      const channelParam = {
        isDm: false,
        name: channelName,
        ownerId,
        membersIds: [ownerId, ...receiversId],
        passwordRequired,
        password
      }
      const response: Channel = await fetcher.post(
        `/channels/create/channel`,
        channelParam
      )

      await this.asyncFetchChannels()

      this.channelsList?.data?.push(response)
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
        channel.messages = []

        if (channel.isDm) {
          const receiverUser = channel.members.find(
            (user) => user.id !== loggedUser.id
          )

          if (receiverUser != null) {
            channel.name = receiverUser.username
            channel.image = receiverUser.profilePicture
          }

          return channel
        }
      })

      return response
    },

    fetchChannels() {
      const { loggedUser } = useUserStore()
      if (loggedUser == null) return []

      this.channelsList = useFetcher({
        queryFn: fetcher.get(`/user/${loggedUser.id}/channels`),
        onSuccess: (data: Channel[]) => {
          data.forEach((channel: Channel) => {
            channel.messages = []
            if (channel.isDm) {
              const receiverUser = channel.members.find(
                (user) => user.id !== loggedUser.id
              )
              console.log('receiverUser : ', receiverUser)

              if (receiverUser != null) {
                channel.name = receiverUser.username
                channel.image = receiverUser.profilePicture
              }

              console.log('channel : ', channel)

              return channel
            }
          })
        }
      })
    },

    // ****** //
    // getDms //
    // ****** //

    getDms() {
      const channels = this.channelsList?.data?.filter(
        (channel) => channel.isDm
      )
      return channels ?? []
    },

    // **************** //
    // getGroupChannels //
    // **************** //

    getGroupChannels() {
      const channels = this.channelsList?.data?.filter(
        (channel) => !channel.isDm
      )
      return channels ?? []
    },

    // ******************** //
    // fetchChannelMessages //
    // ******************** //

    async fetchChannelMessages(channelId: string) {
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

    getChannelMessages(channelId?: string) {
      const channel = this.getChannel(channelId)
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

    addMessage(message: Message, channelId?: string) {
      console.log('message : ', message)
      const channel = this.getChannel(channelId)
      if (channel != null) {
        // fix: this line make a bug when the channel messages are not loaded
        channel.messages.push(message)
      } else {
        // fix: when a new dm is created, the channel is not in the channelsList
        // create a function to fetch a channel by id
      }
      console.log('channel : ', channel)
    }
  }
})
