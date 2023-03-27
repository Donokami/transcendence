<template>
  <h2 class="text-2xl font-bold mb-8 text-black">Watch a game</h2>
  <div class="grid grid-cols-6 md:grid-cols-10 gap-4">
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 1</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 2</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 3</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 4</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 5</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 6</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 7</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 8</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 9</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 10</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 11</button>
    </div>
    <div class="flex flex-row justify-center w-full">
      <button class="neobrutalist-box m-2.5 px-2 py-2" @click="selectRoom">Room 12</button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HomeRoomSelection',
  methods: {
    selectRoom() {
      // handle the click event for Room buttons
    }
  }
}
</script>
