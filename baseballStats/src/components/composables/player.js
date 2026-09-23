// Small helper functions for player data.
// They don't talk to the API, they only reshape data we already have.

export const CURRENT_SEASON = new Date().getFullYear()

// Position code '1' means pitcher. Everyone else counts as a hitter.
export function isPitcher(player) {
    return player?.primaryPosition?.code === '1'
}

// "#70 · Age 23 · 6' 6", 250 lb · Bats L / Throws L · Born in Stillwater, OK, USA"
export function playerInfoLine(p) {
    const born = [p.birthCity, p.birthStateProvince, p.birthCountry].filter(Boolean).join(', ')
    return [
        p.primaryNumber && `#${p.primaryNumber}`,
        p.currentAge && `Age ${p.currentAge}`,
        p.height && `${p.height}, ${p.weight} lb`,
        p.batSide && `Bats ${p.batSide.code} / Throws ${p.pitchHand?.code}`,
        born && `Born in ${born}`,
    ]
        .filter(Boolean)
        .join(' · ')
}

// The API sends a list of stat blocks. Find the one with this type and group.
// type: 'season' or 'gameLog'   group: 'pitching' or 'hitting'
export function findStats(player, type, group) {
    return (player.stats ?? []).find(
        (s) => s.type.displayName === type && s.group.displayName === group
    )
}

// Season totals. A traded player has one row per team plus a total row (the one without a team).
export function getSeasonTotals(player, group) {
    const splits = findStats(player, 'season', group)?.splits ?? []
    return (splits.find((s) => !s.team) ?? splits[0])?.stat ?? null
}

// Turn the raw game log + schedule into rows for the games table
export function buildGameRows(gameLog, schedule) {
    // Make a lookup: game id -> game info
    const gamesById = {}
    for (const day of schedule?.dates ?? []) {
        for (const game of day.games) {
            gamesById[game.gamePk] = game
        }
    }

    const rows = gameLog.map((entry) => {
        const game = gamesById[entry.game.gamePk]
        const us = entry.isHome ? 'home' : 'away'
        const them = entry.isHome ? 'away' : 'home'

        let result = null
        let score = ''
        if (game?.status.abstractGameState === 'Final') {
            const ourScore = game.teams[us].score
            const theirScore = game.teams[them].score
            result = ourScore > theirScore ? 'W' : 'L'
            score = `${ourScore}-${theirScore}`
        }

        return {
            gamePk: entry.game.gamePk,
            date: entry.date,
            isHome: entry.isHome,
            opponent: {
                id: entry.opponent.id,
                name: game?.teams[them].team.teamName ?? entry.opponent.name,
            },
            result,
            score,
            stat: entry.stat,
        }
    })

    return rows.reverse() // newest game first
}