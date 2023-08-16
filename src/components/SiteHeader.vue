<template>
  <div class="w-full mx-auto border-black border-y-2 z-[1000]">
    <div class="z-40 items-stretch p-0 mx-auto text-black navbar bg-base-100">
      <div class="flex-grow navbar-start md:hidden">
        <div class="flex items-center w-full h-full dropdown">
          <label
            tabindex="0"
            class="flex items-center justify-center h-full cursor-pointer hover:bg-gray-300 w-14">
            <iconify-icon icon="ri:menu-2-line" class="w-6 h-6"></iconify-icon>
          </label>
          <ul
            tabindex="0"
            class="z-40 mt-[12.25rem] ml-2 shadow menu menu-compact dropdown-content bg-base-100 w-fit p-0 border-2 border-black">
            <li class="w-full">
              <router-link to="/" class="px-8 rounded-none">Home</router-link>
            </li>
            <li class="w-full">
              <router-link to="/chat" class="px-8 rounded-none"
                >Chat</router-link
              >
            </li>
            <li class="w-full">
              <router-link to="/stats" class="px-8 rounded-none"
                >Stats</router-link
              >
            </li>
          </ul>
        </div>
      </div>
      <div class="flex-grow hidden navbar-start md:flex">
        <ul class="h-full p-0 menu menu-horizontal">
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
      <div class="text-white bg-black border-black navbar-center border-x-2">
        <router-link to="/" class="p-2 px-6 text-sm font-bold sm:text-xl">
          __TRANSCENDENCE__
        </router-link>
      </div>
      <div class="items-stretch flex-grow navbar-end">
        <div class="flex items-center border-black dropdown">
          <label
            tabindex="0"
            class="flex items-center h-full cursor-pointer hover:bg-gray-300">
            <div class="flex items-center justify-center">
              <div class="flex items-center justify-center w-20">
                <img
                  v-if="
                    userStore.loggedUser &&
                    userStore.loggedUser.profilePicture &&
                    pictureSrc
                  "
                  :src="pictureSrc"
                  class="object-cover w-12 h-12 rounded-full" />
                <iconify-icon
                  v-else
                  icon="ri:account-circle-line"
                  class="w-12 h-12"></iconify-icon>
              </div>
            </div>
          </label>
          <ul
            v-if="userStore.loggedUser"
            tabindex="0"
            class="mt-40 ml-[-2.8rem] shadow menu dropdown-content bg-base-100 border-2 border-black p-0 w-fit z-[1000]">
            <li class="w-fit">
              <router-link
                :to="{
                  name: 'profile',
                  params: { id: userStore.loggedUser.id }
                }"
                class="px-8 rounded-none"
                >Profile</router-link
              >
            </li>
            <li class="w-fit">
              <a class="w-full px-8 rounded-none" @click="logout">Logout</a>
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
    return import.meta.env.VITE_APP_BASE_URL + '/' + profilePicture
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
