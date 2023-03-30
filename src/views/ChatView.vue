<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <site-header></site-header>
    <div class="flex ...">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4"
      >
        <chat-discussions-list
          :loggedUser="loggedUser"
          :users="users"
          :selectedUser="selectedUser"
          @select-user="selectedUser = $event"
        ></chat-discussions-list>
      </div>
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify w-3/4 justify-between"
      >
        <chat-discussion :loggedUser="loggedUser" :selectedUser="selectedUser"></chat-discussion>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import ChatDiscussionsList from '../components/ChatDiscussionsList.vue'
import ChatDiscussion from '../components/ChatDiscussion.vue'
import type { User } from '../types/User.js'

export default {
  name: 'ChatView',
  components: {
    SiteHeader,
    ChatDiscussionsList,
    ChatDiscussion
  },
  data() {
    return {
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
        points_difference: 0
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
          points_difference: 0
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
          points_difference: -4
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
          points_difference: 0
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
          points_difference: -21
        }
      ],
      selectedUser: {
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
        points_difference: 0
      }
    }
  },
  methods: {
    selectUser(user: User) {
      this.selectedUser = user
    }
  }
}
</script>
