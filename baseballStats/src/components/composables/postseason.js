// Postseason bracket helpers (no API calls)

// First season with today's 12-team format (the bracket layout below depends on it)
export const FIRST_BRACKET_SEASON = 2022

// Bracket columns, AL to NL; each series sits next to the one its winner plays next
export const BRACKET_COLUMNS = [
    { title: 'AL Wild Card', ids: ['F_2', 'F_1'] },
    { title: 'AL Division Series', ids: ['D_1', 'D_2'] },
    { title: 'ALCS', ids: ['L_1'] },
    { title: 'World Series', ids: ['W_1'] },
    { title: 'NLCS', ids: ['L_2'] },
    { title: 'NL Division Series', ids: ['D_3', 'D_4'] },
    { title: 'NL Wild Card', ids: ['F_4', 'F_3'] },
]

const isFinal = (game) => game.status.abstractGameState === 'Final'

// One series -> its two teams, how many games each has won, and a short status line
export function summarizeSeries(series) {
    const games = series.games ?? []
    const first = games[0]
    const bestOf = first?.gamesInSeries ?? 0
    const winsNeeded = Math.ceil(bestOf / 2)

    // Game 1's home team is the higher seed, so it goes on top
    const teams = [first?.teams.home.team, first?.teams.away.team].map((team) => ({
        team,
        wins: games.filter((g) => isFinal(g) && winnerOf(g)?.id === team?.id).length,
    }))

    const winner = teams.find((t) => t.team && t.wins >= winsNeeded)
    const [top, bottom] = teams
    let status
    if (winner) {
        const loser = teams.find((t) => t !== winner)
        status = `${abbr(winner.team)} win ${winner.wins}-${loser.wins}`
    } else if (top.wins || bottom.wins) {
        const leader = top.wins === bottom.wins ? null : top.wins > bottom.wins ? top : bottom
        status = leader
            ? `${abbr(leader.team)} lead ${Math.max(top.wins, bottom.wins)}-${Math.min(top.wins, bottom.wins)}`
            : `Tied ${top.wins}-${bottom.wins}`
    } else {
        status = first ? `Starts ${formatDate(first.gameDate)}` : 'TBD'
    }

    return {
        id: series.series.id,
        name: first?.seriesDescription ?? '',
        bestOf,
        teams: teams.map((t) => ({ ...t, isWinner: t === winner, isLoser: !!winner && t !== winner })),
        status,
        games,
    }
}

function winnerOf(game) {
    if (game.teams.home.isWinner) return game.teams.home.team
    if (game.teams.away.isWinner) return game.teams.away.team
    return null
}

export function abbr(team) {
    return team?.abbreviation ?? team?.teamName ?? 'TBD'
}

export function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
