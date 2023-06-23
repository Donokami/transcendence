import { defineStore } from 'pinia'
import type { Channel } from '../types/Channel.js'
import type { User } from '../types/User.js'

export const useChannelStore = defineStore('channels', {
  state: () => ({
    selectedChannel: null as unknown as Channel,
  })
})

// channels: [
//   {
//     name: 'Test Channel #1',
//     members: [] as User[],
//     passwordRequired: false,
//     password: ''
//   },
//   {
//     name: 'Test Channel #2',
//     members: [] as User[],
//     passwordRequired: false,
//     password: ''
//   }
// ]