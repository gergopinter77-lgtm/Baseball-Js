import { ref, computed, watch } from 'vue'
import { getPlayers } from '@/api/mlb'
import { loadAllTeams } from './allTeams'

// Favourite ids -> players and teams to show (follows changes to the ids)
export function useFavouriteDetails(getPlayerIds, getTeamIds) {
    const players = ref([])
    const allTeams = ref([])
    const loading = ref(false)

    const teams = computed(() => allTeams.value.filter((t) => (getTeamIds() ?? []).includes(t.id)))

    watch(() => (getPlayerIds() ?? []).join(','), async () => {
        const ids = getPlayerIds() ?? []
        // Removing one only drops it, no need to ask the API again
        const known = players.value.filter((p) => ids.includes(p.id))
        if (known.length === ids.length) {
            players.value = known
            return
        }
        loading.value = true
        try {
            players.value = (await getPlayers(ids)).people ?? []
        } catch {
            players.value = []
        } finally {
            loading.value = false
        }
    }, { immediate: true })

    loadAllTeams().then((list) => (allTeams.value = list)).catch(() => {})

    return { players, teams, loading }
}
