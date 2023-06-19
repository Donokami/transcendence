import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '../views/AuthView.vue'
import ChatView from '../views/ChatView.vue'
import GameView from '../views/GameView.vue'
import HomeView from '../views/HomeView.vue'
import StatsView from '../views/StatsView.vue'
import ProfileView from '../views/ProfileView.vue'

const routes = [
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
    path: '/:catchAll(.*)*',
    redirect: { name: 'auth' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkExactActiveClass: 'bg-zinc-900 text-white'
})

// router.beforeEach((to, from, next) => {})

export default router
