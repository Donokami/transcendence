<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none">
        <!-- CLOSING CROSS -->
        <div class="flex items-center justify-end">
          <button
            class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
            @click="closeModal()">
            X
          </button>
        </div>
        <!-- TITLE -->
        <div class="py-4 justify-start">
          <h3 class="font-bold text-lg">Who do you want to a send a DM to ?</h3>
        </div>
        <!-- FRIENDS LIST -->
        <div class="collapse collapse-arrow border-2 border-black rounded-none">
          <input type="checkbox" />
          <div class="collapse-title text-base">Select a friend</div>
          <!-- AVAILABLE FRIENDS TO SEND DM TO -->
          <div class="collapse-content text-base">
            <ul
              v-if="filteredFriendList.length > 0"
              class="menu bg-base-100 w-full">
              <li v-for="friend in filteredFriendList" :key="friend.username">
                <a
                  class="flex p-1 rounded-none modal-action justify-start"
                  @click="createDmChannel(friend)">
                  <button class="block" @click="closeModal">
                    {{ friend.username }}
                  </button>
                </a>
              </li>
            </ul>
            <!-- NO FRIEND TO SEND DM TO -->
            <div v-else class="py-4">
              <p>
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
import type { Channel, User } from '@/types'

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

const createDmChannel = async (friend: User): Promise<Channel | null> => {
  if (loggedUser.value == null || !friend) {
    return null
  }
  try {
    const dmChannel = await channelStore.createDmChannel(
      loggedUser.value.id,
      friend.id
    )
    console.log(`[ChatMessagesModal] - DM channel created successfully !`)
    return dmChannel
  } catch (error) {
    console.error(
      `[ChatMessagesModal] - Failed to create DM channel ! Error: `,
      error
    )
    return null
  }
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
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
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
