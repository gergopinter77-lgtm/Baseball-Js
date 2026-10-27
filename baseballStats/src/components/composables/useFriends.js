import { ref, computed, watch } from 'vue'
import { collection, doc, query, where, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from './useAuth'
import { getPublicProfile, searchPublicProfiles } from './publicProfiles'

// Two people share one friendships/{uidA_uidB} document, with the smaller uid first.
// { users: [uidA, uidB], requester: uid, status: 'pending' | 'accepted' }
// Pending = a friend request; accepted = friends. Declining, cancelling and unfriending delete it.
export function friendshipId(a, b) {
    return a < b ? `${a}_${b}` : `${b}_${a}`
}

// Created once, outside the function, so the header, the friends page and fantasy share the same lists
const { user } = useAuth()
const friendships = ref([])
const profiles = ref({}) // uid -> public profile (name, picture)
const loaded = ref(false)

const myUid = () => user.value?.uid
const otherUid = (f) => f.users.find((u) => u !== myUid())

// Fetch the name and picture of anyone we don't know yet
async function loadProfiles(uids) {
    const missing = uids.filter((uid) => !profiles.value[uid])
    const found = await Promise.all(missing.map((uid) => getPublicProfile(uid).catch(() => null)))
    const next = { ...profiles.value }
    found.forEach((p) => p && (next[p.uid] = p))
    profiles.value = next
}

// Listen to every friendship of the logged in user, so requests show up without reloading
let stopListening = null
watch(() => user.value?.uid, (uid) => {
    stopListening?.()
    stopListening = null
    friendships.value = []
    loaded.value = false
    if (!uid) return

    const mine = query(collection(db, 'friendships'), where('users', 'array-contains', uid))
    stopListening = onSnapshot(mine, async (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        await loadProfiles(list.map(otherUid))
        // Logged out (or into another account) while the names were loading
        if (myUid() !== uid) return
        friendships.value = list
        loaded.value = true
    }, () => {
        // Can't read them right now: show empty lists instead of an error
        loaded.value = true
    })
}, { immediate: true })

// Friendship list -> people, with their profile
function people(list) {
    return list
        .map((f) => ({ ...(profiles.value[otherUid(f)] ?? { uid: otherUid(f), displayName: '...' }), since: f.acceptedAt }))
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
}

const friends = computed(() => people(friendships.value.filter((f) => f.status === 'accepted')))
const incoming = computed(() => people(friendships.value.filter((f) => f.status === 'pending' && f.requester !== myUid())))
const outgoing = computed(() => people(friendships.value.filter((f) => f.status === 'pending' && f.requester === myUid())))

// How the logged in user stands with someone: 'self', 'friend', 'incoming', 'outgoing' or 'none'
function relationTo(uid) {
    if (uid === myUid()) return 'self'
    const f = friendships.value.find((x) => x.users.includes(uid))
    if (!f) return 'none'
    if (f.status === 'accepted') return 'friend'
    return f.requester === myUid() ? 'outgoing' : 'incoming'
}

const friendshipDoc = (uid) => doc(db, 'friendships', friendshipId(myUid(), uid))

function sendRequest(uid) {
    const users = [myUid(), uid].sort()
    return setDoc(friendshipDoc(uid), { users, requester: myUid(), status: 'pending', createdAt: serverTimestamp() })
}

function accept(uid) {
    return updateDoc(friendshipDoc(uid), { status: 'accepted', acceptedAt: serverTimestamp() })
}

// Decline a request, cancel your own request, or unfriend
function remove(uid) {
    return deleteDoc(friendshipDoc(uid))
}

export function useFriends() {
    return {
        friends, incoming, outgoing, loaded,
        relationTo, sendRequest, accept, remove,
        search: searchPublicProfiles,
    }
}
