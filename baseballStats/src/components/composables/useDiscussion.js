import { ref, computed, watch, onUnmounted } from 'vue'
import { collection, doc, query, orderBy, limit, onSnapshot, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { getTeams } from '@/api/mlb'
import { useAuth } from './useAuth'
import { getPublicProfile } from './publicProfiles'
import { cleanForPosting } from './sanitize'

// Newest comments shown per match
const MAX_COMMENTS = 200

// Names and pictures of commenters, shared between matches so each person is fetched once
const profiles = ref({})
async function loadProfiles(uids) {
    const missing = [...new Set(uids)].filter((uid) => !profiles.value[uid])
    if (!missing.length) return
    const found = await Promise.all(missing.map((uid) => getPublicProfile(uid).catch(() => null)))
    const next = { ...profiles.value }
    found.forEach((p) => p && (next[p.uid] = p))
    profiles.value = next
}

// All 30 teams once, to show a commenter's favourite team even when it isn't playing
let teamsPromise = null
const teamsById = ref({})
function loadTeams() {
    teamsPromise ??= getTeams()
        .then((data) => (teamsById.value = Object.fromEntries((data.teams ?? []).map((t) => [t.id, t]))))
        .catch(() => (teamsPromise = null))
    return teamsPromise
}

// matches/{gamePk}/comments: { uid, text, createdAt, rating? }
export function useDiscussion(getGamePk, getMatchTeamIds) {
    const { user, isAdmin } = useAuth()

    const raw = ref([])
    const loaded = ref(false)
    const posting = ref(false)
    const error = ref('')

    const comments = computed(() => raw.value.map((c) => {
        const author = profiles.value[c.uid]
        return {
            ...c,
            displayName: author?.displayName ?? '...',
            photoURL: author?.photoURL ?? '',
            favouriteTeam: favouriteTeamOf(author),
            canDelete: c.uid === user.value?.uid || isAdmin.value,
        }
    }))

    // A playing team they favourite, otherwise their first favourite
    function favouriteTeamOf(author) {
        const ids = author?.favouriteTeams ?? []
        const id = ids.find((t) => getMatchTeamIds().includes(t)) ?? ids[0]
        return id ? (teamsById.value[id] ?? { id }) : null
    }

    // Average stars per player, counting each person's latest rating only
    const ratings = computed(() => {
        const latest = {} // "uid-playerId" -> newest rating
        for (const c of raw.value) {
            if (c.rating && !latest[`${c.uid}-${c.rating.playerId}`]) latest[`${c.uid}-${c.rating.playerId}`] = c.rating
        }
        const byPlayer = {}
        for (const r of Object.values(latest)) {
            byPlayer[r.playerId] ??= { playerId: r.playerId, playerName: r.playerName, teamId: r.teamId, total: 0, count: 0 }
            byPlayer[r.playerId].total += r.stars
            byPlayer[r.playerId].count++
        }
        return Object.values(byPlayer)
            .map((p) => ({ ...p, average: p.total / p.count }))
            .sort((a, b) => b.average - a.average || b.count - a.count)
    })

    const commentsOf = (gamePk) => collection(db, 'matches', String(gamePk), 'comments')

    // Listen to the newest comments, so new ones show up without reloading
    let stop = null
    function listen() {
        stop?.()
        stop = null
        raw.value = []
        loaded.value = false
        error.value = ''
        const gamePk = getGamePk()
        if (!gamePk || !user.value) return

        loadTeams()
        const newest = query(commentsOf(gamePk), orderBy('createdAt', 'desc'), limit(MAX_COMMENTS))
        stop = onSnapshot(newest, async (snap) => {
            const list = snap.docs.map((d) => {
                const data = d.data({ serverTimestamps: 'estimate' })
                return { id: d.id, ...data, createdAt: data.createdAt?.toDate?.() ?? null }
            })
            await loadProfiles(list.map((c) => c.uid))
            // Another match opened (or logged out) while the names were loading
            if (getGamePk() !== gamePk || !user.value) return
            raw.value = list
            loaded.value = true
        }, () => {
            error.value = 'Could not load the discussion.'
            loaded.value = true
        })
    }

    // text: what was typed; rating: { player, stars } or null
    async function post(text, rating) {
        const message = cleanForPosting(text)
        if (!message && !rating) return false
        posting.value = true
        error.value = ''
        try {
            const comment = { uid: user.value.uid, text: message, createdAt: serverTimestamp() }
            if (rating) {
                comment.rating = {
                    playerId: rating.player.id,
                    playerName: rating.player.name,
                    teamId: rating.player.teamId,
                    stars: rating.stars,
                }
            }
            await addDoc(commentsOf(getGamePk()), comment)
            return true
        } catch {
            error.value = 'Could not post your comment.'
            return false
        } finally {
            posting.value = false
        }
    }

    async function remove(id) {
        error.value = ''
        try {
            await deleteDoc(doc(commentsOf(getGamePk()), id))
        } catch {
            error.value = 'Could not delete the comment.'
        }
    }

    // Start again when another match opens or someone logs in / out
    watch([getGamePk, () => user.value?.uid], listen, { immediate: true })
    onUnmounted(() => stop?.())

    return { comments, ratings, teamsById, loaded, posting, error, post, remove }
}
