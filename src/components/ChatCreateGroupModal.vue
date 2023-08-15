<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="border-2 border-black rounded-none modal-box">
        <!-- TITLE -->
        <div class="flex justify-between text-xl">
          <h1>Create a group</h1>
          <button
            @click="closeModal()"
            class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
            <iconify-icon
              icon="material-symbols:close"
              class="absolute w-6 h-6">
            </iconify-icon>
          </button>
        </div>
        <!-- FORM -->
        <Form ref="formRef" @submit="submitForm">
          <div>
            <!-- GROUP NAME -->
            <div class="mt-6 form-control">
              <span class="text-base text-black">Group Name</span>
              <input
                v-model="channelName"
                class="py-2 text-sm neobrutalist-input"
                placeholder="Enter a group name" />
              <div v-if="channelNameError" class="text-red-500">
                {{ channelNameError }}
              </div>
            </div>
            <!-- FRIENDS LIST -->
            <div class="mt-6 form-control">
              <span class="text-base text-black">Invite Friends</span>
              <div
                class="mt-2 border-2 border-black rounded-none collapse collapse-arrow">
                <input type="checkbox" />
                <div class="text-base collapse-title">Friends list</div>
                <!-- AVAILABLE FRIENDS TO ADD TO THE GROUP -->
                <div class="p-0 text-base collapse-content">
                  <ul
                    v-if="filteredFriendList.length > 0"
                    class="w-full p-0 menu">
                    <li
                      v-for="friend in filteredFriendList"
                      :key="friend.username">
                      <a
                        class="flex rounded-none"
                        @click="pushUserToAdd(friend)">
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
            <div class="flex flex-wrap gap-2 mt-2">
              <div class="bg-red-300" v-for="user in usersToAdd" :key="user.id">
                <div
                  class="flex items-center justify-between gap-1 p-1 bg-black cursor-pointer w-fit"
                  @click="cancelUserToAdd(user)">
                  <span class="text-white border-none rounded-none">
                    {{ user.username }}
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
            <!-- PRIVATE -->
            <div v-if="!passwordRequired" class="mt-6 form-control">
              <label class="px-0 cursor-pointer label">
                <span class="text-base text-black">Private</span>
                <input
                  type="checkbox"
                  class="border-2 border-black rounded-none checkbox"
                  @click="isPrivate = !isPrivate" />
              </label>
            </div>
            <!-- PASSWORD -->
            <div v-if="!isPrivate" class="mt-6 form-control">
              <label class="px-0 cursor-pointer label">
                <span class="text-base text-black">Password</span>
                <input
                  type="checkbox"
                  class="border-2 border-black rounded-none checkbox"
                  @click="setPasswordRequirement()" />
              </label>
              <input
                v-model="password"
                v-if="passwordRequired === true"
                class="py-2 text-sm neobrutalist-input"
                placeholder="Choose a password for your group" />
              <div v-if="passwordError" class="text-red-500">
                {{ passwordError }}
              </div>
            </div>
          </div>
          <!-- CREATE GROUP BUTTON -->
          <div class="modal-action">
            <button
              class="my-4 mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
              type="submit">
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
import { onBeforeRouteUpdate, useRouter } from 'vue-router'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'
import { useToast } from 'vue-toastification'
import type { User } from '@/types'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const userStore = useUserStore()
const router = useRouter()

const channelName = ref<string>('')
const channelNameError = ref<string | null>(null)
const emit = defineEmits(['update:showModal'])
const friendListError = ref<string | null>(null)
const password = ref<string | null>(null)
const passwordRequired = ref<boolean>(false)
const passwordError = ref<string | null>(null)
const isPrivate = ref<boolean>(false)
const props = defineProps({
  showModal: { type: Boolean }
})
const toast = useToast()
const usersToAdd = ref<User[]>([])

const { friendList } = storeToRefs(userStore)
const { loggedUser } = storeToRefs(userStore)
const { showModal } = toRefs(props)

const filteredFriendList = computed(() => {
  return friendList.value.filter((user) => !usersToAdd.value.includes(user))
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// *************** //
// cancelUserToAdd //
// *************** //

const cancelUserToAdd = (user: User): void => {
  const userIndex = usersToAdd.value.indexOf(user)
  if (userIndex > -1) {
    usersToAdd.value.splice(userIndex, 1)
  }

  console.log(`usersToAdd : `, usersToAdd.value)
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    channelName.value = ''
    channelNameError.value = null
    friendListError.value = null
    password.value = null
    passwordError.value = null

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

  if (!channelName.value) {
    toast.error(`Channel name required`)
    return
  }

  if (passwordRequired.value && !password.value) {
    toast.error(`Password required`)
    return
  }

  const idUsersToAdd: string[] = usersToAdd.value.map((user) => user.id)

  try {
    const channel = await channelStore.createGroupChannel(
      channelName.value,
      idUsersToAdd,
      password.value,
      isPrivate.value
    )
    toast.success(`Group created successfully`)
    channelStore.selectedChannel = channel.id
    await router.push(`/chat/${channel.id}`)
  } catch (error) {
    toast.error(`Failed to create group`)
  } finally {
    channelName.value = ''
    channelNameError.value = null
    friendListError.value = null
    password.value = null
    passwordError.value = null
    usersToAdd.value = []
    closeModal()
  }
}

// ************* //
// pushUserToAdd //
// ************* //

const pushUserToAdd = (user: User): void => {
  if (!usersToAdd.value.includes(user)) {
    usersToAdd.value.push(user)
  }

  console.log(`usersToAdd : `, usersToAdd.value)
}

// ********************** //
// setPasswordRequirement //
// ********************** //

const setPasswordRequirement = (): void => {
  if (passwordRequired.value) {
    passwordRequired.value = false
  } else {
    passwordRequired.value = true
  }
  passwordError.value = null
}

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, any>): Promise<void> => {
  if (channelName.value.length === 0) {
    channelNameError.value = 'Group name is required for group creation'
    return
  } else {
    channelNameError.value = null
  }

  if (usersToAdd.value.length === 0) {
    friendListError.value = 'Adding friends is required for group creation'
    return
  } else {
    friendListError.value = null
  }

  if (passwordRequired.value) {
    if (!password.value?.length) {
      passwordError.value = 'Password is required for group creation.'
      return
    }
    if (
      password.value &&
      (password.value.length < 4 || password.value.length > 50)
    ) {
      passwordError.value = 'The password must be between 4 and 50 characters.'
      return
    }
  } else {
    passwordError.value = null
  }

  await createGroupChannel()
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
