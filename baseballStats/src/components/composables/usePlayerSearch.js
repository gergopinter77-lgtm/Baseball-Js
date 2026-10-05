import { ref, computed, watch } from 'vue'
import { searchPlayers } from '@/api/mlb'

const MIN_CHARS = 2
const MAX_RESULTS = 8
const DEBOUNCE_MS = 250

// The "search while typing" logic, so any search box can use it
export function usePlayerSearch() {
    const query = ref('')
    const results = ref([])
    const loading = ref(false)
    const error = ref('')

    let timer = null
    let requestId = 0
    let skipNextSearch = false

    // Only show the dropdown when there is something to show
    const isOpen = computed(() =>
        query.value.trim().length >= MIN_CHARS && (results.value.length > 0 || loading.value || error.value !== '')
    )

    watch(query, (value) => {
        clearTimeout(timer)
        if (skipNextSearch) {
            skipNextSearch = false
            return
        }
        const text = value.trim()
        if (text.length < MIN_CHARS) {
            requestId++
            results.value = []
            error.value = ''
            loading.value = false
            return
        }
        timer = setTimeout(() => search(text), DEBOUNCE_MS)
    })

    async function search(text) {
        const id = ++requestId
        loading.value = true
        error.value = ''
        try {
            const data = await searchPlayers(text)
            if (id !== requestId) return
            results.value = rankByCloseness(data.people ?? [], text).slice(0, MAX_RESULTS)
        } catch (e) {
            if (id !== requestId) return
            results.value = []
            error.value = e.message
        } finally {
            if (id === requestId) loading.value = false
        }
    }

    // Put text in the box WITHOUT starting a new search (used after picking a name)
    function setQueryQuietly(text) {
        clearTimeout(timer)
        requestId++
        loading.value = false
        results.value = []
        if (query.value !== text) {
            skipNextSearch = true
            query.value = text
        }
    }

    return { query, results, loading, error, isOpen, setQueryQuietly }
}

// Names where the first or last name starts with what was typed come first
function rankByCloseness(people, text) {
    const q = text.toLowerCase()
    const score = (p) => {
        const full = (p.fullName ?? '').toLowerCase()
        if (full.startsWith(q)) return 0
        if (full.split(' ').some((part) => part.startsWith(q))) return 1
        return 2
    }
    return [...people].sort((a, b) => score(a) - score(b))
}