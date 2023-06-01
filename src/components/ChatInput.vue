<template>
  <div>
    <input
      class="w-full text-black outline-none"
      name="message"
      type="message"
      placeholder="Type your message"
    />
  </div>
</template>

<script lang="ts">
import type { Message } from '../types/Message.js'
import { useUserStore } from '@/stores/UserStore.js'

export default {
  name: 'ChatDiscussion',
  data() {
    return { userStore: useUserStore() }
  },
  computed: {}
}
</script>
