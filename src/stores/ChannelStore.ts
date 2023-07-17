import { defineStore } from 'pinia'

import fetcher from '@/utils/fetcher'

import type { Channel } from '@/types/Channel'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    selectedChannel: null as unknown as Channel | null
  }),
  actions: {
    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(
      ownerId: string,
      receiverId: string
    ): Promise<Channel> {
      const channelParam = {
        isDm: true,
        ownerId: ownerId,
        membersIds: [ownerId, receiverId]
      }
      const response: Channel = await fetcher.post(
        `/channels/create-dm`,
        channelParam
      )
      return response
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
    ): Promise<Channel> {
      const channelParam = {
        isDm: false,
        channelName,
        ownerId,
        membersIds: [ownerId, ...receiversId],
        passwordRequired,
        password
      }
      const response: Channel = await fetcher.post(
        `/channels/create-group-channel`,
        channelParam
      )
      return response
    }
  }
})
