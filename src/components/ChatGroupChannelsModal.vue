<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <Form ref="formRef" :validation-schema="privateSchema" @submit="submitForm">
        <!-- CLOSING CROSS -->
        <div class="flex items-center justify-end">
          <label for="my-modal-3"
            class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white">X
          </label>
        </div>
        <!-- TITLE-->
        <div class="py-4 justify-start">
          <h3 class="font-bold text-lg">Select channel parameters:</h3>
        </div>
        <!-- CHANNEL SETTINGS -->
        <div>
          <!-- CHANNEL NAME -->
          <div class="form-control py-4">
            <span class="text-base text-black">Channel Name</span>
            <input class="neobrutalist-input py-2" placeholder="Enter a channel name" />
          </div>
          <!-- FRIENDS LIST -->
          <div class="form-control py-4">
            <span class="text-base text-black">Select a friend you want to add to the channel</span>
            <div class="collapse collapse-arrow border-2 mt-2 border-black w-2/3 rounded-none">
              <input type="checkbox" />
              <div class="collapse-title text-base">Friends list</div>
              <div class="collapse-content text-base">
                <ul class="menu bg-base-100 w-full">
                  <li v-for="friend in friendList" :key="friend.username">
                    <a class="flex p-1" @click="pushUserToAdd(friend.username)">
                      {{ friend.username }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <!-- USER TO ADD BADGES -->
          <div>
            <div v-for="username in usersToAdd" :key="username">
              <div class="label cursor-pointer bg-primary w-1/3 my-1" @click="cancelUserToAdd(username)">
                <span class="badge bg-primary border-none rounded-none">{{ username }}</span>
                <span class="text-white">x</span>
              </div>
            </div>
          </div>
          <!-- PASSWORD -->
          <div class="form-control py-2">
            <label class="label cursor-pointer">
              <span class="text-base text-black">Password</span>
              <input type="checkbox" class="checkbox border-2 border-black rounded-none"
                @click="setPasswordRequirement()" />
            </label>
            <input v-if="passwordRequired === true" class="neobrutalist-input py-4"
              placeholder="Choose a password for your channel" />
          </div>
        </div>
        <!-- CREATE CHANNEL BUTTON -->
        <div>
          <label
            class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-primary hover:border-primary hover:text-white"
            type="button" @click="createGroupChannel()">
            CREATE CHANNEL
          </label>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">

// ******* //
// IMPORTS //
// ******* //

import { ref, onBeforeMount } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router';

import { Form, Field, ErrorMessage } from 'vee-validate'

import { storeToRefs } from 'pinia';

import { useChannelStore } from '@/stores/ChannelStore';
import { useUserStore } from '@/stores/UserStore.js'

import type { Channel } from '@/types/Channel';

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const router = useRouter()

const userStore = useUserStore()
const channelStore = useChannelStore()

const usersToAdd = ref<string[]>([])
const password = ref<string | null>(null)
const passwordRequired = ref<boolean>(false)

const inSubmission = ref(false)

const privateSchema = {
  password: 'required|min:8|max:100'
}

// **************************** //
// loggedUser RELATED VARIABLES //
// **************************** //

const { loggedUser } = storeToRefs(userStore)
const { friendList } = storeToRefs(userStore);

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *************** //
// cancelUserToAdd //
// *************** //

const cancelUserToAdd = (username: string) => {
  const index = usersToAdd.value.indexOf(username)
  if (index > -1) {
    usersToAdd.value.splice(index, 1)
  }
}

// ****************** //
// createGroupChannel //
// ****************** //

const createGroupChannel = async (): Promise<Channel | null> => {
  if (!loggedUser.value || !usersToAdd.value) {
    return null;
  }
  try {
    console.log(`[ChatGroupChannelsModal] - Creating group channel...`)
    console.log('loggedUser.value.id : ', loggedUser.value.id)
    console.log('usersToAdd.value : ', usersToAdd.value)
    console.log('passwordRequired.value : ', passwordRequired.value)
    console.log('password.value : ', password.value)

    const groupChannel = await channelStore.createGroupChannel(loggedUser.value.id, usersToAdd.value, passwordRequired.value, password.value);
    console.log(`[ChatGroupChannelsModal] - Group channel created successfully !`)
    return groupChannel;
  }
  catch (error) {
    console.error(`[ChatGroupChannelsModal] - Failed to create group channel ! Error: `, error);
    return null;
  }
}

// ************* //
// pushUserToAdd //
// ************* //

const pushUserToAdd = (username: string) => {
  if (!usersToAdd.value.includes(username))
    usersToAdd.value.push(username)
  else
    console.log(`[ChatGroupChannelsModal] - User already in channel !`)
}

// ********************** //
// setPasswordRequirement //
// ********************** //

const setPasswordRequirement = () => {
  if (passwordRequired.value === true)
    passwordRequired.value = false
  else
    passwordRequired.value = true
}

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, any>) => { }

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await userStore.refreshFriendList();
})

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshFriendList();
})

</script>