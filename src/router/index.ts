import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '../stores/UserStore'
import AuthView from '../views/AuthView.vue'
import ChatView from '../views/ChatView.vue'
import GameView from '../views/GameView.vue'
import HomeView from '../views/HomeView.vue'
import StatsView from '../views/StatsView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes: RouteRecordRaw[] = [
  {
    component: AuthView,
    path: '/auth',
    name: 'auth'
  },
  {
    component: HomeView,
    path: '/home',
    name: 'home'
  },
  {
    component: ChatView,
    path: '/chat',
    name: 'chat'
  },
  {
    component: GameView,
    path: '/game',
    name: 'game'
  },
  {
    component: StatsView,
    path: '/stats',
    name: 'stats'
  },
  {
    component: ProfileView,
    path: '/profile',
    name: 'profile'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'auth' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'bg-zinc-900 text-white'
})

router.beforeEach(async (to, from, next) => {
  if (to.name === 'game') {
    next()
    return
  }
  const userStore = useUserStore()
  const user = await userStore.fetchUser()
  console.log(user)
  if (to.name !== 'auth' && user !== null) {
    next({ name: 'auth' })
  } else next()
})

export default router
