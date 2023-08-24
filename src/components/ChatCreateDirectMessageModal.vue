<template>
  <div>
    <input type="checkbox" id="my-modal-1" class="modal-toggle" />
    <div class="modal">
      <div class="border-2 border-black rounded-none modal-box">
        <!-- TITLE -->

        <div class="flex justify-between text-xl">
          <h1>New message</h1>
          <button
            @click="closeCreateModal()"
            for="my-drawer-4"
            class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
            <iconify-icon
              icon="material-symbols:close"
              class="absolute w-6 h-6">
            </iconify-icon>
          </button>
        </div>

        <!-- FRIENDS LIST -->
        <div
          class="mt-6 border-2 border-black rounded-none collapse collapse-arrow">
          <input type="checkbox" />
          <div class="text-base collapse-title">Select a friend</div>
          <!-- AVAILABLE FRIENDS TO SEND DM TO -->
          <div class="p-0 text-base collapse-content">
            <ul v-if="filteredFriendList.length > 0" class="w-full p-0 menu">
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
import { storeToRefs } from 'pinia'

import { computed, onBeforeMount, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'
import type { User } from '@/types'

const channelStore = useChannelStore()
const userStore = useUserStore()

const router = useRouter()

const emit = defineEmits(['update:showModal'])
const props = defineProps({
  showModal: { type: Boolean }
})

const { showModal } = toRefs(props)
const { loggedUser, friendList } = storeToRefs(userStore)

const toast = useToast()

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

const createDmChannel = async (friend: User): Promise<void> => {
  if (loggedUser.value == null || !friend) {
    return
  }
  try {
    const channel = await channelStore.createDmChannel(friend.id)
    if (channel) {
      await router.push(`/chat/${channel.id}`)
    }
  } catch (error) {
    toast.error(`Failed to create DM`)
  }
}

function closeCreateModal(): void {
  const modalElement = document.getElementById('my-modal-1') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }
}

onBeforeMount(async () => {
  if (friendList.value.length === 0) {
    friendList.value = await userStore.refreshFriendList()
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (friendList.value.length === 0) {
    friendList.value = await userStore.refreshFriendList()
  }
})

watch(showModal, (newValue) => {
  const modalElement = document.getElementById('my-modal-1') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
