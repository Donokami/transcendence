import { defineStore } from 'pinia'

import type { User, Friendship, Paginated } from '@/types'
import fetcher from '@/utils/fetcher'
import { useChannelStore } from './ChannelStore'

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

interface UploadData {
  status: string
}

export const useUserStore = defineStore('users', {
  state: () => ({
    loggedUser: null as unknown as User | null,
    twoFactorEnabled: false,
    friendList: [] as User[],
    tempUserId: null as unknown as string | null
  }),
  actions: {
    // ******************* //
    // acceptFriendRequest //
    // ******************* //

    async acceptFriendRequest(senderId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/request/accept`,
        { senderId }
      )
      return response
    },

    // ********* //
    // blockUser //
    // ********* //

    async blockUser(targetId: string): Promise<string> {
      const response: string = await fetcher.put(`/social/friendship/block`, {
        targetId
      })
      return response
    },

    // *************** //
    // enableTwoFactor //
    // *************** //

    async enableTwoFactor(): Promise<TwoFactorData> {
      const response: TwoFactorData = await fetcher.post(
        '/auth/enableTwoFactor'
      )
      return response
    },

    // ************* //
    // fetchAllUsers //
    // ************* //

    async fetchAllUsers(): Promise<Paginated<User>> {
      const response: Paginated<User> = await fetcher.get(`/user/stats`)
      return response
    },

    // ************** //
    // fetchBlockerId //
    // ************** //

    async fetchBlockerId(userId: string): Promise<string> {
      const response = await fetcher.get(`/social/blocker-id/${userId}`)

      return response.blockerId
    },

    // *************** //
    // fetchFriendList //
    // *************** //

    async fetchFriendList(): Promise<User[]> {
      const response: User[] = await fetcher.get(`/social/friend-list`)
      return response
    },

    // ******************* //
    // fetchFriendRequests //
    // ******************* //

    async fetchFriendRequests(): Promise<Friendship[]> {
      const response: Friendship[] = await fetcher.get(
        `/social/friend-requests`
      )
      return response
    },

    // ********* //
    // fetchUser //
    // ********* //

    async fetchUser(): Promise<User> {
      const response: User = await fetcher.get(`/user/me`)
      return response
    },

    // ************* //
    // fetchUserByID //
    // ************* //

    async fetchUserById(id: string): Promise<User> {
      const response: User = await fetcher.get(`/user/${id}`)
      return response
    },

    // ********************** //
    // fetchUserByIDWithStats //
    // ********************** //

    async fetchUserByIdWithStats(id: string): Promise<User> {
      const response: User = await fetcher.get(`/user/${id}/stats`)
      return response
    },

    // ***************** //
    // refreshFriendList //
    // ***************** //

    async refreshFriendList() {
      if (this.loggedUser == null) {
        return []
      }
      const response = await this.fetchFriendList()
      this.friendList = response

      return this.friendList
    },

    // *********** //
    // refreshUser //
    // *********** //

    async refreshUser(): Promise<void> {
      try {
        const user = await this.fetchUser()
        this.loggedUser = user
        this.twoFactorEnabled = user.isTwoFactorEnabled
      } catch (error) {}
    },

    // ******** //
    // register //
    // ******** //

    async register(values: Record<string, any>): Promise<User> {
      const response: User = await fetcher.post(`/auth/register`, values)
      return response
    },

    // ******************* //
    // rejectFriendRequest //
    // ******************* //

    async rejectFriendRequest(senderId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/request/reject`,
        { senderId }
      )
      return response
    },

    // ***************** //
    // sendFriendRequest //
    // ***************** //

    async sendFriendRequest(receiverId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.post(
        `/social/friendship/request`,
        { receiverId }
      )

      return response
    },

    // ****** //
    // signIn //
    // ****** //

    async signIn(values: Record<string, any>): Promise<User> {
      const response: User = await fetcher.post(`/auth/signIn`, values)

      if (!response.isTwoFactorEnabled) {
        this.loggedUser = response
        return response
      }

      this.twoFactorEnabled = true
      return response
    },

    // ******* //
    // signOut //
    // ******* //

    async signOut(): Promise<void> {
      const response = await fetcher.post('/auth/signout')
      this.loggedUser = null

      const channelStore = useChannelStore()
      channelStore.$reset()

      return response
    },

    // *********** //
    // unblockUser //
    // *********** //

    async unblockUser(targetId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/unblock`,
        {
          targetId
        }
      )
      return response
    },

    // *************** //
    // verifyTwoFactor //
    // *************** //

    async verifyTwoFactor(values: Record<string, string>): Promise<User> {
      const response: User = await fetcher.post('/auth/verifyToken', values)
      this.loggedUser = response
      return response
    },

    // *********** //
    // setUsername //
    // *********** //

    async setUsername(username: string): Promise<User> {
      const response: User = await fetcher.post('/auth/set-username', {
        username
      })
      return response
    },

    // ************* //
    // getAuthStatus //
    // ************* //

    async getAuthStatus(): Promise<StatusData> {
      const response: StatusData = await fetcher.get('/auth/status')
      return response
    },

    // ********** //
    // updateUser //
    // ********** //

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
      const response: User = await fetcher.patch(`/user/${id}`, userData)
      return response
    },

    // ******************** //
    // UploadProfilePicture //
    // ******************** //

    async uploadProfilePicture(id: string, file: File): Promise<UploadData> {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user/upload`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`)
      }

      return await response.json()
    }
  }
})
