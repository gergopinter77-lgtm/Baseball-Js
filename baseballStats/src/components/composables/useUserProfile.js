import { ref, computed, watch } from 'vue'
import { useAuth } from './useAuth'
import { useFriends } from './useFriends'
import { getPublicProfile } from './publicProfiles'
import { useFavouriteDetails } from './useFavouriteDetails'
import { loadMarket, loadPicksOf, teamFromPicks, teamTotals } from './useFantasy'

// Someone's profile page: their public profile, favourites and (for friends) fantasy team
export function useUserProfile(getUid) {
    const { user } = useAuth()
    const { relationTo } = useFriends()

    const person = ref(null)
    const loading = ref(false)

    const isMe = computed(() => person.value?.uid === user.value?.uid)
    // Fantasy teams are only shown to their owner and friends
    const canSeeTeam = computed(() => isMe.value || relationTo(person.value?.uid) === 'friend')

    async function loadPerson(uid) {
        loading.value = true
        try {
            person.value = await getPublicProfile(uid)
        } catch {
            person.value = { uid, missing: true }
        } finally {
            loading.value = false
        }
    }

    const { players: favouritePlayers, teams: favouriteTeams, loading: favouritesLoading } = useFavouriteDetails(
        () => person.value?.favouritePlayers,
        () => person.value?.favouriteTeams,
    )

    const picks = ref({})
    const byKey = ref({})
    const teamLoading = ref(false)
    const team = computed(() => teamFromPicks(picks.value, byKey.value))
    const totals = computed(() => teamTotals(team.value))

    async function loadTeam() {
        picks.value = {}
        if (!person.value || person.value.missing || !canSeeTeam.value) return
        teamLoading.value = true
        try {
            const [market, saved] = await Promise.all([loadMarket(), loadPicksOf(person.value.uid)])
            byKey.value = Object.fromEntries(market.map((p) => [p.key, p]))
            picks.value = saved
        } catch {
            // Players couldn't load: the team shows as empty
        } finally {
            teamLoading.value = false
        }
    }

    watch(getUid, (uid) => uid && loadPerson(uid), { immediate: true })
    // Again when you become (or stop being) friends
    watch([() => person.value?.uid, canSeeTeam], loadTeam)

    return { person, loading, isMe, canSeeTeam, favouritePlayers, favouriteTeams, favouritesLoading, team, totals, teamLoading }
}
