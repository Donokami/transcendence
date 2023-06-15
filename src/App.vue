<template>
  <div class="bg-white min-h-[calc(100vh-92px)] flex flex-col">
    <router-view></router-view>
  </div>
  <app-footer class="bg-zinc-900 py-4 px-6 relative text-white"></app-footer>
</template>

<script>
import AppFooter from "./components/AppFooter.vue";

export default {
  name: "App",
  components: {
    AppFooter,
  },
  data() {
    return {
      isRegisterForm: false,
    };
  },
};
</script>
