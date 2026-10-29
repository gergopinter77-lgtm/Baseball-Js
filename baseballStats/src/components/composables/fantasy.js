// Fantasy rules and helpers (no API calls)

// Priced from the last finished season (from October, that's this year)
const now = new Date()
export const STATS_SEASON = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1
export const FANTASY_SEASON = STATS_SEASON + 1

// Money is in millions: a $25M star, a $1M bench player
export const BUDGET = 100
const MIN_COST = 1
const MAX_COST = 25

// Players need this much playing time last season to be in the market
const MIN_PLATE_APPEARANCES = 100
const MIN_OUTS = 60 // 20 innings

// The spots on a fantasy team. A player can go in any spot that accepts their position.
const HITTERS = ['C', '1B', '2B', '3B', 'SS', 'OF', 'DH']
export const SLOTS = [
    { id: 'C', label: 'C', accepts: ['C'] },
    { id: '1B', label: '1B', accepts: ['1B'] },
    { id: '2B', label: '2B', accepts: ['2B'] },
    { id: '3B', label: '3B', accepts: ['3B'] },
    { id: 'SS', label: 'SS', accepts: ['SS'] },
    { id: 'OF1', label: 'OF', accepts: ['OF'] },
    { id: 'OF2', label: 'OF', accepts: ['OF'] },
    { id: 'OF3', label: 'OF', accepts: ['OF'] },
    { id: 'UTIL', label: 'UTIL', accepts: HITTERS },
    { id: 'SP1', label: 'SP', accepts: ['SP'] },
    { id: 'SP2', label: 'SP', accepts: ['SP'] },
    { id: 'SP3', label: 'SP', accepts: ['SP'] },
    { id: 'SP4', label: 'SP', accepts: ['SP'] },
    { id: 'RP1', label: 'RP', accepts: ['RP'] },
    { id: 'RP2', label: 'RP', accepts: ['RP'] },
]

// Position filter buttons on the market
export const POSITION_FILTERS = ['All', 'C', '1B', '2B', '3B', 'SS', 'OF', 'DH', 'SP', 'RP']

// Fantasy points per stat (also shown on the page)
export const SCORING = {
    hitting: [
        { key: 'singles', label: 'Single', points: 1 },
        { key: 'doubles', label: 'Double', points: 2 },
        { key: 'triples', label: 'Triple', points: 3 },
        { key: 'homeRuns', label: 'Home run', points: 4 },
        { key: 'runs', label: 'Run', points: 1 },
        { key: 'rbi', label: 'RBI', points: 1 },
        { key: 'baseOnBalls', label: 'Walk', points: 1 },
        { key: 'stolenBases', label: 'Stolen base', points: 2 },
        { key: 'strikeOuts', label: 'Strikeout', points: -0.5 },
    ],
    pitching: [
        { key: 'outs', label: 'Out recorded', points: 1 },
        { key: 'strikeOuts', label: 'Strikeout', points: 1 },
        { key: 'wins', label: 'Win', points: 5 },
        { key: 'saves', label: 'Save', points: 5 },
        { key: 'holds', label: 'Hold', points: 2 },
        { key: 'earnedRuns', label: 'Earned run', points: -2 },
        { key: 'hits', label: 'Hit allowed', points: -1 },
        { key: 'baseOnBalls', label: 'Walk allowed', points: -1 },
    ],
}

function fantasyPoints(stat, group) {
    const s = group === 'hitting'
        ? { ...stat, singles: stat.hits - stat.doubles - stat.triples - stat.homeRuns }
        : stat
    return SCORING[group].reduce((sum, rule) => sum + (s[rule.key] ?? 0) * rule.points, 0)
}

// Hitters by their field position; LF, CF and RF all count as OF, unknown positions as DH
function hitterPosition(abbreviation) {
    if (['LF', 'CF', 'RF'].includes(abbreviation)) return 'OF'
    return HITTERS.includes(abbreviation) ? abbreviation : 'DH'
}

// The best player of the group costs MAX_COST; the curve keeps most players cheap
function priceFor(points, topPoints) {
    const share = Math.max(points, 0) / topPoints
    return Math.max(MIN_COST, Math.round(MIN_COST + (MAX_COST - MIN_COST) * share ** 2.5))
}

// One group's API response -> market players with points and a price
function groupPlayers(data, group, teamsById) {
    const isHitting = group === 'hitting'
    const players = (data?.stats?.[0]?.splits ?? [])
        .filter((s) => isHitting
            ? s.position?.abbreviation !== 'P' && s.stat.plateAppearances >= MIN_PLATE_APPEARANCES
            : s.stat.outs >= MIN_OUTS)
        .map((s) => ({
            // Two-way players (Ohtani) are in the market twice, once as a hitter and once as a pitcher
            key: `${isHitting ? 'h' : 'p'}-${s.player.id}`,
            id: s.player.id,
            name: s.player.fullName,
            team: teamsById[s.team?.id] ?? null,
            position: isHitting
                ? hitterPosition(s.position?.abbreviation)
                : s.stat.gamesStarted >= s.stat.gamesPlayed / 2 ? 'SP' : 'RP',
            group,
            stat: s.stat,
            points: Math.round(fantasyPoints(s.stat, group)),
        }))

    const top = Math.max(...players.map((p) => p.points), 1)
    return players.map((p) => ({ ...p, cost: priceFor(p.points, top) }))
}

// Hitting + pitching stats -> the whole market, most expensive first
export function buildMarket(hitting, pitching, teams) {
    const teamsById = Object.fromEntries((teams?.teams ?? []).map((t) => [t.id, t]))
    return [...groupPlayers(hitting, 'hitting', teamsById), ...groupPlayers(pitching, 'pitching', teamsById)]
        .sort((a, b) => b.cost - a.cost || b.points - a.points)
}

// First empty spot on the team this player can go in, or null when there is none
export function openSlotFor(player, picks) {
    return SLOTS.find((slot) => !picks[slot.id] && slot.accepts.includes(player.position))?.id ?? null
}

// Main stats shown next to each player in the market
export function statLine(player) {
    const s = player.stat
    return player.group === 'hitting'
        ? `${s.avg} AVG · ${s.homeRuns} HR · ${s.rbi} RBI · ${s.stolenBases} SB`
        : `${s.era} ERA · ${s.inningsPitched} IP · ${s.strikeOuts} K${player.position === 'RP' ? ` · ${s.saves} SV` : ` · ${s.wins} W`}`
}
