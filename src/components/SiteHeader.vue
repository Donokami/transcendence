<template>
  <div class="mx-auto w-full">
    <div
      class="navbar max-w-screen-xl mx-auto p-0 items-stretch bg-base-100 text-black z-40">
      <div
        class="navbar-start border-2 border-black border-r-0 flex-grow md:hidden">
        <div class="dropdown flex">
          <label tabindex="0" class="p-[14px] hover:bg-gray-300">
            <iconify-icon icon="ri:menu-2-line" class="h-5 w-5"></iconify-icon>
          </label>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content shadow bg-base-100">
            <li>
              <router-link to="/" class="border-black rounded-none"
                >Home</router-link
              >
            </li>
            <li>
              <router-link to="/chat" class="border-black rounded-none"
                >Chat</router-link
              >
            </li>
            <li>
              <router-link to="/stats" class="border-black rounded-none"
                >Stats</router-link
              >
            </li>
          </ul>
        </div>
      </div>
      <div
        class="navbar-start border-black border-2 border-t-2 flex-grow hidden md:flex">
        <ul class="menu menu-horizontal p-0 h-full">
          <li>
            <router-link
              to="/"
              class="flex border-black border-r-2 h-full rounded-none"
              active-class="active-link"
              >Home</router-link
            >
          </li>
          <li>
            <router-link
              to="/chat"
              class="flex border-black border-r-2 h-full rounded-none"
              active-class="active-link"
              >Chat</router-link
            >
          </li>
          <li>
            <router-link
              to="/stats"
              class="flex border-black border-r-2 h-full rounded-none"
              active-class="active-link"
              >Stats</router-link
            >
          </li>
        </ul>
      </div>
      <div class="navbar-center border-y-2 border-r-2 border-black">
        <a class="p-2 font-bold text-xl">__TRANSCENDENCE__</a>
      </div>
      <div class="navbar-end items-stretch border-y-2 border-black flex-grow">
        <div class="dropdown flex items-center border-x-2 border-black">
          <label tabindex="0" class="hover:bg-gray-300">
            <div class="flex justify-center items-center">
              <div class="flex items-center justify-center w-20">
                <img
                  v-if="
                    userStore.loggedUser &&
                    userStore.loggedUser.profilePicture &&
                    pictureSrc
                  "
                  :src="pictureSrc"
                  class="object-cover h-12 w-12 rounded-full" />
                <iconify-icon
                  v-else
                  icon="ri:account-circle-line"
                  class="h-12 w-12"></iconify-icon>
              </div>
            </div>
          </label>
          <ul
            v-if="userStore.loggedUser"
            tabindex="0"
            class="menu menu-compact dropdown-content shadow bg-base-100 -ml-[75px] mt-1">
            <li>
              <router-link
                :to="{
                  name: 'profile',
                  params: { id: userStore.loggedUser.id }
                }"
                class="border-black rounded-none"
                >Profile</router-link
              >
            </li>

            <li>
              <a class="border-black rounded-none" @click="logout">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ******* //
// IMPORTS //
// ******* //

import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/UserStore'
import { computed } from 'vue'

// ******************** //
// VARIABLE DEFINITIONS //
// ******************** //

const router = useRouter()
const userStore = useUserStore()

const pictureSrc = computed(() => {
  const profilePicture = userStore.loggedUser?.profilePicture
  if (!profilePicture) return null

  if (profilePicture.includes('cdn.intra.42')) {
    return profilePicture
  } else {
    return 'http://localhost:3000/' + profilePicture
  }
})

// ******************** //
// FUNCTION DEFINITIONS //
// ******************** //

// ****** //
// logout //
// ****** //

const logout = async (): Promise<void> => {
  await userStore.signOut()
  await router.push('/auth')
}
</script>

<style scoped>
.active-link {
  background-color: black !important;
  color: white !important;
}
</style>
