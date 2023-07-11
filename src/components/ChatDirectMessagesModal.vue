<template>
  <input type="checkbox" id="my-modal-3" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box rounded-none">
      <div class="flex items-center justify-end">
        <label
          for="my-modal-3"
          class="btn bg-white border-black border-2 text-black hover:bg-black hover:border-black hover:text-white"
          >X</label
        >
      </div>
      <div class="py-4">
        <h3 class="font-bold text-lg">Who do you want to a send a DM to ?</h3>
      </div>
      <div class="collapse collapse-arrow border-2 border-black rounded-none">
        <input type="checkbox" />
        <div class="collapse-title text-base">Select a friend</div>
        <div class="collapse-content text-base">
          <ul class="menu bg-base-100 w-full">
            <li v-for="friend in userStore.loggedUser.friends" :key="friend">
              <a class="flex p-1">
                <span class="block">{{ friend }}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/UserStore.js'

const userStore = useUserStore() 
</script>
