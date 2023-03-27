<template>
  <div class="chat-messages">
    <h2 class="text-2xl font-bold mb-8 text-black">{{ selectedUser.name }}</h2>
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
import type { User } from '../types/user.js'

interface Message {
  id: number
  text: string
  sender: User
  receiver: User
}

export default {
  name: 'ChatDiscussion',
  props: {
    selectedUser: {
      required: true,
      default: () => ({ id: 0, name: '', profile_picture: '' })
    },
    loggedUser: {
      required: true,
      default: () => ({ id: 0, name: '', profile_picture: '' })
    }
  },
  data() {
    return {
      messages: [
        {
          id: 1,
          sender: {
            id: 1,
            name: 'Conobi',
            profile_picture: ''
          },
          receiver: {
            id: 3,
            name: 'Mitsun0bu',
            profile_picture: ''
          },
          text: "Hello! It's Conobi here!"
        },
        {
          id: 2,
          sender: {
            id: 2,
            name: 'Hayce_',
            profile_picture: ''
          },
          receiver: {
            id: 3,
            name: 'Mitsun0bu',
            profile_picture: ''
          },
          text: "Hi ! It's Hayce_ here!"
        },
        {
          id: 3,
          sender: {
            id: 4,
            name: 'Narcisserael',
            profile_picture: ''
          },
          receiver: {
            id: 3,
            name: 'Mitsun0bu',
            profile_picture: ''
          },
          text: "Yo ! It's Narcisserael here"
        },
        {
          id: 3,
          sender: {
            id: 3,
            name: 'Mitsun0bu',
            profile_picture: ''
          },
          receiver: {
            id: 1,
            name: 'Conobi',
            profile_picture: ''
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
