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

    async register(values: Record<string, any>): Promise<Response> {
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

    async signIn(values: Record<string, any>): Promise<Response> {
      const response = await fetch(`http://localhost:3000/api/auth/signIn`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
        credentials: 'include',
      })
    if (response.ok) {
      const user: User = await response.json();
      console.log('UserStore - signIn - user = ', user);
      this.loggedUser = user;
    }
    return response;
    },

    // ********* //
    // fetchUser //
    // ********* //

    async fetchUser():Promise<Response> {
      const response = await fetch(`http://localhost:3000/api/user/me`, {
        method: 'GET',
        credentials: 'include',
      })
    return response;
    },

    // *********** //
    // refreshUser //
    // *********** //

    async refreshUser() {
      const response = await this.fetchUser();
      if (response.ok) {
        const responseBody = await response.text();
        console.log("UserStore - refreshUser - response body = ", responseBody);
        if (responseBody) {
          const user: User = JSON.parse(responseBody);
          if (user) this.loggedUser = user;
        }
      }
    },

    // ************* //
    // fetchAllUsers //
    // ************* //

    async fetchAllUsers(): Promise<User[]> {
      const response = await fetch(`http://localhost:3000/api/user/all`, {
        method: 'GET',
        credentials: 'include',
      })
    return response.json();
    },

    // ************* //
    // fetchUserByID //
    // ************* //

    async fetchUserById(id: string): Promise<User> {
      const response = await fetch(`http://localhost:3000/api/user/${id}`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
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
      return response.json();
    },

    // ***************** //
    // sendFriendRequest //
    // ***************** //

    async sendFriendRequest(receiverId: string) {
      console.log('UserStore - sendFriendRequest - receiverId = ', receiverId);
      const response = await fetch(`http://localhost:3000/api/social/friendship/request`, {
        method: 'POST',
        body: JSON.stringify({receiverId}),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
  }
});