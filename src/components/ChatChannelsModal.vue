<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <div class="flex items-center justify-end">
        <label
          for="my-modal-3"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
          >X</label
        >
      </div>
      <div class="py-4 justify-start">
        <h3 class="font-bold text-lg">Select channel parameters:</h3>
      </div>
      <div>
        <div class="form-control py-4">
          <span class="label-text text-base">Channel Name</span>
          <input class="neobrutalist-input p-2" />
        </div>
        <div class="form-control py-4">
          <label class="label cursor-pointer">
            <span class="label-text text-base">Password</span>
            <input type="checkbox" class="checkbox border-2 border-black rounded-none" />
          </label>
          <input v-if="password_required === true" class="neobrutalist-input p-2" />
        </div>
      </div>
      <div class="collapse collapse-arrow border-2 border-black rounded-none">
        <input type="checkbox" />
        <div class="collapse-title text-base">Add a friend to the channel</div>
        <div class="collapse-content text-base">
          <ul class="menu bg-base-100 w-full">
            <li v-for="friend in loggedUser.friends" :key="friend">
              <a class="flex p-1">
                <span class="block">{{ friend }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { User } from '../types/User.js'
export default {
  name: 'ChatChannelsModal',
  data() {
    return {
      password_required: false,
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
      selectedUser: {
        id: 0,
        username: '',
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
        friends: [''],
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
          friends: ['Conobi', 'Mitsun0bu', 'Hayce_'],
          n_friends: 0
        }
      ]
    }
  },
  computed: {
    filteredUsers(): User[] {
      return this.users.filter((user) => {
        return user.id !== this.loggedUser.id
      })
    }
  }
}
</script>
