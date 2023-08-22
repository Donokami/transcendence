<template>
  <!-- CHANNELS TABS -->
  <div class="flex gap-[2px] bg-black">
    <button
      class="w-full border-t-0 border-b-2 border-black btn shrink border-x-0 hover:bg-base-300 hover:border-black hover:text-black"
      :class="[
        listState === 'dms'
          ? 'bg-black text-white hover:bg-black hover:!text-white'
          : 'bg-white text-black'
      ]"
      @click="emit('list-state-changed', 'dms')">
      DMs
    </button>
    <button
      class="w-full border-t-0 border-b-2 border-black btn shrink border-x-0 hover:bg-base-300 hover:border-black hover:text-black"
      :class="[
        listState === 'groups'
          ? 'bg-black text-white hover:bg-black hover:!text-white'
          : 'bg-white text-black'
      ]"
      @click="emit('list-state-changed', 'groups')">
      Groups
    </button>
  </div>
  <div class="flex-auto overflow-auto py-[2px]">
    <!-- LOADER FOR CHANNEL LIST -->
    <div v-if="channelsList === null" class="h-full overflow-hidden">
      <div v-for="i in 15" class="flex p-0 rounded-none" :key="i">
        <div class="flex items-center py-2 pl-4 mx-auto md:mx-0 w-18">
          <div
            class="object-cover mr-2 rounded-full h-11 w-11 bg-slate-200/20 animate-pulse"></div>
          <span
            class="hidden h-4 pl-4 rounded-sm md:block bg-slate-200/20 animate-pulse w-36"></span>
        </div>
      </div>
    </div>
    <!-- CHANNELS LIST -->
    <ul
      v-else-if="loggedUser && channelsList.length > 0"
      class="w-full p-0 bg-base-100">
      <li v-for="channel in getChannels()" :key="channel.id">
        <router-link
          class="flex p-0 rounded-none hover:bg-base-300 focus-border"
          :active-class="'!bg-[#000000] hover:!bg-[#000000] focus-border-black'"
          :to="`/chat/${channel.id}`">
          <div class="py-3" v-if="channel.isDm === true">
            <div class="flex items-center px-2 mx-auto sm:px-4 w-18">
              <div class="w-8 h-8 sm:h-11 sm:w-11" v-if="channel.isDm">
                <user-avatar
                  :user-props="channel.dmUser"
                  :upload-mode="false"></user-avatar>
              </div>
              <div v-else>
                <img
                  v-if="channel.image"
                  :src="channelImageUrl(channel.image)"
                  class="object-cover rounded-full h-11 w-11" />
              </div>
              <span class="pl-3 text-base truncate sm:pl-4 w-28 sm:w-48">{{
                channel.name
              }}</span>
              <span
                class="float-right mx-2 badge badge-ghost"
                v-if="channel.unreadMessages > 0"
                >{{
                  channel.unreadMessages < 100 ? channel.unreadMessages : '99+'
                }}</span
              >
            </div>
          </div>

          <div class="py-3" v-else-if="channel.isDm === false">
            <div class="flex items-center px-2 mx-auto sm:px-3 w-18">
              <div
                class="-space-x-6 avatar-group"
                :class="
                  $route.path === `/chat/${channel.id}`
                    ? 'black-border'
                    : 'white-border'
                "
                v-if="channel.isDm === false">
                <div
                  class="w-fit"
                  v-for="user in (channel.members || []).slice(0, 2)"
                  :key="user.id">
                  <div class="w-10 h-10 sm:w-12 sm:h-12">
                    <user-avatar
                      :user-props="user"
                      :upload-mode="false"
                      :status-mode="false"></user-avatar>
                  </div>
                </div>
              </div>

              <span class="pl-2 text-base truncate sm:pl-3 w-28 sm:w-48">{{
                channel.name
              }}</span>
            </div>
          </div>
        </router-link>
      </li>
    </ul>
  </div>

  <div class="">
    <!-- JOIN CHANNEL BUTTON -->
    <button
      v-if="listState === 'groups'"
      for="my-modal-3"
      class="relative w-full text-black bg-white border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white no-animation"
      type="button"
      @click="activateModal('join-group-modal')">
      <iconify-icon
        icon="material-symbols:group-add-outline"
        class="absolute hidden sm:block left-5 w-7 h-7">
      </iconify-icon>
      <div class="w-full text-center">Join a group</div>
    </button>
    <!-- CREATE CHANNELS BUTTON -->
    <button
      for="my-modal-3"
      class="relative w-full text-black border-t-2 border-b-0 border-black btn border-x-0 hover:bg-black hover:border-black hover:text-white no-animation"
      type="button"
      @click="
        activateModal(
          listState === 'dms' ? 'create-dm-modal' : 'create-group-modal'
        )
      ">
      <iconify-icon
        icon="ci:message-plus-alt"
        class="absolute hidden sm:block left-5 w-7 h-7"></iconify-icon>
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
import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import ChatCreateDirectMessageModal from '@/components/ChatCreateDirectMessageModal.vue'
import ChatCreateGroupModal from '@/components/ChatCreateGroupModal.vue'
import ChatJoinGroupModal from '@/components/ChatJoinGroupModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types'

const props = defineProps({
  listState: String
})

const channelImageUrl = (imagePath: string): string => {
  return `${import.meta.env.VITE_APP_BASE_URL}/${imagePath}`
}

const channelStore = useChannelStore()
const emit = defineEmits(['list-state-changed'])

const showModal = ref(false)
const activeModal = ref('')
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { channelsList } = storeToRefs(channelStore)
const channels = ref<Channel[]>([])

function activateModal(modalName: string): void {
  activeModal.value = modalName
  setTimeout(() => {
    showModal.value = !showModal.value
  }, 0)
}

const getChannels = (): Channel[] => {
  return props.listState === 'dms'
    ? channelStore.getDms()
    : channelStore.getGroups()
}

onBeforeMount(() => {
  channels.value = getChannels() as typeof channels.value
})

onBeforeRouteUpdate((to, from) => {
  channels.value = getChannels() as typeof channels.value
})
</script>

<style scoped>
.black-border :where(.avatar) {
  border-color: black;
}

.white-border :where(.avatar) {
  border-color: white;
}

.focus-border:hover :where(.avatar) {
  border-color: #e5e6e6;
}

.focus-border-black:hover :where(.avatar) {
  border-color: black;
}
</style>
