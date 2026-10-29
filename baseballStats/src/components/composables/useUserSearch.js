import { ref, watch } from 'vue'
import { friendlyError } from './useAuth'
import { searchPublicProfiles } from './publicProfiles'

const TYPING_DELAY_MS = 300

// The friend search box: searches while typing, after a short pause
export function useUserSearch() {
    const search = ref('')
    const searchedFor = ref('')
    const results = ref([])
    const searching = ref(false)
    const error = ref('')

    async function runSearch() {
        const text = search.value.trim()
        if (!text) {
            searchedFor.value = ''
            results.value = []
            return
        }
        searching.value = true
        error.value = ''
        try {
            results.value = await searchPublicProfiles(text)
            searchedFor.value = text
        } catch (e) {
            error.value = friendlyError(e)
        } finally {
            searching.value = false
        }
    }

    let timer = null
    watch(search, () => {
        clearTimeout(timer)
        timer = setTimeout(runSearch, TYPING_DELAY_MS)
    })

    return { search, searchedFor, results, searching, error, runSearch }
}
