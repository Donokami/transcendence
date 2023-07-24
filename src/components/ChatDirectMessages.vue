<template>
  <div class="tabs">
    <a class="tab tab-active tab-bordered text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <button for="my-modal-3"
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-black hover:border-black hover:text-white"
      type="button" @click="toggleModal">
      SEND A NEW DM
    </button>
    <chat-direct-messages-modal :showModal="showModal"
      @update:showModal="showModal = $event"></chat-direct-messages-modal>
    <chat-direct-messages-list v-if="hasDms"></chat-direct-messages-list>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import ChatDirectMessagesList from '@/components/ChatDirectMessagesList.vue'
import ChatDirectMessagesModal from '@/components/ChatDirectMessagesModal.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types/Channel'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const dmList = ref([] as Channel[]);
const emit = defineEmits(['list-state-changed'])
let hasDms = ref(false);
let showModal = ref(false);
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore);

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********** //
// checkHasDm //
// ********** //

const checkHasDm = async () => {
  if (!loggedUser.value)
    return 0;
  try {
    hasDms.value = !!dmList.value.length;
    console.log(`[ChatDirectMessages] - hasDms : `, hasDms.value);
  } catch (error) {
    console.error(`[ChatDirectMessages] - Failed to check hasDms value ! Error : `, error);
  }
};

// ********** //
// toggleList //
// ********** //

const toggleList = () => {
  emit('list-state-changed', 'groupChannels')
}

// *********** //
// toggleModal //
// *********** //

function toggleModal(): void {
  showModal.value = !showModal.value;
  console.log(`[ChatDirectMessages] - showModal : `, showModal.value);
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  dmList.value = await channelStore.getDms();
  console.log(`[ChatDirectMessages] - dmList : `, dmList.value);
  checkHasDm();
});

onBeforeRouteUpdate(async (to, from) => {
  dmList.value = await channelStore.getDms();
  console.log(`[ChatDirectMessages] - dmList : `, dmList.value);
  checkHasDm();
})

</script>