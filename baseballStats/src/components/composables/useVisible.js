import { ref, onMounted, onUnmounted } from 'vue'

// visible turns true (once) when el comes within margin of the screen
export function useVisible(margin = '300px') {
    const el = ref(null)
    const visible = ref(false)
    let observer = null

    onMounted(() => {
        if (!('IntersectionObserver' in window)) {
            visible.value = true
            return
        }
        observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return
            visible.value = true
            observer.disconnect()
        }, { rootMargin: margin })
        observer.observe(el.value)
    })
    onUnmounted(() => observer?.disconnect())

    return { el, visible }
}
