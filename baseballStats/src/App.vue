<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import Atbat from '@/components/icons/atbat.svg?component'
import UserMenu from '@/components/UserMenu.vue'
import { useAuth } from '@/components/composables/useAuth'

const { user, isAdmin } = useAuth()

// True while a page is opening, so a slow first click shows the loading bar instead of looking stuck
// (only after a short wait, so pages that open right away don't flash it)
const router = useRouter()
const navigating = ref(false)
let showTimer = null
function stopLoading() {
  clearTimeout(showTimer)
  navigating.value = false
}
router.beforeEach(() => {
  clearTimeout(showTimer)
  showTimer = setTimeout(() => (navigating.value = true), 150)
})
router.afterEach(stopLoading)
router.onError(stopLoading)

const links = [
  { to: '/', label: 'Home' },
  { to: '/compare', label: 'Compare' },
  { to: '/standings', label: 'Standings' },
  { to: '/matches', label: 'Matches' },
  { to: '/fantasy', label: 'Fantasy' },
]
</script>

<template>
  <header class="sticky top-0 z-30 bg-primary-gradient/90 backdrop-blur border-b border-white/5">
    <nav class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-3 md:gap-6">
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <Atbat class="w-10 h-10" />
      </RouterLink>

      <div class="flex-1 min-w-0 flex items-center gap-1 text-sm font-medium overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="px-3 py-2 rounded-md text-text-nav hover:text-white hover:bg-white/5 transition-colors"
          exact-active-class="text-white! bg-white/8"
        >
          {{ link.label }}
        </RouterLink>
        <RouterLink
          v-if="isAdmin"
          to="/admin"
          class="px-3 py-2 rounded-md text-text-nav hover:text-white hover:bg-white/5 transition-colors"
          exact-active-class="text-white! bg-white/8"
        >
          Admin
        </RouterLink>
      </div>

      <UserMenu v-if="user" />
      <RouterLink v-else to="/login" class="btn-primary h-9! px-4! text-sm shrink-0">Log in</RouterLink>
    </nav>

    <!-- Loading bar along the bottom of the header -->
    <div v-if="navigating" class="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden" role="progressbar" aria-label="Loading page">
      <div class="h-full w-1/3 bg-secondary-dark animate-[nav-loading_1s_ease-in-out_infinite]" />
    </div>
  </header>

  <div class="min-h-[calc(100vh-4rem)] bg-linear-to-b from-primary/60 to-primary-gradient">
    <RouterView />
  </div>
</template>
