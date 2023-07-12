import { defineStore } from 'pinia'
import type { User } from '@/types/User'

interface UserData {
  email?: string
  password?: string
  username?: string
  profilePicture?: string
}

export const useUserStore = defineStore('users', {
  state: () => ({
    loggedUser: null as unknown as User | null,
    friendList: [] as User[],
    twoFactorEnabled: false,
    tempUserId: null as unknown as string | null
    // selectedUser: null as unknown as User,
    // users: [] as User[]
  }),
  actions: {
    // ******** //
    // register //
    // ******** //

    async register(values: Record<string, any>): Promise<Response> {
      const response = await fetch(`http://localhost:3000/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      })
      return response
    },

    // ****** //
    // signIn //
    // ****** //

    async signIn(values: Record<string, any>): Promise<Response> {
      const response = await fetch(`http://localhost:3000/api/auth/signIn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        if (data.isTwoFactorEnabled) {
          this.twoFactorEnabled = true
          this.tempUserId = data.tempUserId
        } else {
          this.loggedUser = data.user
        }
      }
      return response
    },

    // ********* //
    // fetchUser //
    // ********* //

    async fetchUser(): Promise<User> {
      const response = await fetch(`http://localhost:3000/api/user/me`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    },

    // *********** //
    // refreshUser //
    // *********** //

    async refreshUser() {
      try {
        const user = await this.fetchUser()
        if (user) {
          this.loggedUser = user
          this.twoFactorEnabled = user.isTwoFactorEnabled
        }
      } catch (error) {
        console.log(error)
      }
    },

    // ************* //
    // fetchAllUsers //
    // ************* //

    async fetchAllUsers(): Promise<User[]> {
      const response = await fetch(`http://localhost:3000/api/user/all`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ************* //
    // fetchUserByID //
    // ************* //

    async fetchUserById(id: string): Promise<User> {
      const response = await fetch(`http://localhost:3000/api/user/${id}`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ******************* //
    // fetchFriendRequests //
    // ******************* //

    async fetchFriendRequests(id: string) {
      const response = await fetch(`http://localhost:3000/api/social/${id}/friend-requests`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ***************** //
    // refreshFriendList //
    // ***************** //

    async refreshFriendList() {
      if (!this.loggedUser) return []
      try {
        const response = await this.fetchFriendList(this.loggedUser.id)
        this.friendList = response
        console.log(`[UserStore] - friendList : `, this.friendList)
      } catch (error) {
        console.error(`[UserStore] - Failed to fetch friends! Error: `, error)
      }
    },

    // *************** //
    // fetchFriendList //
    // *************** //

    async fetchFriendList(id: string) {
      const response = await fetch(`http://localhost:3000/api/social/${id}/friend-list`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // **************** //
    // fetchBlockedList //
    // **************** //

    async fetchBlockedList(id: string) {
      const response = await fetch(`http://localhost:3000/api/social/${id}/blocked-list`, {
        method: 'GET',
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ***************** //
    // sendFriendRequest //
    // ***************** //

    async sendFriendRequest(receiverId: string) {
      const response = await fetch(`http://localhost:3000/api/social/friendship/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId }),
        credentials: 'include'
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      console.log(`[UserStore] - Friend request successfully sent to ${receiverId} !`)
      return response.json()
    },

    // ******************* //
    // acceptFriendRequest //
    // ******************* //

    async acceptFriendRequest(senderId: string) {
      const response = await fetch(
        `http://localhost:3000/api/social/friendship/request/${senderId}/accept`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ******************* //
    // rejectFriendRequest //
    // ******************* //

    async rejectFriendRequest(senderId: string) {
      const response = await fetch(
        `http://localhost:3000/api/social/friendship/request/${senderId}/reject`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // ********* //
    // blockUser //
    // ********* //

    async blockUser(userToBlockId: string) {
      const response = await fetch(
        `http://localhost:3000/api/social/friendship/${userToBlockId}/block`,
        {
          method: 'PUT',
          credentials: 'include'
        }
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },

    // *************** //
    // enableTwoFactor //
    // *************** //

    async enableTwoFactor() {
      const response = await fetch('http://localhost:3000/api/auth/enableTwoFactor', {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        throw new Error(`HTTP error status: ${response.status}`)
      }
    },

    // *************** //
    // verifyTwoFactor //
    // *************** //

    async verifyTwoFactor(values: Record<string, any>) {
      const response = await fetch('http://localhost:3000/api/auth/verifyToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      })

      if (response.ok) {
        const user: User = await response.json()
        this.loggedUser = user
        this.tempUserId = null
      }
      return response
    },

    // ******* //
    // signOut //
    // ******* //

    async signOut() {
      const response = await fetch('http://localhost:3000/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`HTTP error status: ${response.status}`)
      }

      this.loggedUser = null
      this.tempUserId = null
    },

    // ************* //
    // getAuthStatus //
    // ************* //

    async getAuthStatus() {
      const response = await fetch('http://localhost:3000/api/auth/authStatus', {
        method: 'GET',
        credentials: 'include'
      })

      return response.json()
    },

    // ********** //
    // updateUser //
    // ********** //

    async updateUser(id: string, userData: UserData) {
      const response = await fetch(`http://localhost:3000/api/user/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        const data = await response.json()
        return data
      } else {
        throw new Error(`HTTP error status: ${response.status}`)
      }
    }
  }
})
