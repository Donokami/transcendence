<template>
  <div>
    <input type="checkbox" id="my-modal-13" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none border-2 border-black">
        <!-- FORM -->
        <Form ref="formRef" @submit="submitForm">
          <!-- TITLE -->
          <div class="text-xl flex justify-between">
            <h1>Manage password</h1>
            <button
              @click="closeModal()"
              class="btn btn-square border-2 border-black hover:border-2 hover:border-black btn-sm relative">
              <iconify-icon
                icon="material-symbols:close"
                class="h-6 w-6 absolute">
              </iconify-icon>
            </button>
          </div>
          <div class="form-control mt-6">
            <label class="label cursor-pointer px-0">
              <span class="text-base text-black">Change password</span>
              <input
                type="checkbox"
                class="checkbox border-2 border-black rounded-none"
                @click="setPasswordRequirement()" />
            </label>
            <!-- PASSWORD INPUT -->
            <input
              v-model="password"
              v-if="passwordRequired === true"
              class="neobrutalist-input py-2 text-sm"
              placeholder="Choose a new password for your group" />
            <div v-if="passwordError" class="text-red-500">
              {{ passwordError }}
            </div>
          </div>
          <div class="modal-action">
            <!-- UPDATE PASSWORD BUTTON -->
            <button
              v-if="passwordRequired === true"
              class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
              type="submit"
              @click="changeGroupPassword">
              Update Password
            </button>
            <!-- DELETE PASSWORD BUTTON -->
            <button
              v-if="passwordRequired === false"
              class="btn bg-red-400 border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
              type="submit"
              @click="deleteGroupPassword">
              Delete Password
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

import { ref, toRefs, watch } from 'vue'
import { Form } from 'vee-validate'
import { useToast } from 'vue-toastification'

import { storeToRefs } from 'pinia'

import { useChannelStore } from '@/stores/ChannelStore'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const emit = defineEmits(['update:showModal'])
const password = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const passwordRequired = ref<boolean>(false)
const props = defineProps({
  showModal: { type: Boolean }
})
const toast = useToast()

const { selectedChannel } = storeToRefs(channelStore)
const { showModal } = toRefs(props)

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ******************* //
// changeGroupPassword //
// ******************* //

const changeGroupPassword = async (): Promise<void> => {
  if (!password.value) {
    toast.error(`You must provide a password`)
    return
  }

  if (!selectedChannel.value) {
    toast.error(`Something went wrong`)
    return
  }

  try {
    await channelStore.changeGroupPassword(
      selectedChannel.value,
      password.value
    )
    toast.success(`Password changed successfully`)
    passwordError.value = null
  } catch (error) {
    toast.error(`Something went wrong`)
  }
}

// ********** //
// closeModal //
// ********** //

function closeModal(): void {
  if (passwordRequired.value && (!password.value || passwordError.value)) return
  const modalElement = document.getElementById(
    'my-modal-13'
  ) as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }
}

// ******************* //
// deleteGroupPassword //
// ******************* //

const deleteGroupPassword = async (): Promise<void> => {
  if (!selectedChannel.value) {
    toast.error(`Something went wrong`)
    return
  }

  try {
    await channelStore.deleteGroupPassword(selectedChannel.value)
    toast.success(`Password deleted successfully`)
  } catch (error) {
    toast.error(`Something went wrong`)
  }
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
}
// ********************* //
// VueJs LIFECYCLE HOOKS //
// ********************* //

watch(showModal, (newValue) => {
  const modalElement = document.getElementById(
    'my-modal-13'
  ) as HTMLInputElement
  if (modalElement) {
    modalElement.checked = newValue
  }
})
</script>
