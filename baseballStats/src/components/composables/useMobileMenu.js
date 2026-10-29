import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// The phone menu: closes on page change and Escape, and stops the page behind it from scrolling
export function useMobileMenu() {
    const route = useRoute()
    const open = ref(false)

    const toggle = () => (open.value = !open.value)
    const close = () => (open.value = false)

    watch(() => route.fullPath, close)
    watch(open, (isOpen) => document.body.classList.toggle('overflow-hidden', isOpen))

    const onKey = (e) => e.key === 'Escape' && close()
    onMounted(() => window.addEventListener('keydown', onKey))
    onUnmounted(() => {
        window.removeEventListener('keydown', onKey)
        document.body.classList.remove('overflow-hidden')
    })

    return { open, toggle, close }
}
