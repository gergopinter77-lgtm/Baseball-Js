// Team helpers (no API calls)

// Roster sections in order; pitchers split into starters and relievers
export const ROSTER_GROUPS = [
    { id: 'SP', title: 'Starting pitchers', stats: 'pitching' },
    { id: 'RP', title: 'Relief pitchers', stats: 'pitching' },
    { id: 'Two-Way Player', title: 'Two-way players', stats: 'hitting' },
    { id: 'Catcher', title: 'Catchers', stats: 'hitting' },
    { id: 'Infielder', title: 'Infielders', stats: 'hitting' },
    { id: 'Outfielder', title: 'Outfielders', stats: 'hitting' },
    { id: 'Hitter', title: 'Designated hitters', stats: 'hitting' },
]

// Stat columns in the roster tables
export const ROSTER_COLUMNS = {
    pitching: [
        { key: 'gamesPlayed', label: 'G' },
        { key: 'gamesStarted', label: 'GS' },
        { key: 'wins', label: 'W' },
        { key: 'losses', label: 'L' },
        { key: 'era', label: 'ERA' },
        { key: 'inningsPitched', label: 'IP' },
        { key: 'strikeOuts', label: 'K' },
        { key: 'whip', label: 'WHIP' },
        { key: 'saves', label: 'SV' },
    ],
    hitting: [
        { key: 'gamesPlayed', label: 'G' },
        { key: 'avg', label: 'AVG' },
        { key: 'homeRuns', label: 'HR' },
        { key: 'rbi', label: 'RBI' },
        { key: 'runs', label: 'R' },
        { key: 'hits', label: 'H' },
        { key: 'stolenBases', label: 'SB' },
        { key: 'ops', label: 'OPS' },
    ],
}

// Team stats tab: one card per group
export const TEAM_STATS = [
    {
        group: 'hitting',
        title: 'Hitting',
        stats: [
            { key: 'avg', label: 'AVG', name: 'Batting average' },
            { key: 'obp', label: 'OBP', name: 'On-base percentage' },
            { key: 'slg', label: 'SLG', name: 'Slugging' },
            { key: 'ops', label: 'OPS', name: 'On-base + slugging' },
            { key: 'runs', label: 'R', name: 'Runs' },
            { key: 'hits', label: 'H', name: 'Hits' },
            { key: 'homeRuns', label: 'HR', name: 'Home runs' },
            { key: 'rbi', label: 'RBI', name: 'Runs batted in' },
            { key: 'doubles', label: '2B', name: 'Doubles' },
            { key: 'stolenBases', label: 'SB', name: 'Stolen bases' },
            { key: 'baseOnBalls', label: 'BB', name: 'Walks' },
            { key: 'strikeOuts', label: 'K', name: 'Strikeouts' },
        ],
    },
    {
        group: 'pitching',
        title: 'Pitching',
        stats: [
            { key: 'era', label: 'ERA', name: 'Earned run average' },
            { key: 'whip', label: 'WHIP', name: 'Walks + hits per inning' },
            { key: 'wins', label: 'W', name: 'Wins' },
            { key: 'losses', label: 'L', name: 'Losses' },
            { key: 'saves', label: 'SV', name: 'Saves' },
            { key: 'inningsPitched', label: 'IP', name: 'Innings pitched' },
            { key: 'strikeOuts', label: 'K', name: 'Strikeouts' },
            { key: 'baseOnBalls', label: 'BB', name: 'Walks' },
            { key: 'homeRuns', label: 'HR', name: 'Home runs allowed' },
            { key: 'strikeoutsPer9Inn', label: 'K/9', name: 'Strikeouts per 9' },
            { key: 'avg', label: 'OPP AVG', name: 'Opponent average' },
            { key: 'shutouts', label: 'SHO', name: 'Shutouts' },
        ],
    },
    {
        group: 'fielding',
        title: 'Fielding',
        stats: [
            { key: 'fielding', label: 'FPCT', name: 'Fielding percentage' },
            { key: 'errors', label: 'E', name: 'Errors' },
            { key: 'putOuts', label: 'PO', name: 'Putouts' },
            { key: 'assists', label: 'A', name: 'Assists' },
            { key: 'doublePlays', label: 'DP', name: 'Double plays' },
            { key: 'caughtStealingPercentage', label: 'CS%', name: 'Caught stealing %' },
        ],
    },
]

export const POSTSEASON_NAMES = { F: 'Wild Card', D: 'Division Series', L: 'LCS', W: 'World Series' }

// A player's season stats for a group, preferring this team's split
function rosterStats(person, group, teamId) {
    const splits = person.stats?.find((s) => s.group.displayName === group)?.splits ?? []
    return (splits.find((s) => s.team?.id === teamId) ?? splits.find((s) => !s.team) ?? splits[0])?.stat ?? null
}

function groupOf(entry, teamId) {
    const type = entry.position.type
    if (type !== 'Pitcher') return type
    const stat = rosterStats(entry.person, 'pitching', teamId)
    return stat && stat.gamesStarted >= stat.gamesPlayed / 2 ? 'SP' : 'RP'
}

// Roster -> sections by position, each player with the stats for their section
export function groupRoster(roster, teamId) {
    return ROSTER_GROUPS
        .map((group) => ({
            ...group,
            players: roster
                .filter((entry) => groupOf(entry, teamId) === group.id)
                .map((entry) => ({
                    id: entry.person.id,
                    name: entry.person.fullName,
                    number: entry.jerseyNumber,
                    position: entry.position.abbreviation,
                    batsThrows: `${entry.person.batSide?.code ?? '-'}/${entry.person.pitchHand?.code ?? '-'}`,
                    age: entry.person.currentAge,
                    status: entry.status?.code === 'A' ? '' : entry.status?.description,
                    stat: rosterStats(entry.person, group.stats, teamId),
                }))
                .sort((a, b) => a.position.localeCompare(b.position) || a.name.localeCompare(b.name)),
        }))
        .filter((group) => group.players.length)
}

// Schedule -> past results (newest first) and upcoming games, seen from this team's side
export function splitSchedule(schedule, teamId) {
    const seen = new Set()
    const games = []
    for (const day of schedule?.dates ?? []) {
        for (const g of day.games) {
            // Postponed games show up twice (old date and new date), keep one
            if (seen.has(g.gamePk) || ['Postponed', 'Cancelled'].includes(g.status.detailedState)) continue
            seen.add(g.gamePk)

            const isHome = g.teams.home.team.id === teamId
            const us = isHome ? g.teams.home : g.teams.away
            const them = isHome ? g.teams.away : g.teams.home
            games.push({
                gamePk: g.gamePk,
                date: g.gameDate,
                timeTBD: g.status.startTimeTBD,
                isHome,
                opponent: them.team,
                state: g.status.abstractGameState,
                status: g.status.detailedState,
                result: us.isWinner ? 'W' : them.isWinner ? 'L' : '',
                score: us.score != null ? `${us.score}-${them.score}` : '',
                record: g.gameType === 'R' ? `${us.leagueRecord.wins}-${us.leagueRecord.losses}` : '',
                round: POSTSEASON_NAMES[g.gameType] ?? '',
                venue: g.venue?.name,
            })
        }
    }
    return {
        past: games.filter((g) => g.state === 'Final').reverse(),
        upcoming: games.filter((g) => g.state !== 'Final'),
    }
}

// Stat blocks -> { hitting, pitching, fielding }
export function teamStatsByGroup(data) {
    const result = {}
    for (const block of data?.stats ?? []) {
        result[block.group.displayName] = block.splits[0]?.stat ?? null
    }
    return result
}

// 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 4 -> 4th
export function ordinal(n) {
    const num = Number(n)
    const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[num % 10 > 3 || [11, 12, 13].includes(num % 100) ? 0 : num % 10] ?? 'th'
    return `${num}${suffix}`
}
