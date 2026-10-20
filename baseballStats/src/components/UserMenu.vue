<template>
    <div class="relative">
        <button
            class="block rounded-full ring-2 ring-transparent hover:ring-secondary hover:cursor-pointer"
            :class="{ 'ring-secondary!': open }"
            title="Account"
            @click="open = !open"
        >
            <UserAvatar :photo="profile?.photoURL" :name="displayName" class="w-12 h-12 text-xl" />
        </button>

        <!-- Clicking anywhere outside the menu closes it -->
        <div v-if="open" class="fixed inset-0 z-20" @click="open = false"></div>

        <div
            v-if="open"
            class="absolute right-0 top-full mt-3 w-64 bg-primary-gradient border border-white/10 rounded-xl shadow-xl z-30 overflow-hidden text-base"
        >
            <div class="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <UserAvatar :photo="profile?.photoURL" :name="displayName" class="w-10 h-10" />
                <div class="min-w-0">
                    <p class="text-white font-semibold truncate">{{ displayName }}</p>
                    <p class="text-primary-light text-sm truncate">{{ user.email }}</p>
                </div>
            </div>
            <RouterLink to="/profile" class="block px-4 py-3 text-white hover:bg-white/10" @click="open = false">
                My profile
            </RouterLink>
            <RouterLink v-if="isAdmin" to="/admin" class="block px-4 py-3 text-white hover:bg-white/10" @click="open = false">
                Admin panel
            </RouterLink>
            <button class="w-full text-left px-4 py-3 text-secondary hover:bg-white/10 border-t border-white/10 hover:cursor-pointer" @click="handleLogout">
                Log out
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from './UserAvatar.vue'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const { user, profile, isAdmin, logout } = useAuth()

const open = ref(false)
const displayName = computed(() => profile.value?.displayName || user.value?.email || '')

async function handleLogout() {
    open.value = false
    await logout()
    router.push('/login')
}
</script>
