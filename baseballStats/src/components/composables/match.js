// Match helpers (no API calls)
import { POSTSEASON_NAMES } from './team'

// One side of a game (away or home)
function side(s) {
    return {
        team: s.team,
        record: s.leagueRecord ? `${s.leagueRecord.wins}-${s.leagueRecord.losses}` : '',
        score: s.score ?? null,
        isWinner: !!s.isWinner,
        pitcher: s.probablePitcher ?? null,
    }
}

// Raw schedule game -> what the match list and match page show
export function toMatch(g) {
    return {
        gamePk: g.gamePk,
        date: g.gameDate,
        // The day MLB lists the game on (late games can be the next day in your time zone)
        day: g.officialDate,
        season: Number(g.season),
        timeTBD: g.status.startTimeTBD,
        // 'Preview' (not started), 'Live' or 'Final'
        state: g.status.abstractGameState,
        status: g.status.detailedState,
        round: POSTSEASON_NAMES[g.gameType] ?? '',
        seriesGame: g.gamesInSeries > 1 ? `Game ${g.seriesGameNumber} of ${g.gamesInSeries}` : '',
        venue: g.venue?.name,
        away: side(g.teams.away),
        home: side(g.teams.home),
    }
}

// Schedule for one day -> list of matches, postponed games kept only once
export function scheduleToMatches(schedule) {
    const seen = new Set()
    const matches = []
    for (const day of schedule?.dates ?? []) {
        for (const g of day.games) {
            if (seen.has(g.gamePk)) continue
            seen.add(g.gamePk)
            matches.push(toMatch(g))
        }
    }
    return matches
}

// Finished games between two teams, newest first, and wins per team (this match left out)
export function headToHead(schedules, currentGamePk, teamIds) {
    const seen = new Set([currentGamePk])
    const games = []
    for (const schedule of schedules) {
        for (const day of schedule?.dates ?? []) {
            for (const g of day.games) {
                if (seen.has(g.gamePk) || g.status.abstractGameState !== 'Final') continue
                seen.add(g.gamePk)
                games.push(toMatch(g))
            }
        }
    }
    games.sort((a, b) => new Date(b.date) - new Date(a.date))

    const wins = Object.fromEntries(teamIds.map((id) => [id, 0]))
    for (const g of games) {
        const winner = g.away.isWinner ? g.away : g.home.isWinner ? g.home : null
        if (winner && winner.team.id in wins) wins[winner.team.id]++
    }
    return { games, wins }
}

// "2026-10-26" for a Date, in the browser's own time zone
export function toDateString(date) {
    const pad = (n) => String(n).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// "2026-10-26" + 1 -> "2026-10-27"
export function addDays(dateString, days) {
    const [y, m, d] = dateString.split('-').map(Number)
    return toDateString(new Date(y, m - 1, d + days))
}

export function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

// "2026-10-26" -> "Mon, Oct 26, 2026", without time zones moving it to another day
export function formatDay(dateString) {
    const [y, m, d] = dateString.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatTime(iso) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

// Boxscore -> players who got into the game, per team, with their game line
export function playersWhoPlayed(boxscore) {
    const result = {}
    for (const side of ['away', 'home']) {
        const t = boxscore?.teams?.[side]
        const ids = [...new Set([...(t?.batters ?? []), ...(t?.pitchers ?? [])])]
        result[side] = ids
            .map((id) => t.players[`ID${id}`])
            .filter(Boolean)
            .map((p) => {
                const isPitcher = (t.pitchers ?? []).includes(p.person.id)
                return {
                    id: p.person.id,
                    name: p.person.fullName,
                    position: p.position?.abbreviation ?? '',
                    teamId: t.team.id,
                    summary: (isPitcher ? p.stats?.pitching?.summary : p.stats?.batting?.summary) ?? '',
                }
            })
    }
    return result
}

// "just now", "5 min ago", "3 h ago", or the date for older times
export function timeAgo(date) {
    if (!date) return 'just now'
    const minutes = Math.round((Date.now() - date.getTime()) / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes} min ago`
    if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h ago`
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// "Mon, Oct 26" (no year, for this season's lists)
export function formatShortDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
