<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none border-2 border-black">
      <div class="text-xl flex justify-between">
        <!-- TITLE -->
        <h1>Friend list</h1>
        <!-- CLOSING CROSS -->
        <label
          for="my-modal-3"
          class="relative btn btn-sm btn-square border-2 border-black hover:border-2 hover:border-black">
          <iconify-icon icon="material-symbols:close" class="h-6 w-6 absolute">
          </iconify-icon>
        </label>
      </div>
      <!-- FRIEND LIST -->

      <ul class="flex menu bg-base-100 w-full p-0">
        <li v-for="friend in friendList" :key="friend.id">
          <div class="flex items-center px-2 sm:px-4 w-18 rounded-none">
            <div class="h-11 w-11">
              <user-avatar
                :userProps="friend"
                :uploadMode="false"></user-avatar>
            </div>
            <span class="pl-4 text-base truncate w-28 sm:w-48">
              {{ friend.username }} is {{ friend.status }}
            </span>
            <span class="pl-4 capitalize text-base truncate w-28 sm:w-48">
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

import { storeToRefs } from 'pinia'

import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/UserStore.js'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()

const { friendList } = storeToRefs(userStore)

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(userStore.fetchFriendList)
</script>
