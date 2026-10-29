import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Delay before the bar shows, so fast page changes don't flash it
const SHOW_AFTER_MS = 150

// true while a page is still opening (for the loading bar in the header)
export function useNavigationLoading() {
    const router = useRouter()
    const navigating = ref(false)
    let timer = null

    function stop() {
        clearTimeout(timer)
        navigating.value = false
    }

    router.beforeEach(() => {
        clearTimeout(timer)
        timer = setTimeout(() => (navigating.value = true), SHOW_AFTER_MS)
    })
    router.afterEach(stop)
    router.onError(stop)

    return { navigating }
}
