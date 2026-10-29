import { ref, watch } from 'vue'
import { getTeam, getTeamRoster, getTeamSchedule, getTeamStats } from '@/api/mlb'
import { CURRENT_SEASON } from './player'
import { groupRoster, splitSchedule, teamStatsByGroup } from './team'

// Everything the team page needs (getId returns the team id)
export function useTeam(getId) {
    const team = ref(null)
    const rosterGroups = ref([])
    const pastGames = ref([])
    const upcomingGames = ref([])
    const stats = ref({})
    const loading = ref(false)
    const error = ref('')

    async function load(id) {
        loading.value = true
        error.value = ''
        const teamId = Number(id)
        try {
            const [teamData, rosterData, schedule, statsData] = await Promise.all([
                getTeam(teamId),
                getTeamRoster(teamId, CURRENT_SEASON),
                getTeamSchedule(teamId, CURRENT_SEASON),
                getTeamStats(teamId, CURRENT_SEASON),
            ])

            // In the off-season the active roster can be empty, so fall back to the 40-man roster
            let roster = rosterData.roster ?? []
            if (!roster.length) roster = (await getTeamRoster(teamId, CURRENT_SEASON, '40Man')).roster ?? []

            const games = splitSchedule(schedule, teamId)
            rosterGroups.value = groupRoster(roster, teamId)
            pastGames.value = games.past
            upcomingGames.value = games.upcoming
            stats.value = teamStatsByGroup(statsData)
            team.value = teamData.teams[0]
        } catch (e) {
            error.value = `Could not load this team (${e.message})`
        } finally {
            loading.value = false
        }
    }

    // Load again whenever the id changes (/team/147 -> /team/119)
    watch(getId, (id) => {
        if (id) load(id)
    }, { immediate: true })

    return { team, rosterGroups, pastGames, upcomingGames, stats, loading, error }
}
