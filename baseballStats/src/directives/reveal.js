// v-reveal: the element slides up when it scrolls into view.
// v-reveal="i" in a list staggers the items (i = index).

const STAGGER_MS = 60
const MAX_DELAY_MS = 480

let observer = null
function getObserver() {
    observer ??= new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
        }
    }, { rootMargin: '0px 0px -40px 0px' })
    return observer
}

export const reveal = {
    mounted(el, binding) {
        // Old browsers: just show it
        if (!('IntersectionObserver' in window)) return
        const index = Number(binding.value) || 0
        el.style.animationDelay = `${Math.min(index * STAGGER_MS, MAX_DELAY_MS)}ms`
        el.classList.add('reveal')
        getObserver().observe(el)
    },
    unmounted(el) {
        observer?.unobserve(el)
    },
}
