<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none border-2 border-black">
        <!-- TITLE -->
        <div class="text-xl flex justify-between">
          <h1>Join a group</h1>
          <button
            @click="closeModal()"
            class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
            <iconify-icon
              icon="material-symbols:close"
              class="h-6 w-6 absolute">
            </iconify-icon>
          </button>
        </div>

        <Form ref="formRef" @submit="submitForm">
          <!-- GROUP SETTINGS -->
          <div>
            <!-- GROUP NAME -->
            <div class="form-control py-4">
              <span class="text-base text-black">Group name</span>
              <Field
                name="channelName"
                class="neobrutalist-input py-2"
                placeholder="Enter a group name" />
              <div v-if="channelNameError" class="text-red-500">
                {{ channelNameError }}
              </div>
            </div>
            <!-- PASSWORD -->
            <div class="form-control py-4" v-if="passwordRequired">
              <span class="text-base text-black">Password</span>
              <Field
                name="password"
                class="neobrutalist-input py-2"
                placeholder="Enter password"
                type="password" />
              <div v-if="passwordError" class="text-red-500">
                {{ passwordError }}
              </div>
            </div>
          </div>
          <!-- JOIN GROUP BUTTON -->
          <div class="modal-action">
            <button
              class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
              type="submit">
              JOIN GROUP
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
import { Form, Field } from 'vee-validate'
import { onBeforeMount, ref, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'
import type { Channel } from '@/types/Channel'
import { useToast } from 'vue-toastification'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const userStore = useUserStore()

const channelNameError = ref<string | null>(null)
const emit = defineEmits(['update:showModal'])
const passwordRequired = ref<boolean>(false)
const passwordError = ref<string | null>(null)
const props = defineProps({
  showModal: { type: Boolean }
})
const toast = useToast()

const { loggedUser } = storeToRefs(userStore)
const { showModal } = toRefs(props)

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ****************** //
// checkExistingGroup //
// ****************** //

const checkExistingGroup = async (
  channelName: string
): Promise<Channel | null> => {
  try {
    const channel = await channelStore.fetchExistingGroup(channelName)
    return channel
  } catch (error: any) {
    if (error.status === 404) {
      toast.error(error.message)
    } else {
      toast.error('Somethin went wrong')
    }
    return null
  }
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }

  channelNameError.value = null
  passwordError.value = null
}

// ********* //
// joinGroup //
// ********* //

const joinGroup = async (
  channel: Channel,
  password?: string
): Promise<void> => {
  if (passwordRequired.value && password) {
    await channelStore.joinGroup(channel.name, password)
  } else {
    await channelStore.joinGroup(channel.name)
  }
}

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, string>): Promise<void> => {
  const { channelName, password } = values

  if (channelName === null) {
    channelNameError.value = 'You need to provide a channel name.'
    return
  }

  const channel = await checkExistingGroup(channelName)
  if (!channel) {
    return
  }

  if (channel.passwordRequired) {
    if (!password) {
      passwordError.value = 'A password is required for this channel.'
      return
    } else if (password.length < 8 || password.length > 100) {
      passwordError.value = 'The password must be between 8 and 100 characters.'
      return
    } else {
      await joinGroup(channel, password)
      passwordError.value = null
      passwordRequired.value = false
    }
  } else {
    await joinGroup(channel)
  }

  channelNameError.value = null
  closeModal()
}

// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

onBeforeMount(async () => {})

onBeforeRouteUpdate(async (to, from) => {})

watch(showModal, (newValue) => {
  const modalElement = document.getElementById('my-modal-3') as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
