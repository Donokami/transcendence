<template>
  <div class="navbar bg-base-100 max-w-screen-xl min-w-[95%] mx-auto text-black">
    <div class="navbar-start p-[6px] border-2 border-black border-r-0 flex-grow md:hidden">
      <div class="dropdown flex">
        <label tabindex="0" class="p-[14px] hover:bg-gray-300">
          <iconify-icon icon="ri:menu-2-line" class="h-5 w-5"></iconify-icon>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content shadow bg-base-100">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/chat">Chat</router-link></li>
          <li><router-link to="/stats">Stats</router-link></li>
        </ul>
      </div>
    </div>
    <div class="navbar-start border-2 border-black border-r-0 flex-grow hidden md:flex">
      <ul class="menu menu-horizontal">
        <li>
          <router-link to="/" class="h-[60px] border-black border-r-2">Home</router-link>
        </li>
        <li><router-link to="/chat" class="h-[60px] border-black border-r-2">Chat</router-link></li>
        <li>
          <router-link to="/stats" class="h-[60px] border-black border-r-0">Stats</router-link>
        </li>
      </ul>
    </div>
    <div class="navbar-center border-2 border-black">
      <a class="p-4 font-bold text-xl">__TRANSCENDENCE__</a>
    </div>
    <div class="navbar-end border-2 border-black border-l-0 flex-grow">
      <div class="dropdown flex">
        <label tabindex="0" class="hover:bg-gray-300">
          <div class="flex justify-center items-center">
            <div class="h-[60px] w-20">
              <div class="h-full flex items-center justify-center">
                <img
                  v-if="userStore.loggedUser && userStore.loggedUser.profilePicture"
                  :src="pictureSrc"
                  class="object-cover h-12 w-12 rounded-full"
                />
                <iconify-icon v-else icon="ri:account-circle-line" class="h-12 w-12"></iconify-icon>
              </div>
            </div>
          </div>
        </label>
        <ul
          v-if="userStore.loggedUser"
          tabindex="0"
          class="menu menu-compact dropdown-content shadow bg-base-100 -ml-[75px] mt-1"
        >
          <li><router-link :to="{ name: 'profile', params: { id: userStore.loggedUser.id }}">Profile</router-link></li>
          <li><a @click="logout">Logout</a></li>
        </ul>
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
  import { computed} from 'vue';

  // ******************** //
  // VARIABLE DEFINITIONS //
  // ******************** //

  const router = useRouter()
  const userStore = useUserStore()

  const pictureSrc = computed(() => {
      const profilePicture = userStore.loggedUser.profilePicture;
      if (!profilePicture) return null;

      if (profilePicture.includes('cdn.intra.42')) {
        return profilePicture;
      } else {
        return 'http://localhost:3000/' + profilePicture;
      }
  });

  // ******************** //
  // FUNCTION DEFINITIONS //
  // ******************** //

  // ****** //
  // logout //
  // ****** //

  const logout = async () => {
    await userStore.signOut()
    router.push('/auth')
  }
</script>
