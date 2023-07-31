<template>
  <!-- CHANNELS TABS -->
  <div class="tabs">
    <a
      class="tab tab-bordered text-2xl font-bold mb-8"
      :class="{ 'tab-active': listState === 'dms' }"
      @click="emit('list-state-changed', 'dms')"
      >DMs</a
    >
    <a
      class="tab tab-bordered text-2xl font-bold mb-8"
      :class="{ 'tab-active': listState === 'groups' }"
      @click="emit('list-state-changed', 'groups')"
      >Groups</a
    >
  </div>
  <div>
    <!-- CREATE CHANNELS BUTTON -->
    <button
      for="my-modal-3"
      class="btn bg-white border-2 border-black mb-8 text-black hover:bg-black hover:border-black hover:text-white"
      type="button"
      @click="
        activateModal(
          listState === 'dms' ? 'create-dm-modal' : 'create-group-modal'
        )
      ">
      {{ listState === 'dms' ? 'Send a new dm' : 'Create a new group' }}
    </button>
    <!-- JOIN CHANNEL BUTTON -->
    <button
      v-if="listState === 'groups'"
      for="my-modal-3"
      class="btn bg-white border-2 border-black mb-8 text-black hover:bg-black hover:border-black hover:text-white"
      type="button"
      @click="activateModal('join-group-modal')">
      Join a group
    </button>
    <!-- DM MODAL -->
    <chat-create-direct-message-modal
      v-if="listState === 'dms' && activeModal === 'create-dm-modal'"
      :showModal="showModal"
      @update:showModal="showModal = $event">
    </chat-create-direct-message-modal>
    <!-- GROUP MODAL -->
    <chat-create-group-modal
      v-else-if="listState === 'groups' && activeModal === 'create-group-modal'"
      :showModal="showModal"
      @update:showModal="showModal = $event">
    </chat-create-group-modal>
    <!-- JOIN GROUP MODAL -->
    <chat-join-group-modal
      v-else-if="listState === 'groups' && activeModal === 'join-group-modal'"
      :showModal="showModal"
      @update:showModal="showModal = $event">
    </chat-join-group-modal>
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelStore.channelsList?.loading === true">
      <div class="flex justify-center items-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>
    <!-- CHANNELS LIST -->
    <ul
      v-else-if="loggedUser && channelStore.channelsList?.loading === false"
      class="menu bg-base-100 w-full p-0">
      <li v-for="channel in getChannels()" :key="channel.id">
        <router-link
          class="flex p-0 rounded-none"
          :class="{
            active:
              channelStore.selectedChannel &&
              channel.name === channelStore.selectedChannel.name
          }"
          :to="`/chat/${channel.id}`">
          <div class="py-2" v-if="channel.isDm === true">
            <div class="flex items-center mx-auto md:mx-0 pl-4 w-18">
              <img
                v-if="channel.image"
                :src="channel.image"
                class="rounded-full h-12 w-12" />
              <iconify-icon
                v-else
                icon="ri:account-circle-line"
                class="h-16 w-12"></iconify-icon>
              <span class="hidden md:block pl-4">{{ channel.name }}</span>
            </div>
          </div>
          <div class="py-4" v-else-if="channel.isDm === false">
            <div class="flex items-center mx-auto md:mx-0 pl-4 w-18">
              <span>{{ channel.name }}</span>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import ChatCreateDirectMessageModal from '@/components/ChatCreateDirectMessageModal.vue'
import ChatCreateGroupModal from '@/components/ChatCreateGroupModal.vue'
import ChatJoinGroupModal from '@/components/ChatJoinGroupModal.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const props = defineProps({
  listState: String
})

const channelStore = useChannelStore()
const emit = defineEmits(['list-state-changed'])

const showModal = ref(false)
const activeModal = ref('')
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const channels = ref<Channel[]>([])

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ************* //
// activateModal //
// ************* //

function activateModal(modalName: string): void {
  activeModal.value = modalName
  setTimeout(() => {
    showModal.value = !showModal.value
  }, 0)
}

// *********** //
// getChannels //
// *********** //

const getChannels = (): Channel[] => {
  return props.listState === 'dms'
    ? channelStore.getDms()
    : channelStore.getGroups()
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(() => {
  channels.value = getChannels()
})

onBeforeRouteUpdate((to, from) => {
  channels.value = getChannels()
})
</script>
