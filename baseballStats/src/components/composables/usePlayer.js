import { ref, computed, watch } from 'vue'
import { getPlayerWithStats, getGames } from '@/api/mlb'
import { PITCHING, HITTING } from './PlayerStats'
import { CURRENT_SEASON, isPitcher, findStats, getSeasonTotals, buildGameRows } from './player'

// Loads everything the player page needs.
// getId is a function that returns the player id, so we can watch it for changes.
export function usePlayer(getId) {
    const player = ref(null)
    const seasonStats = ref(null)
    const games = ref([])
    const loading = ref(false)
    const error = ref('')

    const pitcher = computed(() => isPitcher(player.value))
    const statConfig = computed(() => (pitcher.value ? PITCHING : HITTING))

    async function load(id) {
        loading.value = true
        error.value = ''
        try {
            const data = await getPlayerWithStats(id, CURRENT_SEASON)
            const p = data.people[0]
            const group = isPitcher(p) ? 'pitching' : 'hitting'

            seasonStats.value = getSeasonTotals(p, group)

            const gameLog = findStats(p, 'gameLog', group)?.splits ?? []
            const schedule = gameLog.length ? await getGames(gameLog.map((g) => g.game.gamePk)) : null
            games.value = buildGameRows(gameLog, schedule)

            player.value = p
        } catch (e) {
            error.value = `Could not load this player (${e.message})`
        } finally {
            loading.value = false
        }
    }

    // Load again whenever the id changes (/player/801139 -> /player/660271)
    watch(getId, (id) => {
        if (id) load(id)
    }, { immediate: true })

    return { player, seasonStats, games, loading, error, isPitcher: pitcher, statConfig }
}