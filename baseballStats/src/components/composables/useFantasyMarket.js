import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { useFriends } from './useFriends'
import { loadPicksOf } from './useFantasy'

const PAGE_SIZE = 50

const SORTS = {
    cost: (a, b) => b.cost - a.cost || b.points - a.points,
    costAsc: (a, b) => a.cost - b.cost || b.points - a.points,
    points: (a, b) => b.points - a.points,
    value: (a, b) => b.points / b.cost - a.points / a.cost,
}

// Search, position filter, sorting and paging for the player market
export function useMarketFilters(market, cantAddReason) {
    const search = ref('')
    const position = ref('All')
    const sort = ref('cost')
    const affordableOnly = ref(false)
    const limit = ref(PAGE_SIZE)

    const filtered = computed(() => {
        const q = search.value.trim().toLowerCase()
        return market.value
            .filter((p) => position.value === 'All' || p.position === position.value)
            .filter((p) => !q || p.name.toLowerCase().includes(q)
                || p.team?.name.toLowerCase().includes(q) || p.team?.abbreviation.toLowerCase() === q)
            .filter((p) => !affordableOnly.value || !cantAddReason(p))
            .sort(SORTS[sort.value])
    })

    const shown = computed(() => filtered.value.slice(0, limit.value))
    const showMore = () => (limit.value += PAGE_SIZE)

    // A new search or filter starts at the top again
    watch([search, position, sort, affordableOnly], () => (limit.value = PAGE_SIZE))

    return { search, position, sort, affordableOnly, filtered, shown, showMore }
}

// You and your friends, for the leaderboard
export function useFantasyLeaderboard({ team, spent, points, summarize }) {
    const { user, profile } = useAuth()
    const { friends } = useFriends()

    const friendPicks = ref({}) // uid -> picks
    watch(() => friends.value.map((f) => f.uid).join(','), async () => {
        const list = friends.value
        const picks = await Promise.all(list.map((f) => loadPicksOf(f.uid)))
        friendPicks.value = Object.fromEntries(list.map((f, i) => [f.uid, picks[i]]))
    }, { immediate: true })

    const leaderboard = computed(() => {
        if (!user.value) return []
        const me = {
            uid: user.value.uid,
            name: profile.value?.displayName || user.value.email,
            photo: profile.value?.photoURL ?? '',
            players: team.value.filter((s) => s.player).length,
            spent: spent.value,
            points: points.value,
            isMe: true,
        }
        const others = friends.value.map((f) => ({
            uid: f.uid,
            name: f.displayName,
            photo: f.photoURL,
            ...summarize(friendPicks.value[f.uid]),
            isMe: false,
        }))
        return [me, ...others]
    })

    return { leaderboard }
}
