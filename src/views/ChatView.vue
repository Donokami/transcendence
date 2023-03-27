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
import type { User } from '../types/user.js'

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
        name: 'Mitsun0bu',
        profile_picture: ''
      },
      users: [
        {
          id: 1,
          name: 'Conobi',
          profile_picture: ''
        },
        {
          id: 2,
          name: 'Hayce_',
          profile_picture: ''
        },
        {
          id: 3,
          name: 'Mitsun0bu',
          profile_picture: ''
        },
        {
          id: 4,
          name: 'Narcisserael',
          profile_picture: ''
        }
      ],
      selectedUser: {
        id: 1,
        name: 'Conobi',
        profile_picture: ''
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
