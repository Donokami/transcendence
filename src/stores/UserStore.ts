import { defineStore } from 'pinia'
import type { User } from '@/types/User'

export const useUserStore = defineStore('users', {
  state: () => ({
    loggedUser: null as unknown as User,
  }),
  actions: {

    // ******** //
    // register //
    // ******** //

    async register(values: Record<string, any>) {
      const response = await fetch(`http://localhost:3000/api/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
        credentials: 'include',
      })
    return response;
    },
    
    // ****** //
    // signIn //
    // ****** //

    async signIn(values: Record<string, any>) {
      const response = await fetch(`http://localhost:3000/api/auth/signIn`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
        credentials: 'include',
      })
    if (response.ok) {
      const user: User = await response.json();
      this.loggedUser = user;
    }
    return response;
    },

    // ********* //
    // fetchUser //
    // ********* //

    async fetchUser() {
      const response = await fetch(`http://localhost:3000/api/user/me`, {
        method: 'GET',
        credentials: 'include',
      })
    return response;
    },

    // ************* //
    // fetchUserByID //
    // ************* //

    async fetchUserById(id: string) {
      const response = await fetch(`http://localhost:3000/api/user/${id}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },
  
    // ******************* //
    // fetchFriendRequests //
    // ******************* //

    async fetchFriendRequests(id: string) {
      const response = await fetch(`http://localhost:3000/api/user/${id}/friend-requests`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    }
  }
});