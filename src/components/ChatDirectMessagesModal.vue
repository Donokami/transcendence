<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <!-- CLOSING CROSS -->
      <div class="flex items-center justify-end">
        <button class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
          @click="closeModal()">X</button>
      </div>
      <!-- TITLE-->
      <div class="py-4">
        <h3 class="font-bold text-lg">Who do you want to a send a DM to ?</h3>
      </div>
      <!-- FRIENDS LIST -->
      <div class="collapse collapse-arrow border-2 border-black rounded-none">
        <input type="checkbox" />
        <div class="collapse-title text-base">Select a friend</div>
        <div class="collapse-content text-base">
          <ul class="menu bg-base-100 w-full">
            <li v-for="friend in  noDmWithUserList " :key="friend.username">
              <a class="flex p-1 modal-action justify-start" @click="createDmChannel(friend)">
                <button class="block" @click="closeModal">{{ friend.username
                }}</button>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, toRefs, watch } from 'vue';
import { onBeforeRouteUpdate } from 'vue-router';

import { useChannelStore } from '@/stores/ChannelStore';
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types/Channel';
import type { User } from '@/types/user';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['update:showModal'])
const noDmWithUserList = ref<User[]>([]);
const props = defineProps({
  showModal: { type: Boolean },
})
let { showModal } = toRefs(props)
const userStore = useUserStore()

const { loggedUser } = storeToRefs(userStore)
const { friendList } = storeToRefs(userStore);


// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *************** //
// createDmChannel //
// *************** //

const createDmChannel = async (friend: User): Promise<Channel | null> => {
  if (!loggedUser.value || !friend) {
    return null;
  }
  try {
    const dmChannel = await channelStore.createDmChannel(loggedUser.value.id, friend.id);
    console.log(`[ChatDirectMessagesModal] - DM channel created successfully !`)
    return dmChannel;
  }
  catch (error) {
    console.error(`[ChatDirectMessagesModal] - Failed to create DM channel ! Error: `, error);
    return null;
  }
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  const modalElement = document.getElementById("my-modal-3") as HTMLInputElement;
  if (modalElement) {
    modalElement.checked = !modalElement.checked;
    emit('update:showModal', modalElement.checked)
  }
}

// *********************** //
// refreshNoDmWithUserList //
// *********************** //

async function refreshNoDmWithUserList() {
  if (!loggedUser.value) {
    noDmWithUserList.value = [];
    return;
  }
  const dmList = channelStore.getDms();
  const dmUserIds = dmList.map(channel => channel.receiver.id);
  console.log(`[ChatDirectMessagesModal] - dmUserIds: `, dmUserIds)
  noDmWithUserList.value = friendList.value.filter(friend => !dmUserIds.includes(friend.id));
}
// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await userStore.refreshFriendList();
  await refreshNoDmWithUserList();

})

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshFriendList();
  await refreshNoDmWithUserList();
})

watch(showModal, (newValue) => {
  const modalElement = document.getElementById("my-modal-3") as HTMLInputElement;
  if (modalElement) {
    modalElement.checked = newValue;
  }
})

</script>
