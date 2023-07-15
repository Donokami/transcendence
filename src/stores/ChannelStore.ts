import { defineStore } from 'pinia'

import fetcher from '@/utils/fetcher'

import type { Channel } from '@/types/Channel'
import type { User } from '@/types/User'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    selectedChannel: null as unknown as Channel | null,
  }),
  actions: {
    
    // *************** //
    // createDmChannel //
    // *************** //

    async createDmChannel(ownerId: string, receiverId: string): Promise<Channel> {
      const channelParam = {
        isDm: true,
        ownerId: ownerId,
        membersIds: [ownerId, receiverId],
      };
      const response: Channel = await fetcher.post(`/channels/create-dm`, channelParam);
      return response
    },
  }
})