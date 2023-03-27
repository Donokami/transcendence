<template>
  <h2 class="text-2xl font-bold mb-8 text-black">Discussions</h2>
  <ul class="menu bg-base-100 w-full">
    <ChatUserSelector
      v-for="user in users"
      :key="user.id"
      :user_name="user.name"
      :user_profile_picture="user.profile_picture"
      :is_selected="user.is_selected"
      @select-user="selectUser(user)"
    />
  </ul>
</template>

<script lang="ts">
import ChatUserSelector from './ChatUserSelector.vue'

interface User {
  id: number
  name: string
  profile_picture: string
  is_selected: boolean
}

export default {
  name: 'ChatDiscussionsList',
  components: {
    ChatUserSelector
  },
  data() {
    return {
      users: [
        {
          id: 1,
          name: 'Conobi',
          profile_picture: '',
          is_selected: true
        },
        {
          id: 2,
          name: 'Hayce_',
          profile_picture: '',
          is_selected: false
        },
        {
          id: 3,
          name: 'Narcisserael',
          profile_picture: '',
          is_selected: false
        }
      ]
    }
  },
  methods: {
    selectUser(selectedUser: User) {
      // DEACTIVATE ALL USERS
      this.users.forEach((user) => {
        if (user !== selectedUser) {
          user.is_selected = false
        }
      })
      // ACIVATE THE SELECTED USER
      selectedUser.is_selected = true
    }
  }
}
</script>
