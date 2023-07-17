<template>
  <div class="tabs">
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">DMs</a>
    <a class="tab tab-bordered tab-active text-2xl font-bold mb-8">Channels</a>
  </div>
  <div>
    <label for="my-modal-3"
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
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

import { onBeforeMount, ref } from 'vue'

import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/UserStore.js'

import ChatGroupChannelsList from '@/components/ChatGroupChannelsList.vue'
import ChatGroupChannelsModal from '@/components/ChatGroupChannelsModal.vue'
import { onBeforeRouteUpdate } from 'vue-router'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()

const emit = defineEmits(['list-state-changed'])

// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore);

let hasGroupChannels = ref(false);

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
    hasGroupChannels.value = !!userStore.groupChannelsList.length;
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
  await userStore.refreshGroupChannelsList();
  checkHasGroupChannels();
});

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshGroupChannelsList();
  checkHasGroupChannels();
})

</script>