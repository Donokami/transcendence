import { defineStore } from 'pinia'
import type { Room } from '../types/Room'
import type { Game } from '../types/Game'
// import type { Socket } from 'socket.io-client'

export const useGameStore = defineStore('games', {
  state: () => ({
    room: null as Room | null,
    game: null as Game | null,
  }),

  actions: {
    // updateRoom(room: Room) {
    //   this.room = room
    // }
  }
})
