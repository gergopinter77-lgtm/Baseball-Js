import { ref, computed, watch } from 'vue'
import { getPostseason } from '@/api/mlb'
import { CURRENT_SEASON } from './player'
import { FIRST_BRACKET_SEASON, summarizeSeries } from './postseason'

export const BRACKET_SEASONS = Array.from(
    { length: CURRENT_SEASON - FIRST_BRACKET_SEASON + 1 },
    (_, i) => CURRENT_SEASON - i,
)

// Games that have been (or are being) played show a score
export const isPlayed = (game) => game.status.abstractGameState !== 'Preview'

// A game can open its match page once both teams are known
export const hasTeams = (game) => !!(game.teams.away.team?.id && game.teams.home.team?.id)
export const matchLink = (game) => ({ name: 'match', params: { id: game.gamePk } })

// The postseason bracket of one season, and the series that is clicked open
export function usePostseason() {
    const season = ref(CURRENT_SEASON)
    const seriesById = ref(new Map())
    const selectedId = ref('W_1')
    const loading = ref(false)
    const error = ref('')

    const selected = computed(() => seriesById.value.get(selectedId.value))

    watch(season, async (year) => {
        loading.value = true
        error.value = ''
        try {
            const data = await getPostseason(year)
            if (year !== season.value) return
            seriesById.value = new Map((data.series ?? []).map((s) => [s.series.id, summarizeSeries(s)]))
            selectedId.value = 'W_1'
        } catch (e) {
            error.value = e.message
        } finally {
            loading.value = false
        }
    }, { immediate: true })

    return { season, seriesById, selectedId, selected, loading, error }
}
