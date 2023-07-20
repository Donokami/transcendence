<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
    <label for="my-modal-3"
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-black hover:border-black hover:text-white"
      type="button">
      CREATE A NEW CHANNEL
    </label>
    <chat-group-channels-modal></chat-group-channels-modal>
    <chat-group-channels-list v-if="hasGroupChannels"></chat-group-channels-list>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import ChatGroupChannelsList from '@/components/ChatGroupChannelsList.vue'
import ChatGroupChannelsModal from '@/components/ChatGroupChannelsModal.vue'
import { useChannelStore } from '@/stores/ChannelStore.js'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types/Channel'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['list-state-changed'])
const groupChannelsList = ref([] as Channel[]);
let hasGroupChannels = ref(false);
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore);

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ********************* //
// checkHasGroupChannels //
// ********************* //

const checkHasGroupChannels = async () => {
  if (!loggedUser.value)
    return 0;
  try {
    hasGroupChannels.value = !!groupChannelsList.value.length;
    console.log(`[ChatGroupChannels] - hasGroupChannels : `, hasGroupChannels.value);
  } catch (error) {
    console.error(`[ChatGroupChannels] - Failed to check hasGroupChannels value ! Error : `, error);
  }
};

// ********** //
// toggleList //
// ********** //

const toggleList = () => {
  emit('list-state-changed', 'dm')
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  groupChannelsList.value = await channelStore.getGroupChannels();
  checkHasGroupChannels();
});

onBeforeRouteUpdate(async (to, from) => {
  groupChannelsList.value = await channelStore.getGroupChannels();
  checkHasGroupChannels();
})

</script>