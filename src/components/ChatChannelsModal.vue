<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <!-- CLOSING CROSS -->
      <div class="flex items-center justify-end">
        <label
          for="my-modal-3"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
          >X
        </label>
      </div>
      <!-- TITLE-->
      <div class="py-4 justify-start">
        <h3 class="font-bold text-lg">Select channel parameters:</h3>
      </div>
      <!-- CHANNEL SETTINGS -->
      <div>
        <!-- CHANNEL NAME -->
        <div class="form-control py-4">
          <span class="text-base text-black">Channel Name</span>
          <input class="neobrutalist-input py-2" placeholder="Enter a channel name" />
        </div>
        <!-- FRIENDS LIST -->
        <div class="form-control py-4">
          <span class="text-base text-black">Select a friend you want to add to the channel</span>
          <div class="collapse collapse-arrow border-2 mt-2 border-black w-2/3 rounded-none">
            <input type="checkbox" />
            <div class="collapse-title text-base">Friends list</div>
            <div class="collapse-content text-base">
              <ul class="menu bg-base-100 w-full">
                <li v-for="username in userStore.loggedUser.friends" :key="username">
                  <a class="flex p-1" @click="addUserToChannel(username)">
                    {{ username }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <!-- USER TO ADD BADGES -->
        <div>
          <div v-for="username in usersToAdd" :key="username">
            <div
              class="label cursor-pointer bg-primary w-1/3 my-1"
              @click="cancelAddToChannel(username)"
            >
              <span class="badge bg-primary border-none rounded-none">{{ username }}</span>
              <span class="text-white">x</span>
            </div>
          </div>
        </div>
        <!-- PASSWORD -->
        <div class="form-control py-2">
          <label class="label cursor-pointer">
            <span class="text-base text-black">Password</span>
            <input
              type="checkbox"
              class="checkbox border-2 border-black rounded-none"
              @click="requirePassword()"
            />
          </label>
          <input
            v-if="password_required === true"
            class="neobrutalist-input py-4"
            placeholder="Choose a password for your channel"
          />
        </div>
      </div>
      <!-- CREATE CHANNEL BUTTON -->
      <div>
        <label
          class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
          type="button"
        >
          CREATE CHANNEL
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { User } from '../types/User'
import { useUserStore } from '@/stores/UserStore.js'

const userStore = useUserStore()
const password_required = ref(false)
const usersToAdd = ref<string[]>([])

const requirePassword = () => {
  if (password_required.value === true) 
    password_required.value = false
  else
    password_required.value = true
}

const addUserToChannel = (username: string) => {
  if (!usersToAdd.value.includes(username))
    usersToAdd.value.push(username)
  else
    console.log(`[ChatChannelModal] - Failed to add user to channel ! User already in channel`)
}

const cancelAddToChannel = (username: string) => {
  const index = usersToAdd.value.indexOf(username)
  if (index > -1) {
    usersToAdd.value.splice(index, 1)
  }
}

const filteredUsers = computed(() => {
    return userStore.users.filter((user: User) => {
      return user.id !== userStore.loggedUser.id
    })
  })

</script>