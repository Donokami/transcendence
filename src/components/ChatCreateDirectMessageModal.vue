<template>
  <div>
    <input type="checkbox" id="my-modal-1" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none border-2 border-black">
        <!-- TITLE -->

        <div class="text-xl flex justify-between">
          <h1>New message</h1>
          <button
            @click="closeCreateModal()"
            for="my-drawer-4"
            class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
            <iconify-icon
              icon="material-symbols:close"
              class="h-6 w-6 absolute">
            </iconify-icon>
          </button>
        </div>

        <!-- FRIENDS LIST -->
        <div
          class="collapse collapse-arrow border-2 border-black rounded-none mt-6">
          <input type="checkbox" />
          <div class="collapse-title text-base">Select a friend</div>
          <!-- AVAILABLE FRIENDS TO SEND DM TO -->
          <div class="collapse-content text-base p-0">
            <ul v-if="filteredFriendList.length > 0" class="menu w-full p-0">
              <li v-for="friend in filteredFriendList" :key="friend.username">
                <a class="flex rounded-none" @click="createDmChannel(friend)">
                  <button class="block" @click="closeCreateModal">
                    {{ friend.username }}
                  </button>
                </a>
              </li>
            </ul>
            <!-- NO FRIEND TO SEND DM TO -->
            <div v-else class="">
              <p class="px-4">
                You have no friend or you have already send a DM to all your
                friends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'
import type { User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['update:showModal'])
const props = defineProps({
  showModal: { type: Boolean }
})
const { showModal } = toRefs(props)
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { friendList } = storeToRefs(userStore)

const filteredFriendList = computed(() => {
  return friendList.value.filter(
    (friend) =>
      !channelStore
        .getDms()
        .some(
          (dm) =>
            dm.members.find((member) => member.username === dm.name)?.id ===
            friend.id
        )
  )
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *************** //
// createDmChannel //
// *************** //

// todo (Lucas): close modal after creating DM channel
const createDmChannel = async (friend: User): Promise<void> => {
  if (loggedUser.value == null || !friend) {
    return
  }
  try {
    await channelStore.createDmChannel(friend.id)
    console.log(`[ChatMessagesModal] - DM channel created successfully !`)
  } catch (error) {
    console.error(
      `[ChatMessagesModal] - Failed to create DM channel ! Error: `,
      error
    )
  }
}

// **************** //
// closeCreateModal //
// **************** //

function closeCreateModal(): void {
  const modalElement = document.getElementById('my-modal-1') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  if (friendList.value.length === 0) {
    await userStore.refreshFriendList()
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (friendList.value.length === 0) {
    await userStore.refreshFriendList()
  }
})

watch(showModal, (newValue) => {
  const modalElement = document.getElementById('my-modal-1') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
