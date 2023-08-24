import { defineStore } from 'pinia'

import type { User, Friendship, Paginated } from '@/types'
import fetcher, { ApiError } from '../utils/fetcher'
import { useChannelStore } from './ChannelStore'
import { useToast } from 'vue-toastification'

// interface UserData {
//   username?: string
//   password?: string
//   profilePicture?: string
// }

interface TwoFactorData {
  isTwoFactorEnabled: boolean
  dataUrl: string
}

interface StatusData {
  status: string
}

interface State {
  loggedUser: User | null
  friendList: User[]
  tempUserId: string | null
}

export const useUserStore = defineStore('users', {
  state: (): State => ({
    loggedUser: null as unknown as User | null,
    friendList: [],
    tempUserId: null as unknown as string | null
  }),
  actions: {
    async acceptFriendRequest(senderId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/request/accept`,
        { senderId }
      )
      return response
    },

    addBlockedUser(blocker: User, userToBlock: User): void {
      if (!blocker.blockedUsers) blocker.blockedUsers = [] as User[]

      blocker.blockedUsers.push(userToBlock)
    },

    addFriend(newFriend: User): void {
      if (!this.friendList) this.friendList = [] as User[]

      this.friendList.push(newFriend)
    },

    removeBlockedUser(unblocker: User, userToUnblock: User): void {
      if (!unblocker.blockedUsers) unblocker.blockedUsers = [] as User[]

      const index = unblocker.blockedUsers.findIndex(
        (blockedUser) => blockedUser.id === userToUnblock.id
      )
      if (index === -1) return

      unblocker.blockedUsers.splice(index, 1)
    },

    removeFriend(oldFriend: User): void {
      if (!this.friendList) this.friendList = [] as User[]

      const index = this.friendList.findIndex(
        (friend) => friend.id === oldFriend.id
      )
      if (index === -1) return

      this.friendList.splice(index, 1)
    },

    async blockUser(targetId: string): Promise<void> {
      await fetcher
        .put(`/social/friendship/block`, {
          targetId
        })
        .then(async () => {
          if (this.loggedUser === null) return

          const toBlock = await this.fetchUserById(targetId)
          this.addBlockedUser(this.loggedUser, toBlock)
          this.removeFriend(toBlock)
        })
    },

    async enableTwoFactor(): Promise<TwoFactorData> {
      const response: TwoFactorData = await fetcher.post('/auth/2fa')
      return response
    },

    async fetchAllUsers(): Promise<Paginated<User>> {
      const response: Paginated<User> = await fetcher.get(`/user/stats`)
      return response
    },

    async fetchBlockerId(userId: string): Promise<string> {
      const response = await fetcher.get(`/social/blocker-id/${userId}`)

      return response.blockerId
    },

    async fetchFriendList(): Promise<User[]> {
      const response: User[] = await fetcher.get(`/social/friend-list`)
      return response
    },

    async fetchFriendRequests(): Promise<Friendship[]> {
      const response: Friendship[] = await fetcher.get(
        `/social/friend-requests`
      )
      return response
    },

    async fetchUser(): Promise<User> {
      const response: User = await fetcher.get(`/user/me`)
      return response
    },

    async fetchUserById(userId: string): Promise<User> {
      const response: User = await fetcher.get(`/user/${userId}`)
      return response
    },

    async fetchUserByIdWithStats(userId: string): Promise<User> {
      const response: User = await fetcher.get(`/user/${userId}/stats`)
      return response
    },

    async fetchUserRank(userId: string): Promise<number> {
      const response: number = await fetcher.get(`/user/${userId}/rank`)
      return response
    },

    async refreshFriendList(): Promise<User[]> {
      if (this.loggedUser == null) {
        return []
      }
      this.friendList = await this.fetchFriendList()

      return this.friendList
    },

    async refreshUser(): Promise<void> {
      try {
        const user = await this.fetchUser()
        this.loggedUser = user
      } catch (error) {}
    },

    async register(values: Record<string, any>): Promise<User> {
      const response: User = await fetcher.post(`/auth/register`, values)
      return response
    },

    async rejectFriendRequest(senderId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/request/reject`,
        { senderId }
      )
      return response
    },

    async sendFriendRequest(receiverId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.post(
        `/social/friendship/request`,
        { receiverId }
      )

      return response
    },

    async signIn(values: Record<string, any>): Promise<User> {
      const response: User = await fetcher.post(`/auth/signIn`, values)
      if (!response.isTwoFactorEnabled) this.loggedUser = response

      return response
    },

    async signOut(): Promise<void> {
      const response = await fetcher.post('/auth/signout')
      this.loggedUser = null

      const channelStore = useChannelStore()
      channelStore.$reset()

      return response
    },

    async unblockUser(targetId: string): Promise<void> {
      await fetcher
        .put(`/social/friendship/unblock`, { targetId })
        .then(async () => {
          if (this.loggedUser === null) return

          const toUnblock = await this.fetchUserById(targetId)

          this.removeBlockedUser(this.loggedUser, toUnblock)
          this.addFriend(toUnblock)
        })
    },

    async verifyTwoFactor(values: Record<string, string>): Promise<User> {
      const response: User = await fetcher.post('/auth/verifyToken', values)
      this.loggedUser = response
      return response
    },

    async setUsername(username: string): Promise<User> {
      const response: User = await fetcher.put('/auth/set-username', {
        username
      })
      return response
    },

    async getAuthStatus(): Promise<StatusData> {
      const response: StatusData = await fetcher.get('/auth/status')
      return response
    },

    async updateUser(userId: string, userData: Partial<User>): Promise<User> {
      const response: User = await fetcher.patch(`/user/${userId}`, userData)
      return response
    },

    async uploadProfilePicture(id: string, file: File): Promise<void> {
      const toast = useToast()
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/upload`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        })

        if (!res.ok) {
          let data
          const contentType = res.headers.get('content-type')

          if (contentType?.includes('application/json')) {
            try {
              data = await res.json()
            } catch (jsonError) {
              toast.error(
                'An error occured while uploading your profile picture'
              )
            }
          } else {
            data = {
              error: res.statusText,
              statusCode: res.status,
              code: 'UNKNOWN'
            }
          }

          throw new ApiError(
            data.error || res.statusText,
            data.statusCode,
            data.code,
            new Date(Date.now()),
            '/user/upload',
            'POST'
          )
        }
      } catch (error) {
        if (error instanceof ApiError) {
          throw error
        }
        toast.error('An error occured while uploading your profile picture')
      }
    }
  }
})
