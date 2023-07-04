import { defineStore } from 'pinia'
import type { User } from '../types/user.js'

export const useUserStore = defineStore('users', {
  state: () => ({
    loggedUser: null as unknown as User | null,
    twoFactorEnabled: false,
    tempUserId: null as unknown as string | null
    // selectedUser: null as unknown as User,
    // users: [] as User[]
  }),
  actions: {
    async fetchUser() {
      const response = await fetch('http://localhost:3000/api/user/me', {
        method: 'GET',
        credentials: 'include'
      })
      return response
    },

    async refreshUser() {
      const response = await this.fetchUser()
      if (response.ok) {
        const user: User = await response.json()
        if (user) this.loggedUser = user
        this.twoFactorEnabled = user.isTwoFactorEnabled
      }
      return response
    },

    async register(values: Record<string, any>) {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include'
      })
      return response
    },

    async signIn(values: Record<string, any>) {
      const response = await fetch('http://localhost:3000/api/auth/signIn', {
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
    }
  }
})