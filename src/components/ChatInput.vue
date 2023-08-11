<template>
  <div class="border-black border-x-2 border-b-2 px-5 py-4">
    <form @submit.prevent="sendMessage" class="flex justify-between gap-4">
      <div class="w-full mt-0.5">
        <textarea
          v-model="input"
          id="prompt-textarea"
          ref="myTextarea"
          @input="autoResize"
          @keydown.enter.prevent="sendMessage"
          tabindex="0"
          data-id="root"
          rows="1"
          placeholder="Type your message here"
          class="h-full m-0 w-full outline-none overflow-auto resize-none bg-transparent max-h-[100px]"></textarea>
      </div>
      <button
        type="submit"
        class="flex self-end btn m-0 p-0 min-h-0 h-8 px-0 mx-0 w-0 relative bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600 -mr-1">
        <iconify-icon
          icon="lucide:send-horizonal"
          class="h-6 w-6 self-center absolute">
        </iconify-icon>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { nextTick, onMounted, ref, type Ref } from 'vue'

import { useChannelStore } from '@/stores/ChannelStore.js'

const channelStore = useChannelStore()
const input = ref('')
const myTextarea: Ref<HTMLElement | null> = ref(null)

onMounted(() => {
  autoResize()
})

async function sendMessage(): Promise<void> {
  if (input.value.trim() !== '') {
    await channelStore.sendMessage(input.value)
    input.value = ''
    await nextTick()
    autoResize()
  }
}

function autoResize(): void {
  if (myTextarea.value) {
    ;(myTextarea.value as HTMLTextAreaElement).style.height = 'auto'
    ;(myTextarea.value as HTMLTextAreaElement).style.height = `${
      (myTextarea.value as HTMLTextAreaElement).scrollHeight
    }px`
  }
}
</script>
