<template>
  <div>
    <input type="checkbox" id="my-modal-13" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box rounded-none border-2 border-black">
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
        <!-- FORM -->
        <!-- UPDATE PASSWORD BUTTON -->
        <div class="modal-action">
          <button
            class="btn bg-white border-2 border-black my-4 mb-2 text-black hover:bg-black hover:border-black hover:text-white"
            type="submit"
            @click="closeModal">
            Update Password
          </button>
        </div>
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
import { ref, toRefs, watch } from 'vue'

import { useChannelStore } from '@/stores/ChannelStore'
import { useUserStore } from '@/stores/UserStore.js'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const channelStore = useChannelStore()
const userStore = useUserStore()

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
  if (passwordRequired.value && (!password.value || passwordError.value)) return
  const modalElement = document.getElementById(
    'my-modal-13'
  ) as HTMLInputElement
  if (modalElement) {
    modalElement.checked = !modalElement.checked
    emit('update:showModal', modalElement.checked)
  }
}
</script>
