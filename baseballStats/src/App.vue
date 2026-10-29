<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Atbat from '@/components/icons/atbat.svg?component'
import UserMenu from '@/components/UserMenu.vue'
import { useAuth } from '@/components/composables/useAuth'
import { useFriends } from '@/components/composables/useFriends'
import { useNavigationLoading } from '@/components/composables/useNavigationLoading'

const { user, isAdmin } = useAuth()
const { incoming } = useFriends()
const { navigating } = useNavigationLoading()

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

      <template v-if="user">
        <RouterLink
          to="/friends"
          class="relative shrink-0 flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-text-nav hover:text-white hover:bg-white/5 transition-colors"
          exact-active-class="text-white! bg-white/8"
          title="Friends"
        >
          <!-- Two people icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5" aria-hidden="true">
            <circle cx="9" cy="8" r="3.5" />
            <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" />
            <path d="M18.5 14.2a6.5 6.5 0 0 1 3 5.8" />
          </svg>
          <span class="hidden sm:inline">Friends</span>
          <span
            v-if="incoming.length"
            class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-secondary-dark text-white text-[11px] font-bold flex items-center justify-center"
            :aria-label="`${incoming.length} friend requests`"
          >
            {{ incoming.length }}
          </span>
        </RouterLink>
        <UserMenu />
      </template>
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
