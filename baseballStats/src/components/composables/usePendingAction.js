import { ref } from 'vue'
import { friendlyError } from './useAuth'

// For buttons that save something: which one is busy, which one asks "sure?", and the error
export function usePendingAction() {
    const busy = ref('') // key of the button that is working
    const confirming = ref('') // key of the button asking for a second click
    const error = ref('')

    async function run(key, action) {
        busy.value = key
        error.value = ''
        try {
            await action(key)
            confirming.value = ''
        } catch (e) {
            error.value = friendlyError(e)
        } finally {
            busy.value = ''
        }
    }

    return { busy, confirming, error, run }
}
