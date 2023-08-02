<template>
  <div class="border-black border-2 mt-1 ml-1 p-5">
    <form @submit.prevent="sendMessage" class="flex justify-between gap-2">
      <div class="w-full">
        <textarea
          v-model="input"
          id="prompt-textarea"
          ref="myTextarea"
          @input="autoResize"
          tabindex="0"
          data-id="root"
          rows="1"
          placeholder="Send a message"
          class="h-full m-0 w-full outline-none overflow-auto resize-none bg-transparent max-h-[200px]"></textarea>
      </div>
      <div class="flex self-end">
        <button
          type="submit"
          class="btn bg-white self-end border-2 border-black text-black hover:bg-black hover:border-black hover:text-white">
          Send
        </button>
      </div>
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
