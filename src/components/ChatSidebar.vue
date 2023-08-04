<template>
  <!-- CHANNELS TABS -->
  <div class="flex gap-[2px] bg-black">
    <button
      class="btn shrink border-b-2 border-black border-t-0 border-x-0 hover:bg-base-300 hover:border-black hover:text-black w-full"
      :class="[
        listState === 'dms'
          ? 'bg-black text-white hover:bg-black hover:!text-white'
          : 'bg-white text-black'
      ]"
      @click="emit('list-state-changed', 'dms')">
      DMs
    </button>
    <button
      class="btn shrink border-b-2 border-black border-t-0 border-x-0 hover:bg-base-300 hover:border-black hover:text-black w-full"
      :class="[
        listState === 'groups'
          ? 'bg-black text-white hover:bg-black hover:!text-white'
          : 'bg-white text-black'
      ]"
      @click="emit('list-state-changed', 'groups')">
      Groups
    </button>
  </div>
  <div class="flex-auto overflow-auto">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelStore.channelsList?.loading === true">
      <div class="flex justify-center items-center h-fit">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>

    <!-- CHANNELS LIST -->
    <ul
      v-else-if="loggedUser && channelStore.channelsList?.loading === false"
      class="bg-base-100 w-full p-0">
      <li v-for="channel in getChannels()" :key="channel.id">
        <router-link
          class="flex p-0 rounded-none hover:bg-base-300"
          :active-class="'!bg-[#000000] hover:!bg-[#000000]'"
          :to="`/chat/${channel.id}`">
          <div class="py-2" v-if="channel.isDm === true">
            <div class="flex items-center mx-auto md:mx-0 pl-4 w-18">
              <img
                v-if="channel.image"
                :src="`http://localhost:3000/${channel.image}`"
                class="object-cover rounded-full h-11 w-11" />
              <iconify-icon
                v-else
                icon="ri:account-circle-line"
                class="h-11 w-11">
              </iconify-icon>
              <span class="pl-4 capitalize text-base">{{ channel.name }}</span>
            </div>
          </div>

          <div class="py-4" v-else-if="channel.isDm === false">
            <div class="flex items-center mx-auto md:mx-0 pl-4 w-18">
              <span class="pl-4 capitalize text-base">{{ channel.name }}</span>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </div>
  <div>
    <!-- JOIN CHANNEL BUTTON -->
    <button
      v-if="listState === 'groups'"
      for="my-modal-3"
      class="btn bg-white border-t-2 border-x-0 border-b-0 border-black text-black hover:bg-black hover:border-black hover:text-white w-full no-animation"
      type="button"
      @click="activateModal('join-group-modal')">
      Join a group
    </button>
    <!-- CREATE CHANNELS BUTTON -->
    <button
      for="my-modal-3"
      class="btn bg-white border-t-2 border-x-0 border-b-0 border-black text-black hover:bg-black hover:border-black hover:text-white w-full no-animation"
      type="button"
      @click="
        activateModal(
          listState === 'dms' ? 'create-dm-modal' : 'create-group-modal'
        )
      ">
      <iconify-icon
        icon="ci:message-plus-alt"
        class="hidden sm:block w-7 h-7"></iconify-icon>
      <div class="my-auto">
        {{ listState === 'dms' ? 'Send a new dm' : 'Create a new group' }}
      </div>
    </button>
  </div>

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
