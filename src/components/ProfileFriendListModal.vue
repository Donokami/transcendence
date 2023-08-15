<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none border-2 border-black">
      <div class="text-xl flex justify-between mb-4">
        <h1>Friend list</h1>
        <label
          for="my-modal-3"
          class="relative btn btn-sm btn-square border-2 border-black hover:border-2 hover:border-black">
          <iconify-icon icon="material-symbols:close" class="h-6 w-6 absolute">
          </iconify-icon>
        </label>
      </div>
      <ul class="flex bg-base-100 menu w-full p-0">
        <li
          v-if="friendList && friendList.length === 0"
          class="flex items-center px-2 sm:px-4 w-18 rounded-none">
          <span class="pl-4 text-base truncate">
            You have no friends yet.
          </span>
        </li>
        <li v-for="friend in friendList" :key="friend.id" v-else>
          <div class="flex items-center px-2 sm:px-4 w-18 rounded-none">
            <div class="h-11 w-11">
              <user-avatar
                :user-props="friend"
                :upload-mode="false"></user-avatar>
            </div>
            <span class="pl-4 text-base truncate">
              {{ friend.username }} ({{ friend.status }})
            </span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount } from 'vue'

import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/UserStore.js'
import type { User } from '@/types'

const userStore = useUserStore()

const { friendList }: { friendList: User[] } = useUserStore()

onBeforeMount(async () => {
  await userStore.refreshFriendList()
})
</script>
