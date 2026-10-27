import { ref, computed, watch } from 'vue'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { getSeasonStats, getTeams } from '@/api/mlb'
import { useAuth } from './useAuth'
import { BUDGET, SLOTS, STATS_SEASON, FANTASY_SEASON, buildMarket, openSlotFor } from './fantasy'

// Wait this long after the last change before saving, so quick clicks become one save
const SAVE_DELAY = 600

// Loads the player market and the logged in user's fantasy team.
// Teams are saved as fantasy/{season}/teams/{uid} = { picks: { C: 'h-123', SP1: 'p-456', ... } }
export function useFantasy() {
    const { user, ready } = useAuth()

    const market = ref([])
    const picks = ref({}) // slot id -> player key
    const loading = ref(false)
    const error = ref('')
    const saveState = ref('') // '', 'saving', 'saved' or 'error'

    const byKey = computed(() => Object.fromEntries(market.value.map((p) => [p.key, p])))

    // The team in slot order; empty slots have player: null
    const team = computed(() => SLOTS.map((slot) => ({ ...slot, player: byKey.value[picks.value[slot.id]] ?? null })))
    const spent = computed(() => team.value.reduce((sum, s) => sum + (s.player?.cost ?? 0), 0))
    const left = computed(() => BUDGET - spent.value)
    const points = computed(() => team.value.reduce((sum, s) => sum + (s.player?.points ?? 0), 0))
    const isFull = computed(() => team.value.every((s) => s.player))
    const pickedKeys = computed(() => new Set(Object.values(picks.value)))

    const teamDoc = () => doc(db, 'fantasy', String(FANTASY_SEASON), 'teams', user.value.uid)

    async function loadMarket() {
        loading.value = true
        error.value = ''
        try {
            const [hitting, pitching, teams] = await Promise.all([
                getSeasonStats('hitting', STATS_SEASON),
                getSeasonStats('pitching', STATS_SEASON),
                getTeams(),
            ])
            market.value = buildMarket(hitting, pitching, teams)
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
            const snap = await getDoc(teamDoc())
            const saved = snap.exists() ? (snap.data().picks ?? {}) : {}
            savedJson = JSON.stringify(saved)
            picks.value = saved
        } catch (e) {
            error.value = `Could not load your team (${e.message})`
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
            await setDoc(teamDoc(), { picks: picks.value, updatedAt: serverTimestamp() })
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

    loadMarket()
    // Load the team again when someone logs in or out
    watch(() => user.value?.uid, loadTeam, { immediate: true })

    return { market, team, spent, left, points, isFull, loading, error, saveState, cantAddReason, add, remove, clear }
}
