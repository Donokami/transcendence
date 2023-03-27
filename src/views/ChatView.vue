<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <site-header></site-header>
    <div class="flex ...">
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify min-w-min w-1/4"
      >
        <chat-discussions-list></chat-discussions-list>
      </div>
      <div
        class="border-black border-2 flex flex-col mx-2 my-3 mt-1 p-5 text-justify w-3/4 justify-between"
      >
        <chat-discussion></chat-discussion>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import SiteHeader from '../components/SiteHeader.vue'
import ChatDiscussionsList from '../components/ChatDiscussionsList.vue'
import ChatDiscussion from '../components/ChatDiscussion.vue'

export default {
  name: 'ChatView',
  components: {
    SiteHeader,
    ChatDiscussionsList,
    ChatDiscussion
  }
}
</script>
