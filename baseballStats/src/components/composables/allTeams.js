import { getTeams } from '@/api/mlb'

// All 30 teams, downloaded once and shared
let teamsPromise = null

export function loadAllTeams() {
    teamsPromise ??= getTeams()
        .then((data) => data.teams ?? [])
        .catch((e) => {
            teamsPromise = null
            throw e
        })
    return teamsPromise
}
