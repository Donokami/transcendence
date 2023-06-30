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

// export const useUserStore = defineStore('users', {
//   state: () => ({
//     selectedUser: null as unknown as User,
//     loggedUser: {
//       id: 3,
//       username: 'Mitsun0bu',
//       email: '',
//       password: '',
//       profile_picture: '',
//       status: '',
//       rank: 0,
//       games_played: 0,
//       win: 0,
//       loss: 0,
//       win_rate: 0,
//       points_scored: 0,
//       points_conceded: 0,
//       points_difference: 0,
//       friends: ['Conobi', 'Hayce_', 'Narcisserael'],
//       n_friends: 0
//     },
//     users: [
//       {
//         id: 1,
//         username: 'Conobi',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 1,
//         games_played: 10,
//         win: 5,
//         loss: 5,
//         win_rate: 50,
//         points_scored: 10,
//         points_conceded: 10,
//         points_difference: 0,
//         friends: ['Mitsun0bu', 'Hayce_', 'Narcisserael'],
//         n_friends: 0
//       },
//       {
//         id: 2,
//         username: 'Hayce_',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 2,
//         games_played: 10,
//         win: 4,
//         loss: 6,
//         win_rate: 40,
//         points_scored: 8,
//         points_conceded: 12,
//         points_difference: -4,
//         friends: ['Conobi', 'Mitsun0bu', 'Narcisserael'],
//         n_friends: 0
//       },
//       {
//         id: 3,
//         username: 'Mitsun0bu',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 0,
//         games_played: 0,
//         win: 0,
//         loss: 0,
//         win_rate: 0,
//         points_scored: 0,
//         points_conceded: 0,
//         points_difference: 0,
//         friends: ['Conobi', 'Hayce_', 'Narcisserael'],
//         n_friends: 0
//       },
//       {
//         id: 4,
//         username: 'Narcisserael',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 4,
//         games_played: 10,
//         win: 2,
//         loss: 8,
//         win_rate: 20,
//         points_scored: 4,
//         points_conceded: 25,
//         points_difference: -21,
//         friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
//         n_friends: 0
//       },
//       {
//         id: 5,
//         username: 'User1',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 4,
//         games_played: 10,
//         win: 2,
//         loss: 8,
//         win_rate: 20,
//         points_scored: 4,
//         points_conceded: 25,
//         points_difference: -21,
//         friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
//         n_friends: 0
//       },
//       {
//         id: 6,
//         username: 'User2',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 4,
//         games_played: 10,
//         win: 2,
//         loss: 8,
//         win_rate: 20,
//         points_scored: 4,
//         points_conceded: 25,
//         points_difference: -21,
//         friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
//         n_friends: 0
//       },
//       {
//         id: 7,
//         username: 'User3',
//         email: '',
//         password: '',
//         profile_picture: '',
//         status: '',
//         rank: 4,
//         games_played: 10,
//         win: 2,
//         loss: 8,
//         win_rate: 20,
//         points_scored: 4,
//         points_conceded: 25,
//         points_difference: -21,
//         friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
//         n_friends: 0
//       }
//     ]
//   })
// })
