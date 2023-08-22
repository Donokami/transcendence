<template>
  <div class="px-5 py-4 border-b-2 border-black border-x-2">
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
          :disabled="!channel || channel.isMuted"
          :placeholder="
            channel?.isMuted ? 'You are muted' : 'Type your message here'
          "
          class="h-full m-0 w-full outline-none overflow-auto resize-none bg-transparent max-h-[100px]"></textarea>
      </div>
      <button
        type="submit"
        :disabled="!channel || channel.isMuted"
        class="relative flex self-end w-0 h-8 min-h-0 p-0 px-0 m-0 mx-0 -mr-1 btn bg-base-100 border-base-100 hover:bg-base-100 hover:border-base-100 hover:text-zinc-600">
        <iconify-icon
          icon="lucide:send-horizonal"
          class="absolute self-center w-6 h-6">
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
import type { Channel } from '@/types'

const channelStore = useChannelStore()
const input = ref('')
const myTextarea: Ref<HTMLElement | null> = ref(null)
const channel: Ref<Channel | null> = ref(null)

onMounted(() => {
  channel.value = channelStore.getChannel()
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
