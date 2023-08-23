<template>
  <dialog class="modal" ref="dialog">
    <div class="border-2 border-black rounded-none modal-box">
      <div class="flex justify-between mb-4 text-xl">
        <h1>Friend list</h1>
        <form method="dialog" class="relative">
          <button
            class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
            <iconify-icon
              icon="material-symbols:close"
              class="absolute w-6 h-6">
            </iconify-icon>
          </button>
        </form>
      </div>
      <ul class="flex w-full p-0 bg-base-100 menu">
        <li
          v-if="friendList && friendList.length === 0"
          class="flex items-center px-2 rounded-none sm:px-4 w-18">
          <span class="pl-4 text-base truncate">
            You have no friends yet.
          </span>
        </li>
        <li v-for="friend in friendList" :key="friend.id" v-else>
          <div class="flex items-center px-2 rounded-none sm:px-4 w-18">
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
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref, type Ref } from 'vue'

import UserAvatar from '@/components/UserAvatar.vue'
import { useUserStore } from '@/stores/UserStore.js'
import type { User } from '@/types'

const dialog: Ref<HTMLDialogElement | null> = ref(null)

function showModal(): void {
  if (dialog.value) dialog.value.showModal()
}

defineExpose({ showModal })

const userStore = useUserStore()
const { friendList }: { friendList: User[] } = useUserStore()

onBeforeMount(async () => {
  await userStore.refreshFriendList()
})
</script>
