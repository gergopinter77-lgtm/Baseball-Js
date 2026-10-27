import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import { useAuth } from '@/components/composables/useAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView,
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('../views/CompareView.vue'),
    },
    {
      path: '/standings',
      name: 'standings',
      component: () => import('../views/StandingsView.vue'),
    },
    {
      path: '/matches',
      name: 'matches',
      component: () => import('../views/MatchesView.vue'),
    },
    {
      path: '/match/:id',
      name: 'match',
      component: () => import('../views/MatchView.vue'),
    },
    {
      path: '/fantasy',
      name: 'fantasy',
      component: () => import('../views/FantasyView.vue'),
    },
    {
      path: '/player/:id',
      name: 'player',
      component: () => import('../views/PlayerView.vue'),
    },
    {
      path: '/team/:id',
      name: 'team',
      component: () => import('../views/TeamView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAdmin: true },
    },
    {
      path: '/friends',
      name: 'friends',
      component: () => import('../views/FriendsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Logged out users can't open account pages, and only admins can open admin pages
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.requiresAdmin) return true
  const { user, isAdmin, ready } = useAuth()
  await ready
  if (!user.value) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.requiresAdmin && !isAdmin.value) return { name: 'home' }
  return true
})

// Pages are downloaded the first time you open them. After a new deploy an open tab still asks for the
// old files, which are gone, so the click does nothing. Load the page fresh instead.
const OLD_FILE_ERRORS = /dynamically imported module|Importing a module script failed|MIME type/i
router.onError((error, to) => {
  if (OLD_FILE_ERRORS.test(error?.message ?? '') && to?.fullPath) window.location.assign(to.fullPath)
})

// Download every page in the background once the first one is shown, so later clicks open instantly
router.isReady().then(() => {
  const preload = () => {
    for (const route of router.getRoutes()) {
      const component = route.components?.default
      if (typeof component === 'function') component().catch(() => {})
    }
  }
  if ('requestIdleCallback' in window) requestIdleCallback(preload)
  else setTimeout(preload, 2000)
})

export default router
