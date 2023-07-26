import { defineStore } from 'pinia'

import type { User, Friendship, Paginated } from '@/types'
import fetcher from '@/utils/fetcher'

interface UserData {
  email?: string
  password?: string
  username?: string
  profilePicture?: string
}

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
    // ********** //
    // loggedUser //
    // ********** //

    loggedUser: null as unknown as User | null,
    friendList: [] as User[],
    twoFactorEnabled: false,

    // ********************** //
    // observedUser (PROFILE) //
    // ********************** //

    observedUser: null as unknown as User | null,

    // **************** //
    // tempUserId (2FA) //
    // **************** //

    tempUserId: null as unknown as string | null
  }),
  actions: {
    // ******************* //
    // acceptFriendRequest //
    // ******************* //

    async acceptFriendRequest(senderId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/request/${senderId}/accept`
      )
      return response
    },

    // ********* //
    // blockUser //
    // ********* //

    async blockUser(userToBlockId: string): Promise<string> {
      const response: string = await fetcher.put(
        `/social/friendship/${userToBlockId}/block`
      )
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

    async fetchBlockerId(
      loggedUserId: string,
      observedUserId: string
    ): Promise<string> {
      const response: string = await fetcher.get(
        `/social/blocker-id/${loggedUserId}/${observedUserId}`
      )
      return response
    },

    // *************** //
    // fetchFriendList //
    // *************** //

    async fetchFriendList(id: string): Promise<User[]> {
      const response: User[] = await fetcher.get(`/social/${id}/friend-list`)
      return response
    },

    // ******************* //
    // fetchFriendRequests //
    // ******************* //

    async fetchFriendRequests(id: string): Promise<Friendship[]> {
      const response: Friendship[] = await fetcher.get(
        `/social/${id}/friend-requests`
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
      const response = await this.fetchFriendList(this.loggedUser.id)
      this.friendList = response
      console.log(`[UserStore] - friendList : `, this.friendList)

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
        `/social/friendship/request/${senderId}/reject`
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
      console.log(
        `[UserStore] - Friend request successfully sent to ${receiverId} !`
      )
      return response
    },

    // ****** //
    // signIn //
    // ****** //

    async signIn(values: Record<string, any>): Promise<User> {
      const response: User = await fetcher.post(`/auth/signIn`, values)

      console.log(`[UserStore] - signIn response : `, response)

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
      return response
    },

    // *********** //
    // unblockUser //
    // *********** //

    async unblockUser(userToUnblockId: string): Promise<Friendship> {
      const response: Friendship = await fetcher.put(
        `/social/friendship/${userToUnblockId}/unblock`
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
    // ************* //
    // getAuthStatus //
    // ************* //

    async getAuthStatus(): Promise<StatusData> {
      const response: StatusData = await fetcher.get('/auth/authStatus')
      return response
    },

    // ********** //
    // updateUser //
    // ********** //

    async updateUser(id: string, userData: UserData): Promise<User> {
      console.log(`[UserStore] - updateUser : `, userData)
      console.log(`[UserStore] - updateUser : `, id)
      const response: User = await fetcher.patch(`/user/${id}`, userData)
      console.log(`[UserStore] - updateUser response : `, response)
      return response
    },

    // ******************** //
    // UploadProfilePicture //
    // ******************** //

    async uploadProfilePicture(id: string, file: File): Promise<UploadData> {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('http://localhost:3000/api/user/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`)
      }

      return await response.json()
    }
  }
})
