import { ref, watch } from 'vue'
import { getMatch, getTeamRoster, getHeadToHead } from '@/api/mlb'
import { groupRoster } from './team'
import { toMatch, headToHead } from './match'

// How many seasons back the head-to-head list goes (this season included)
export const H2H_SEASONS = 3

// In the off-season the active roster can be empty, so fall back to the 40-man roster
async function loadRoster(teamId, season) {
    let roster = (await getTeamRoster(teamId, season)).roster ?? []
    if (!roster.length) roster = (await getTeamRoster(teamId, season, '40Man')).roster ?? []
    return groupRoster(roster, teamId)
}

// Loads everything the match page needs.
// getId is a function that returns the game id (gamePk), so we can watch it for changes.
export function useMatch(getId) {
    const match = ref(null)
    const rosters = ref({ away: [], home: [] })
    const history = ref({ games: [], wins: {} })
    const loading = ref(false)
    const error = ref('')

    async function load(id) {
        loading.value = true
        error.value = ''
        match.value = null
        try {
            const game = (await getMatch(id)).dates?.[0]?.games?.[0]
            if (!game) throw new Error('match not found')
            const m = toMatch(game)
            const awayId = m.away.team.id
            const homeId = m.home.team.id

            const seasons = Array.from({ length: H2H_SEASONS }, (_, i) => m.season - i)
            const [awayRoster, homeRoster, ...schedules] = await Promise.all([
                loadRoster(awayId, m.season),
                loadRoster(homeId, m.season),
                ...seasons.map((season) => getHeadToHead(awayId, homeId, season)),
            ])

            rosters.value = { away: awayRoster, home: homeRoster }
            history.value = headToHead(schedules, m.gamePk, [awayId, homeId])
            match.value = m
        } catch (e) {
            error.value = `Could not load this match (${e.message})`
        } finally {
            loading.value = false
        }
    }

    // Load again whenever the id changes (/match/1 -> /match/2)
    watch(getId, (id) => {
        if (id) load(id)
    }, { immediate: true })

    return { match, rosters, history, loading, error }
}
