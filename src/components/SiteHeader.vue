<template>
  <div class="mx-auto w-full border-black border-y-2">
    <div class="navbar mx-auto p-0 items-stretch bg-base-100 text-black z-40">
      <div class="navbar-start flex-grow md:hidden">
        <div class="dropdown flex h-full w-full items-center">
          <label
            tabindex="0"
            class="hover:bg-gray-300 flex h-full items-center justify-center w-14 cursor-pointer">
            <iconify-icon icon="ri:menu-2-line" class="h-6 w-6"></iconify-icon>
          </label>
          <ul
            tabindex="0"
            class="menu menu-compact dropdown-content shadow bg-base-100 z-40">
            <li>
              <router-link to="/" class="rounded-none">Home</router-link>
            </li>
            <li>
              <router-link to="/chat" class="rounded-none">Chat</router-link>
            </li>
            <li>
              <router-link to="/stats" class="rounded-none">Stats</router-link>
            </li>
          </ul>
        </div>
      </div>
      <div class="navbar-start flex-grow hidden md:flex">
        <ul class="menu menu-horizontal p-0 h-full">
          <li>
            <router-link
              to="/"
              class="flex h-full rounded-none"
              active-class="active-link"
              >Home</router-link
            >
          </li>
          <li>
            <router-link
              to="/chat"
              class="flex h-full rounded-none"
              active-class="active-link"
              >Chat</router-link
            >
          </li>
          <li>
            <router-link
              to="/stats"
              class="flex h-full rounded-none"
              active-class="active-link"
              >Stats</router-link
            >
          </li>
        </ul>
      </div>
      <div class="navbar-center border-x-2 border-black">
        <a class="p-2 font-bold text-xl">__TRANSCENDENCE__</a>
      </div>
      <div class="navbar-end items-stretch flex-grow">
        <div class="dropdown flex items-center border-x-2 border-black">
          <label
            tabindex="0"
            class="flex items-center h-full cursor-pointer hover:bg-gray-300">
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
            class="menu menu-compact dropdown-content shadow bg-base-100 -ml-4 mt-8">
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
