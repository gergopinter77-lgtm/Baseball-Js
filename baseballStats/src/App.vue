<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Atbat from '@/components/icons/atbat.svg?component'
import UserMenu from '@/components/UserMenu.vue'
import { useAuth } from '@/components/composables/useAuth'

const { user, isAdmin } = useAuth()

const links = [
  { to: '/', label: 'Home' },
  { to: '/compare', label: 'Compare' },
  { to: '/standings', label: 'Standings' },
]
</script>

<template>
  <header class="sticky top-0 z-30 bg-primary-gradient/90 backdrop-blur border-b border-white/5">
    <nav class="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6">
      <RouterLink to="/" class="flex items-center gap-2 shrink-0">
        <Atbat class="w-10 h-10" />
      </RouterLink>

      <div class="flex-1 flex items-center gap-1 text-sm font-medium">
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
      <RouterLink v-else to="/login" class="btn-primary h-9! px-4! text-sm">Log in</RouterLink>
    </nav>
  </header>

  <div class="min-h-[calc(100vh-4rem)] bg-linear-to-b from-primary/60 to-primary-gradient">
    <RouterView />
  </div>
</template>
