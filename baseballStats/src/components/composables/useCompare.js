import { ref, reactive, computed, watch } from 'vue'
import { getPlayerSeason } from '@/api/mlb'
import { PITCHING, HITTING } from './PlayerStats'
import { CURRENT_SEASON, isPitcher, getSeasonTotals } from './player'

// Loads ONE player and their season totals. Used twice: once for A, once for B.
function useComparePlayer(getId) {
    const player = ref(null)
    const stats = ref(null)
    const loading = ref(false)
    const error = ref('')
    let requestId = 0

    async function load(id) {
        const myRequest = ++requestId

        if (!id) {
            player.value = null
            stats.value = null
            error.value = ''
            loading.value = false
            return
        }

        loading.value = true
        error.value = ''
        try {
            const data = await getPlayerSeason(id, CURRENT_SEASON)
            if (myRequest !== requestId) return // a newer player was picked meanwhile
            const p = data.people[0]
            player.value = p
            stats.value = getSeasonTotals(p, isPitcher(p) ? 'pitching' : 'hitting')
        } catch {
            if (myRequest !== requestId) return
            player.value = null
            stats.value = null
            error.value = 'Could not load this player'
        } finally {
            if (myRequest === requestId) loading.value = false
        }
    }

    watch(getId, load, { immediate: true })

    // reactive() lets the page write a.player instead of a.player.value
    return reactive({ player, stats, loading, error })
}

// Decides which value is better. Returns 'a', 'b' or null (tie / can't compare).
function pickWinner(valueA, valueB, lowerIsBetter) {
    // The API sends numbers as text ("3.03", ".241"), so turn them into real numbers
    const numberA = parseFloat(valueA)
    const numberB = parseFloat(valueB)

    if (Number.isNaN(numberA) || Number.isNaN(numberB)) return null
    if (numberA === numberB) return null

    if (lowerIsBetter) {
        return numberA < numberB ? 'a' : 'b'
    }
    return numberA > numberB ? 'a' : 'b'
}

// Everything the compare page needs
export function useCompare(getIdA, getIdB) {
    const a = useComparePlayer(getIdA)
    const b = useComparePlayer(getIdB)

    // Why we can't show the table yet ('' means everything is fine)
    const message = computed(() => {
        if (a.loading || b.loading) return 'Loading...'
        if (!a.player || !b.player) return 'Pick two players to compare.'
        if (a.player.id === b.player.id) return 'Pick two different players.'
        if (isPitcher(a.player) !== isPitcher(b.player)) return 'Pick two pitchers or two hitters.'
        return ''
    })

    // One row per stat: the name, both values, and who wins
    const rows = computed(() => {
        if (message.value) return []

        const statList = isPitcher(a.player) ? PITCHING.season : HITTING.season

        return statList.map((item) => {
            const valueA = a.stats?.[item.key]
            const valueB = b.stats?.[item.key]
            return {
                key: item.key,
                label: item.label,
                name: item.name,
                valueA,
                valueB,
                winner: pickWinner(valueA, valueB, item.lowerIsBetter),
            }
        })
    })

    return { a, b, message, rows }
}