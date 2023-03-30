<template>
  <div class="chat-messages">
    <h2 class="text-2xl font-bold mb-8 text-black">{{ selectedUser.username }}</h2>
    <div
      v-for="message in filteredMessages"
      :key="message.id"
      :class="{
        'border-black border-2 bg-zinc-900 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 ml-auto':
          message.sender.id === loggedUser.id && message.receiver.id === selectedUser.id,
        'border-black border-2 flex flex-col mx-2 my-3 mt-1 p-2.5 text-justify w-2/6 min-w-min':
          message.sender.id === selectedUser.id && message.receiver.id === loggedUser.id
      }"
    >
      <p
        class="text-sm"
        :class="{
          'text-white':
            message.sender.id === loggedUser.id && message.receiver.id === selectedUser.id,
          'text-black':
            message.sender.id === selectedUser.id && message.receiver.id === loggedUser.id
        }"
      >
        {{ message.text }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import type { Message } from '../types/Message.js'

export default {
  name: 'ChatDiscussion',
  props: {
    selectedUser: {
      required: true,
      default: () => ({
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
        points_difference: 0
      })
    },
    loggedUser: {
      required: true,
      default: () => ({
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
        points_difference: 0
      })
    }
  },
  data() {
    return {
      messages: [
        {
          id: 1,
          sender: {
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
          receiver: {
            id: 3,
            username: 'Mitsun0bu',
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
          },
          text: "Hello! It's Conobi here!"
        },
        {
          id: 2,
          sender: {
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
          receiver: {
            id: 3,
            username: 'Mitsun0bu',
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
          },
          text: "Hi ! It's Hayce_ here!"
        },
        {
          id: 3,
          sender: {
            id: 4,
            username: 'Narcisserael',
            email: '',
            password: '',
            profile_picture: '',
            status: '',
            rank: 3,
            games_played: 10,
            win: 6,
            loss: 4,
            win_rate: 60,
            points_scored: 12,
            points_conceded: 8,
            points_difference: 4
          },
          receiver: {
            id: 3,
            username: 'Mitsun0bu',
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
          },
          text: "Yo ! It's Narcisserael here"
        },
        {
          id: 3,
          sender: {
            id: 3,
            username: 'Mitsun0bu',
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
          },
          receiver: {
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
          text: 'Well received Conobi! My name is Mitsun0bu'
        }
      ]
    }
  },
  computed: {
    filteredMessages(): Message[] {
      return this.messages.filter((message) => {
        return (
          (message.receiver.id === this.loggedUser.id &&
            message.sender.id === this.selectedUser.id) ||
          (message.receiver.id === this.selectedUser.id && message.sender.id === this.loggedUser.id)
        )
      })
    }
  }
}
</script>
