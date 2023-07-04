<template>
  <h2 class="text-2xl font-bold mb-8 text-black">Watch a game</h2>
  <div class="grid grid-cols-6 md:grid-cols-10 gap-4">
    <div v-for="room in rooms" :key="room" class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom()">{{ room }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const rooms = ref([
  'Room 1',
  'Room 2',
  'Room 3',
  'Room 4',
  'Room 5',
  'Room 6',
  'Room 7',
  'Room 8',
  'Room 9',
  'Room 10',
  'Room 11',
  'Room 12'
]);

const selectRoom = () => {
  // handle the click event for Room buttons
}
</script>