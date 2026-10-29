import { ref, computed, watch } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { getSeasonStats, getTeams } from '@/api/mlb'
import { useAuth } from './useAuth'
import { BUDGET, SLOTS, STATS_SEASON, FANTASY_SEASON, buildMarket, openSlotFor } from './fantasy'

// Wait this long after the last change before saving, so quick clicks become one save
const SAVE_DELAY = 600

const teamDoc = (uid) => doc(db, 'fantasy', String(FANTASY_SEASON), 'teams', uid)

// Every player with a price, downloaded once and shared
let marketPromise = null
export function loadMarket() {
    marketPromise ??= Promise.all([
        getSeasonStats('hitting', STATS_SEASON),
        getSeasonStats('pitching', STATS_SEASON),
        getTeams(),
    ])
        .then(([hitting, pitching, teams]) => buildMarket(hitting, pitching, teams))
        // Try again next time instead of keeping the failure
        .catch((e) => {
            marketPromise = null
            throw e
        })
    return marketPromise
}

// Someone's saved picks, or {} if there are none (or you may not see them)
export async function loadPicksOf(uid) {
    try {
        const snap = await getDoc(teamDoc(uid))
        return snap.exists() ? (snap.data().picks ?? {}) : {}
    } catch {
        return {}
    }
}

// Picks -> every spot in order with its player (or null), using the market's players by key
export function teamFromPicks(picks, byKey) {
    return SLOTS.map((slot) => ({ ...slot, player: byKey[picks?.[slot.id]] ?? null }))
}

// Totals for a team in slot order: players picked, money spent and points
export function teamTotals(team) {
    const players = team.filter((s) => s.player).map((s) => s.player)
    return {
        players: players.length,
        spent: players.reduce((sum, p) => sum + p.cost, 0),
        points: players.reduce((sum, p) => sum + p.points, 0),
    }
}

// The market and your team, saved as fantasy/{season}/teams/{uid} = { picks: { slot: key } }
export function useFantasy() {
    const { user, ready } = useAuth()

    const market = ref([])
    const picks = ref({}) // slot id -> player key
    const loading = ref(false)
    const error = ref('')
    const saveState = ref('') // '', 'saving', 'saved' or 'error'

    const byKey = computed(() => Object.fromEntries(market.value.map((p) => [p.key, p])))

    // The team in slot order; empty slots have player: null
    const team = computed(() => teamFromPicks(picks.value, byKey.value))
    const spent = computed(() => teamTotals(team.value).spent)
    const left = computed(() => BUDGET - spent.value)
    const points = computed(() => teamTotals(team.value).points)
    const isFull = computed(() => team.value.every((s) => s.player))
    const pickedKeys = computed(() => new Set(Object.values(picks.value)))

    // Totals for any team's picks (yours or a friend's)
    const summarize = (teamPicks) => teamTotals(teamFromPicks(teamPicks, byKey.value))

    async function fetchMarket() {
        loading.value = true
        error.value = ''
        try {
            market.value = await loadMarket()
        } catch (e) {
            error.value = `Could not load players (${e.message})`
        } finally {
            loading.value = false
        }
    }

    // The team as it is in the database, so loading it doesn't count as a change to save
    let savedJson = '{}'

    async function loadTeam() {
        savedJson = '{}'
        picks.value = {}
        saveState.value = ''
        await ready
        if (!user.value) return
        try {
            const snap = await getDoc(teamDoc(user.value.uid))
            const saved = snap.exists() ? (snap.data().picks ?? {}) : {}
            savedJson = JSON.stringify(saved)
            picks.value = saved
        } catch {
            // No saved team we can read: start with an empty one
        }
    }

    // Why a player can't be added right now, or '' when they can
    function cantAddReason(player) {
        if (pickedKeys.value.has(player.key)) return 'On your team'
        if (!openSlotFor(player, picks.value)) return `No open ${player.position} spot`
        if (player.cost > left.value) return 'Over budget'
        return ''
    }

    function add(player) {
        if (cantAddReason(player)) return
        picks.value = { ...picks.value, [openSlotFor(player, picks.value)]: player.key }
    }

    function remove(slotId) {
        const next = { ...picks.value }
        delete next[slotId]
        picks.value = next
    }

    function clear() {
        picks.value = {}
    }

    let saveTimer = null
    async function save() {
        const json = JSON.stringify(picks.value)
        try {
            await setDoc(teamDoc(user.value.uid), { picks: picks.value, updatedAt: serverTimestamp() })
            savedJson = json
            saveState.value = 'saved'
        } catch {
            saveState.value = 'error'
        }
    }

    // Every change to the team is saved automatically
    watch(picks, () => {
        clearTimeout(saveTimer)
        if (!user.value) return
        // Changed back to what is already saved: nothing to do
        if (JSON.stringify(picks.value) === savedJson) {
            if (saveState.value === 'saving') saveState.value = 'saved'
            return
        }
        saveState.value = 'saving'
        saveTimer = setTimeout(save, SAVE_DELAY)
    })

    fetchMarket()
    // Load the team again when someone logs in or out
    watch(() => user.value?.uid, loadTeam, { immediate: true })

    return { market, team, spent, left, points, isFull, loading, error, saveState, cantAddReason, add, remove, clear, summarize, loadPicksOf }
}
