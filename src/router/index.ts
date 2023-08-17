import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/UserStore'
import AuthView from '../views/AuthView.vue'
import ChatView from '../views/ChatView.vue'
import HomeView from '../views/HomeView.vue'
import MfaView from '../views/MfaView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ProfileView from '../views/ProfileView.vue'
import StatsView from '../views/StatsView.vue'
import RoomView from '../views/RoomView.vue'
import OnboardingView from '../views/OnboardingView.vue'

const routes: RouteRecordRaw[] = [
  {
    component: AuthView,
    path: '/auth',
    name: 'auth'
  },
  {
    component: MfaView,
    path: '/mfa',
    name: 'mfa'
  },
  {
    component: OnboardingView,
    path: '/onboarding',
    name: 'onboarding'
  },
  {
    component: HomeView,
    path: '/',
    name: 'home'
  },
  {
    component: ChatView,
    path: '/chat:catchAll(.*)',
    name: 'chat'
  },
  {
    component: StatsView,
    path: '/stats',
    name: 'stats'
  },
  {
    component: ProfileView,
    path: '/profile/:id',
    name: 'profile'
  },
  {
    component: RoomView,
    path: '/room/:id',
    name: 'room'
  },
  {
    component: NotFoundView,
    path: '/:pathMatch(.*)*',
    name: 'NotFound'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'bg-zinc-900 text-white'
})

router.beforeEach(async (to, from) => {
  const userStore = useUserStore()
  if (userStore.loggedUser === null) {
    await userStore.refreshUser()
  }
  if (
    to.name !== 'onboarding' &&
    userStore.loggedUser &&
    !userStore.loggedUser?.username
  ) {
    return { name: 'onboarding' }
  }
  if (
    to.name !== 'auth' &&
    to.name !== 'mfa' &&
    userStore.loggedUser === null
  ) {
    return { name: 'auth' }
  }
  if (to.name === 'onboarding' && userStore.loggedUser?.username) {
    return { name: 'home' }
  }
})

export default router
