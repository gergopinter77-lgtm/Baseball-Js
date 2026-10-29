import { ref, computed, watch } from 'vue'
import { collection, doc, getDoc, setDoc, query, where, getCountFromServer, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './useAuth'

// "Who will win?" poll: polls/{gamePk}/votes/{uid}, results only after voting
export function usePoll(getGamePk, getTeamIds) {
    const { user, ready } = useAuth()

    const myVote = ref(null) // team id this user voted for, or null
    const counts = ref(null) // { [teamId]: votes }, only filled after voting
    const loading = ref(false)
    const voting = ref(false)
    const error = ref('')

    const votes = () => collection(db, 'polls', String(getGamePk()), 'votes')

    async function loadResults() {
        const ids = getTeamIds()
        const totals = await Promise.all(
            ids.map((id) => getCountFromServer(query(votes(), where('teamId', '==', id)))),
        )
        counts.value = Object.fromEntries(ids.map((id, i) => [id, totals[i].data().count]))
    }

    async function load() {
        myVote.value = null
        counts.value = null
        error.value = ''
        await ready
        if (!user.value || !getGamePk()) return

        loading.value = true
        try {
            const snap = await getDoc(doc(votes(), user.value.uid))
            if (snap.exists()) {
                myVote.value = snap.data().teamId
                await loadResults()
            }
        } catch (e) {
            error.value = `Could not load the poll (${e.message})`
        } finally {
            loading.value = false
        }
    }

    async function vote(teamId) {
        voting.value = true
        error.value = ''
        try {
            await setDoc(doc(votes(), user.value.uid), { teamId, createdAt: serverTimestamp() })
            myVote.value = teamId
            await loadResults()
        } catch (e) {
            error.value = `Could not save your vote (${e.message})`
        } finally {
            voting.value = false
        }
    }

    // Load again when another match opens or someone logs in / out
    watch([getGamePk, () => user.value?.uid], load, { immediate: true })

    const total = computed(() => Object.values(counts.value ?? {}).reduce((a, b) => a + b, 0))
    const percent = (teamId) => (total.value ? Math.round((counts.value[teamId] / total.value) * 100) : 0)

    return { myVote, counts, total, percent, loading, voting, error, vote }
}
