import { defineStore } from 'pinia'
import type { User } from '../types/User.js'

export const useUserStore = defineStore('users', {
  state: () => ({
    selectedUser: null as unknown as User,
    loggedUser: {
      id: 3,
      username: 'Mitsun0bu',
      email: '',
      password: '',
      profile_picture: '',
      status: '',
      rank: 0,
      games_played: 0,
      win: 0,
      loss: 0,
      win_rate: 0,
      points_scored: 0,
      points_conceded: 0,
      points_difference: 0,
      friends: ['Conobi', 'Hayce_', 'Narcisserael'],
      n_friends: 0
    },
    users: [
      {
        id: 1,
        username: 'Conobi',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 1,
        games_played: 10,
        win: 5,
        loss: 5,
        win_rate: 50,
        points_scored: 10,
        points_conceded: 10,
        points_difference: 0,
        friends: ['Mitsun0bu', 'Hayce_', 'Narcisserael'],
        n_friends: 0
      },
      {
        id: 2,
        username: 'Hayce_',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 2,
        games_played: 10,
        win: 4,
        loss: 6,
        win_rate: 40,
        points_scored: 8,
        points_conceded: 12,
        points_difference: -4,
        friends: ['Conobi', 'Mitsun0bu', 'Narcisserael'],
        n_friends: 0
      },
      {
        id: 3,
        username: 'Mitsun0bu',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 0,
        games_played: 0,
        win: 0,
        loss: 0,
        win_rate: 0,
        points_scored: 0,
        points_conceded: 0,
        points_difference: 0,
        friends: ['Conobi', 'Hayce_', 'Narcisserael'],
        n_friends: 0
      },
      {
        id: 4,
        username: 'Narcisserael',
        email: '',
        password: '',
        profile_picture: '',
        status: '',
        rank: 4,
        games_played: 10,
        win: 2,
        loss: 8,
        win_rate: 20,
        points_scored: 4,
        points_conceded: 25,
        points_difference: -21,
        friends: ['Conobi', 'Hayce_', 'Mitsun0bu'],
        n_friends: 0
      }
    ]
  })
})
