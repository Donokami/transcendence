<template>
  <div class="max-w-screen-xl min-w-[95%] mx-auto text-black">
    <p>Prooooouuuut</p>
    <template v-if="room">
      <room-summary :room="room" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
// import { useGameStore } from '../stores/GameStore';
import RoomSummary from '@/components/RoomSummary.vue';
import { socket, room } from '@/includes/gameSocket';
// import { onMounted } from 'vue';

const route = useRoute()

socket.emit('room:join', route.params.id)

</script>
