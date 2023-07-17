<template>
  <div class="tabs">
    <a class="tab tab-active tab-bordered text-2xl font-bold mb-8">DMs</a>
    <a class="tab tab-bordered text-2xl font-bold mb-8" @click="toggleList">Channels</a>
  </div>
  <div>
    <label for="my-modal-3"
      class="btn bg-white border-2 border-black mb-2 text-black hover:bg-black hover:border-black hover:text-white"
      type="button">
      SEND A NEW DM
    </label>
    <chat-direct-messages-modal></chat-direct-messages-modal>
    <chat-direct-messages-list v-if="hasDms"></chat-direct-messages-list>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { onBeforeMount, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/UserStore.js'

import ChatDirectMessagesList from '@/components/ChatDirectMessagesList.vue'
import ChatDirectMessagesModal from '@/components/ChatDirectMessagesModal.vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const userStore = useUserStore()

const emit = defineEmits(['list-state-changed'])

// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore);

let hasDms = ref(false);


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
    hasDms.value = !!userStore.dmList.length;
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

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await userStore.refreshDmList();
  checkHasDm();
});

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshDmList();
  checkHasDm();
})

</script>