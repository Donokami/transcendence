<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="border-2 border-black rounded-none modal-box">
        <!-- TITLE -->
        <div class="flex justify-between text-xl">
          <h1>Join a group</h1>
          <button
            @click="closeModal()"
            class="relative border-2 border-black btn btn-square hover:border-2 hover:border-black btn-sm">
            <iconify-icon
              icon="material-symbols:close"
              class="absolute w-6 h-6">
            </iconify-icon>
          </button>
        </div>

        <Form
          ref="formRef"
          :validation-schema="joinGroupSchema"
          @submit="submitForm">
          <!-- GROUP SETTINGS -->
          <div>
            <!-- GROUP NAME -->
            <div class="py-4 form-control">
              <span class="text-base text-black">Group name</span>
              <Field
                name="channelName"
                class="py-2 neobrutalist-input"
                placeholder="Enter a group name" />
              <ErrorMessage
                class="text-base font-normal text-red-600"
                name="channelName" />
              <div v-if="channelNameError" class="text-red-500">
                {{ channelNameError }}
              </div>
            </div>
            <!-- PASSWORD -->
            <div class="py-4 form-control" v-if="passwordRequired">
              <span class="text-base text-black">Password</span>
              <Field
                name="password"
                class="py-2 neobrutalist-input"
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
              class="my-4 mb-2 text-black bg-white border-2 border-black btn hover:bg-black hover:border-black hover:text-white"
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

import { Form, Field } from 'vee-validate'
import { onBeforeMount, ref, toRefs, watch } from 'vue'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import { useChannelStore } from '@/stores/ChannelStore'
import { ApiError } from '@/utils/fetcher'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()

const channelNameError = ref<string | null>(null)
const emit = defineEmits(['update:showModal'])
const passwordRequired = ref<boolean>(false)
const passwordError = ref<string | null>(null)
const props = defineProps({
  showModal: { type: Boolean }
})
const router = useRouter()
const toast = useToast()

const { showModal } = toRefs(props)

const joinGroupSchema = {
  channelName: 'required|min:4|max:50'
}

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

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

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, string>): Promise<void> => {
  const { channelName, password } = values

  if (channelName === null) {
    channelNameError.value = 'You need to provide a channel name.'
    return
  }

  try {
    if (passwordRequired.value && !password) {
      passwordError.value = 'A password is required for this channel.'
      return
    } else if (
      passwordRequired.value &&
      (password.length < 4 || password.length > 50)
    ) {
      passwordError.value = 'The password must be 4 and 50 characters.'
      return
    }

    const channel = await channelStore.joinGroup(channelName, password)
    passwordError.value = null
    passwordRequired.value = false
    closeModal()
    await router.push(`/chat/${channel.id}`)
  } catch (err: any) {
    if (err instanceof ApiError) {
      if (err.code === 'MissingGroupPassword') {
        passwordRequired.value = true
      } else if (err.code === 'InvalidGroupPassword') {
        passwordError.value = 'Invalid password'
      } else if (err.code === 'UserIsBanned') {
        toast.error('You are banned from this group.')
      } else if (err.code === 'ChannelNotFound') {
        toast.error('Channel not found.')
      } else if (err.code === 'UserAlreadyInChannel') {
        toast.error('You are already a member of this channel.')
      } else {
        toast.error('Something went wrong')
      }
    }
  }
  channelNameError.value = null
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
