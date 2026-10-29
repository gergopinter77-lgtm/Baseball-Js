import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerSearch, MIN_CHARS } from './usePlayerSearch'
import { loadAllTeams } from './allTeams'

const MAX_TEAMS = 3

// The home page search box: players from the API, teams matched right here
export function useHomeSearch() {
    const router = useRouter()
    const { query, results: players, loading, error, setQueryQuietly } = usePlayerSearch()

    const teams = ref([])
    onMounted(async () => {
        try {
            teams.value = await loadAllTeams()
        } catch {
            teams.value = []
        }
    })

    // Anywhere in the name ("yank", "new york") or the start of the abbreviation ("NYY")
    const matchingTeams = computed(() => {
        const q = query.value.trim().toLowerCase()
        if (q.length < MIN_CHARS) return []
        return teams.value
            .filter((t) => t.name.toLowerCase().includes(q) || t.abbreviation.toLowerCase().startsWith(q))
            .slice(0, MAX_TEAMS)
    })

    const showResults = computed(() =>
        query.value.trim().length >= MIN_CHARS
        && (matchingTeams.value.length > 0 || players.value.length > 0 || loading.value || !!error.value))

    function selectPlayer(p) {
        setQueryQuietly(p.fullName)
        router.push({ name: 'player', params: { id: p.id } })
    }

    function selectTeam(t) {
        setQueryQuietly(query.value)
        router.push({ name: 'team', params: { id: t.id } })
    }

    return { query, players, loading, error, matchingTeams, showResults, selectPlayer, selectTeam }
}
