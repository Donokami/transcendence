<template>
  <li>
    <a class="flex p-1" :class="{ active: is_selected }" @click="$emit('select-user')">
      <div class="mx-auto md:mx-0 w-16 flex justify-center items-center">
        <svg v-if="user_profile_picture" :src="user_profile_picture" class="h-[60px] w-12"></svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="h-[60px] w-12"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>
      <span class="hidden md:block">{{ user_name }}</span>
    </a>
  </li>
</template>

<script lang="ts">
export default {
  name: 'ChatUserSelector',
  props: {
    user_name: String,
    user_profile_picture: {
      type: String,
      default: ''
    },
    is_selected: Boolean
  }
}
</script>
