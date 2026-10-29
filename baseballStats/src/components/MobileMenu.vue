<template>
    <!-- Phones only: page links and account behind a hamburger button -->
    <div class="md:hidden">
        <button
            class="relative w-10 h-10 flex items-center justify-center rounded-md text-white hover:bg-white/5 cursor-pointer"
            :aria-expanded="open"
            aria-controls="mobile-menu"
            :aria-label="open ? 'Close menu' : 'Open menu'"
            @click="toggle"
        >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="w-6 h-6" aria-hidden="true">
                <path v-if="open" d="M6 6l12 12M18 6 6 18" />
                <path v-else d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span v-if="!open && requests" class="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary-dark" aria-hidden="true" />
        </button>

        <!-- At page level: the header's blur would otherwise pin "fixed" to the header -->
        <Teleport v-if="open" to="body">
            <div class="md:hidden fixed inset-0 top-16 z-20 bg-black/50" @click="close" />

            <nav id="mobile-menu" class="md:hidden fixed inset-x-0 top-16 z-30 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-primary border-b border-white/10 shadow-2xl">
                <!-- Who is logged in -->
                <RouterLink v-if="user" to="/profile" class="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                    <UserAvatar :photo="profile?.photoURL" :name="displayName" class="w-10 h-10" />
                    <span class="min-w-0">
                        <span class="block font-semibold truncate">{{ displayName }}</span>
                        <span class="block text-sm text-primary-light truncate">{{ user.email }}</span>
                    </span>
                </RouterLink>

                <ul class="py-2">
                    <li v-for="link in links" :key="link.to">
                        <RouterLink :to="link.to" :class="ITEM" exact-active-class="text-white! bg-white/8">{{ link.label }}</RouterLink>
                    </li>
                    <li v-if="user">
                        <RouterLink to="/friends" :class="ITEM" exact-active-class="text-white! bg-white/8">
                            Friends
                            <span v-if="requests" class="ml-auto min-w-6 h-6 px-1.5 rounded-full bg-secondary-dark text-white text-xs font-bold flex items-center justify-center">
                                {{ requests }}
                            </span>
                        </RouterLink>
                    </li>
                    <li v-if="isAdmin">
                        <RouterLink to="/admin" :class="ITEM" exact-active-class="text-white! bg-white/8">Admin</RouterLink>
                    </li>
                </ul>

                <!-- Account -->
                <div class="border-t border-white/10 p-4">
                    <div v-if="user" class="grid grid-cols-2 gap-3">
                        <RouterLink to="/profile" class="btn-ghost">My profile</RouterLink>
                        <button class="btn-ghost text-secondary!" @click="logoutAndLeave">Log out</button>
                    </div>
                    <div v-else class="grid grid-cols-2 gap-3">
                        <RouterLink :to="loginLink" class="btn-primary">Log in</RouterLink>
                        <RouterLink to="/register" class="btn-ghost">Create account</RouterLink>
                    </div>
                </div>
            </nav>
        </Teleport>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'
import { useAuth } from './composables/useAuth'
import { useLoginGate, useLogout } from './composables/useLoginGate'
import { useMobileMenu } from './composables/useMobileMenu'

defineProps({
    // [{ to, label }]
    links: { type: Array, required: true },
    // Friend requests waiting for an answer
    requests: { type: Number, default: 0 },
})

const ITEM = 'flex items-center gap-3 px-4 py-3 text-base font-medium text-text-nav hover:text-white hover:bg-white/5'

const { user, profile, isAdmin } = useAuth()
const { loginLink } = useLoginGate()
const { logoutAndLeave } = useLogout()
const { open, toggle, close } = useMobileMenu()

const displayName = computed(() => profile.value?.displayName || user.value?.email || '')
</script>
