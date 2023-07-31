<template>
  <div>
    <input type="checkbox" id="my-modal-3" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none">
        <Form ref="formRef" @submit="submitForm">
          <!-- CLOSING CROSS -->
          <div class="flex items-center justify-end">
            <button
              class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
              @click="closeModal()">
              X
            </button>
          </div>
          <!-- TITLE-->
          <div class="py-4 justify-start">
            <h3 class="font-bold text-lg">
              Enter the name of the group you want to join :
            </h3>
          </div>
          <!-- GROUP SETTINGS -->
          <div>
            <!-- GROUP NAME -->
            <div class="form-control py-4">
              <span class="text-base text-black">Group name</span>
              <input
                v-model="channelName"
                class="neobrutalist-input py-2"
                placeholder="Enter a group name" />
              <div v-if="channelNameError" class="text-red-500">
                {{ channelNameError }}
              </div>
            </div>
          </div>
          <!-- JOIN GROUP BUTTON -->
          <div class="modal-action">
            <button
              class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
              type="submit"
              @click="closeModal">
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
const password = ref<string | null>(null)
const passwordRequired = ref<boolean>(false)
const passwordError = ref<string | null>(null)
const props = defineProps({
  showModal: { type: Boolean }
})

const { loggedUser } = storeToRefs(userStore)
const { showModal } = toRefs(props)

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
}

// **************** //
// joinGroupChannel //
// **************** //

const joinGroupChannel = async (): Promise<void> => {
  if (loggedUser.value == null) {
    return
  }

  try {
  } catch (error) {
    console.error(
      `[ChatJoinGroupModal] - Failed to create group ! Error: `,
      error
    )
    return
  }
}

// ********** //
// submitForm //
// ********** //

const submitForm = async (values: Record<string, any>) => {
  if (!channelName.value.length) {
    channelNameError.value = 'You need to provide a channel name.'
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

  joinGroupChannel()
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
