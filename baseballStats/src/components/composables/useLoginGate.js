import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth'

// Sends logged out users to the login page, and back here afterwards
export function useLoginGate() {
    const route = useRoute()
    const router = useRouter()
    const { user } = useAuth()

    const loginLink = computed(() => ({ name: 'login', query: { redirect: route.fullPath } }))

    // true when logged in; otherwise goes to the login page
    function requireLogin() {
        if (user.value) return true
        router.push(loginLink.value)
        return false
    }

    return { loginLink, requireLogin }
}

// Log out, then show the login page
export function useLogout() {
    const router = useRouter()
    const { logout } = useAuth()

    async function logoutAndLeave() {
        await logout()
        router.push('/login')
    }

    return { logoutAndLeave }
}
