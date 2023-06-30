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
      this.loggedUser = user;
      console.log(`[UserStore] - ${this.loggedUser.username} successfully signed in !`);
    }
    return response;
    },

    // ********* //
    // fetchUser //
    // ********* //

    async fetchUser(): Promise<User> {
      const response = await fetch(`http://localhost:3000/api/user/me`, {
        method: 'GET',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    },

    // *********** //
    // refreshUser //
    // *********** //

    async refreshUser() {
      try {
        const user = await this.fetchUser();
        if (user) {
        this.loggedUser = user;
      }
      } catch (error) {
        console.log(error);
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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      const response = await fetch(`http://localhost:3000/api/social/${id}/friend-requests`, {
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
      const response = await fetch(`http://localhost:3000/api/social/friendship/request`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({receiverId}),
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log(`[UserStore] - Friend request successfully sent to ${receiverId} !`);
      return response.json();
    },

    // ******************* //
    // acceptFriendRequest //
    // ******************* //

    async acceptFriendRequest(senderId: string) {
      const response = await fetch(`http://localhost:3000/api/social/friendship/request/${senderId}/accept`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },

    // ******************* //
    // rejectFriendRequest //
    // ******************* //

    async rejectFriendRequest(senderId: string) {
      const response = await fetch(`http://localhost:3000/api/social/friendship/request/${senderId}/reject`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },

    // ********* //
    // blockUser //
    // ********* //

    async blockUser(userToBlockId: string) {
      const response = await fetch(`http://localhost:3000/api/social/friendship/${userToBlockId}/block`, {
        method: 'PUT',
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  }
});