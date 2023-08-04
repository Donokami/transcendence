<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none border-2 border-black">
        <Form ref="formRef" @submit="submitForm">
          <!-- TITLE -->
          <div class="text-xl flex justify-between">
            <h1>Create a group</h1>
            <button
              @click="closeModal()"
              class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
              <iconify-icon
                icon="material-symbols:close"
                class="h-6 w-6 absolute">
              </iconify-icon>
            </button>
          </div>
          <!-- GROUP SETTINGS -->
          <div>
            <!-- GROUP NAME -->
            <div class="form-control mt-6">
              <span class="text-base text-black">Group Name</span>
              <input
                v-model="channelName"
                class="neobrutalist-input py-2 text-sm"
                placeholder="Enter a group name" />
              <div v-if="channelNameError" class="text-red-500">
                {{ channelNameError }}
              </div>
            </div>
            <!-- FRIENDS LIST -->
            <div class="form-control mt-6">
              <span class="text-base text-black">Invite Friends</span>
              <div
                class="collapse collapse-arrow border-2 mt-2 border-black rounded-none">
                <input type="checkbox" />
                <div class="collapse-title text-base">Friends list</div>
                <!-- AVAILABLE FRIENDS TO ADD TO THE GROUP -->
                <div class="collapse-content text-base p-0">
                  <ul
                    v-if="filteredFriendList.length > 0"
                    class="menu w-full p-0">
                    <li
                      v-for="friend in filteredFriendList"
                      :key="friend.username">
                      <a
                        class="flex rounded-none"
                        @click="pushUserToAdd(friend.username, friend.id)">
                        {{ friend.username }}
                      </a>
                    </li>
                  </ul>
                  <!-- NO FRIENDS TO ADD TO THE GROUP -->
                  <div v-if="filteredFriendList.length === 0" class="px-4">
                    <p>You have no more friend to add to the group</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- USER TO ADD BADGES -->
            <div class="mt-2 flex gap-2 flex-wrap">
              <div
                class="bg-red-300"
                v-for="username in usersToAdd"
                :key="username">
                <div
                  class="cursor-pointer bg-black flex justify-between gap-1 p-1 items-center w-fit"
                  @click="cancelUserToAdd(username)">
                  <span class="text-white border-none rounded-none">
                    {{ username }}
                  </span>
                  <iconify-icon
                    icon="material-symbols:close"
                    class="h-4 w-4 text-white mt-0.5">
                  </iconify-icon>
                </div>
              </div>
            </div>

            <div v-if="friendListError" class="text-red-500">
              {{ friendListError }}
            </div>
            <!-- PASSWORD -->
            <div class="form-control mt-6">
              <label class="label cursor-pointer px-0">
                <span class="text-base text-black">Password</span>
                <input
                  type="checkbox"
                  class="checkbox border-2 border-black rounded-none"
                  @click="setPasswordRequirement()" />
              </label>
              <input
                v-model="password"
                v-if="passwordRequired === true"
                class="neobrutalist-input py-2 text-sm"
                placeholder="Choose a password for your group" />
              <div v-if="passwordError" class="text-red-500">
                {{ passwordError }}
              </div>
            </div>
          </div>
          <!-- CREATE GROUP BUTTON -->
          <div class="modal-action">
            <button
              class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
              type="submit"
              @click="closeModal">
              CREATE GROUP
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { storeToRefs } from 'pinia'
import { Form } from 'vee-validate'
import { computed, onBeforeMount, ref, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const userStore = useUserStore()

const channelName = ref<string>('')
const channelNameError = ref<string | null>(null)
const emit = defineEmits(['update:showModal'])
const friendListError = ref<string | null>(null)
const password = ref<string | null>(null)
const passwordRequired = ref<boolean>(false)
const passwordError = ref<string | null>(null)
const props = defineProps({
  showModal: { type: Boolean }
})
const usersToAdd = ref<string[]>([])
const idUsersToAdd = ref<string[]>([])

const { friendList } = storeToRefs(userStore)
const { loggedUser } = storeToRefs(userStore)
const { showModal } = toRefs(props)

const filteredFriendList = computed(() => {
  return friendList.value.filter(
    (user) => !usersToAdd.value.includes(user.username)
  )
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *************** //
// cancelUserToAdd //
// *************** //

const cancelUserToAdd = (username: string) => {
  const indexUsername = usersToAdd.value.indexOf(username)
  if (indexUsername > -1) {
    usersToAdd.value.splice(indexUsername, 1)
  }

  const indexId = idUsersToAdd.value.indexOf(username)
  if (indexId > -1) {
    usersToAdd.value.splice(indexId, 1)
  }
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  if (passwordRequired.value && (!password.value || passwordError.value)) return
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }
}

// ****************** //
// createGroupChannel //
// ****************** //

const createGroupChannel = async (): Promise<void> => {
  if (loggedUser.value == null || !usersToAdd.value) {
    return
  }

  if (passwordRequired.value && !password.value) {
    console.error(`[ChatGroupModal] - Password is required but not provided!`)
    return
  }

  try {
    usersToAdd.value
    await channelStore.createGroupChannel(
      channelName.value,
      idUsersToAdd.value,
      password.value
    )
    console.log(`[ChatGroupModal] - Group created successfully !`)
    passwordError.value = null
  } catch (error) {
    console.error(`[ChatGroupModal] - Failed to create group ! Error: `, error)
  }
}

// ************* //
// pushUserToAdd //
// ************* //

const pushUserToAdd = (username: string, id: string): void => {
  if (!usersToAdd.value.includes(username)) usersToAdd.value.push(username)
  if (!idUsersToAdd.value.includes(id)) idUsersToAdd.value.push(id)
  else console.log(`[ChatGroupModal] - User already in group !`)
}

// ********************** //
// setPasswordRequirement //
// ********************** //

const setPasswordRequirement = (): void => {
  if (passwordRequired.value) passwordRequired.value = false
  else passwordRequired.value = true
  passwordError.value = null
}

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, any>): Promise<void> => {
  if (!channelName.value.length) {
    channelNameError.value = 'You need to name the group before creating it.'
    return
  }

  if (usersToAdd.value.length === 0) {
    friendListError.value =
      'You need to add friends to the group before creating it.'
    return
  }

  if (passwordRequired.value && !password.value) {
    passwordError.value = 'The password field is required.'
    return
  }

  if (
    password.value &&
    (password.value.length < 8 || password.value.length > 100)
  ) {
    passwordError.value = 'The password must be between 8 and 100 characters.'
    return
  }

  passwordError.value = null
  channelNameError.value = null
  friendListError.value = null

  createGroupChannel()
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {
  await userStore.refreshFriendList()
})

onBeforeRouteUpdate(async (to, from) => {
  await userStore.refreshFriendList()
})

watch(showModal, (newValue) => {
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
