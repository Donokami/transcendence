<template>
  <div class="navbar bg-base-100">
    <div class="navbar-start p-[6px] border-2 border-black border-r-0 flex-grow md:hidden">
      <div class="dropdown flex">
        <label tabindex="0" class="p-[14px] hover:bg-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h8m-8 6h16"
            />
          </svg>
        </label>
        <ul tabindex="0" class="menu menu-compact dropdown-content shadow bg-base-100">
          <li><router-link to="/home">Home</router-link></li>
          <li><router-link to="/chat">Chat</router-link></li>
          <li><router-link to="/stats">Stats</router-link></li>
        </ul>
      </div>
    </div>
    <div class="navbar-start border-2 border-black border-r-0 flex-grow hidden md:flex">
      <ul class="menu menu-horizontal">
        <li>
          <router-link to="/home" class="h-[60px] border-black border-r-2">Home</router-link>
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
          <div class="w-16 flex justify-center items-center">
            <svg
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
        </label>
        <ul
          tabindex="0"
          class="menu menu-compact dropdown-content shadow bg-base-100 -ml-[75px] mt-1"
        >
          <li><router-link to="/profile">Profile</router-link></li>
          <li><a>Logout</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>
