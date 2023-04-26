<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
    <chat-channels-button></chat-channels-button>
    <chat-channels-modal></chat-channels-modal>
    <chat-channels-list></chat-channels-list>
  </div>
</template>

<script lang="ts">
import type { Channel } from '../types/Channel.js'
import type { User } from '../types/User.js'
import ChatChannelsButton from '../components/ChatChannelsButton.vue'
import ChatChannelsList from '../components/ChatChannelsList.vue'
import ChatChannelsModal from '../components/ChatChannelsModal.vue'

export default {
  name: 'ChatChannels',
  components: {
    ChatChannelsButton,
    ChatChannelsList,
    ChatChannelsModal
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
        points_difference: 0,
        friends: ['Conobi', 'Hayce_', 'Narcisserael'],
        n_friends: 0
      },
      channels: [
        {
          name: 'Test Channel #1',
          members: [] as User[]
        },
        {
          name: 'Test Channel #2',
          members: [] as User[]
        }
      ] as Channel[],
      selectedChannel: {
        name: 'Test',
        members: [] as User[]
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
  methods: {
    toggleList(): void {
      this.$emit('list-state-changed', 'dm')
    },
    selectUser(selectedUser: User) {
      this.$emit('select-user', selectedUser)
    }
  },
  computed: {}
}
</script>
