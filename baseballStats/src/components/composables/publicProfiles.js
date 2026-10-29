import { doc, getDoc, setDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

// publicProfiles/{uid}: what others may see (name, picture, bio, favourites; never the email)
const profileDoc = (uid) => doc(db, 'publicProfiles', uid)

// What the public copy of a private profile looks like
function publicFields({ displayName, photoURL, bio }) {
    const name = displayName || 'Fan'
    return {
        displayName: name,
        // Lowercase copy, so search doesn't care about capital letters
        nameLower: name.toLowerCase(),
        photoURL: photoURL || '',
        bio: bio || '',
    }
}

// Copy the private profile to the public one (merge keeps the favourites)
export async function savePublicProfile(uid, profile) {
    await setDoc(profileDoc(uid), publicFields(profile), { merge: true })
}

// Favourite ids; the name fields go along in case the public profile is new
export async function saveFavourites(uid, profile, { favouritePlayers, favouriteTeams }) {
    await setDoc(profileDoc(uid), { ...publicFields(profile), favouritePlayers, favouriteTeams }, { merge: true })
}

// Admins only: makes every account searchable and removes deleted ones
export async function syncAllPublicProfiles() {
    const [accounts, published] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'publicProfiles')),
    ])
    const current = Object.fromEntries(published.docs.map((d) => [d.id, d.data()]))
    const accountIds = new Set(accounts.docs.map((d) => d.id))

    const writes = []
    for (const account of accounts.docs) {
        const wanted = publicFields(account.data())
        const now = current[account.id]
        const same = now && Object.keys(wanted).every((k) => now[k] === wanted[k])
        if (!same) writes.push(setDoc(profileDoc(account.id), wanted, { merge: true }))
    }
    for (const uid of Object.keys(current)) {
        if (!accountIds.has(uid)) writes.push(deleteDoc(profileDoc(uid)))
    }
    await Promise.all(writes)
    return writes.length
}

export function deletePublicProfile(uid) {
    return deleteDoc(profileDoc(uid))
}

export async function getPublicProfile(uid) {
    const snap = await getDoc(profileDoc(uid))
    return snap.exists() ? { uid, ...snap.data() } : { uid, displayName: 'Unknown user', photoURL: '', bio: '', missing: true }
}

// Users whose name starts with the search text, e.g. "ger" finds "Gergo"
export async function searchPublicProfiles(text, max = 20) {
    const q = text.trim().toLowerCase()
    if (!q) return []
    const snap = await getDocs(query(
        collection(db, 'publicProfiles'),
        where('nameLower', '>=', q),
        // '\uf8ff' sorts after every normal letter, so this means "starts with q"
        where('nameLower', '<=', q + '\uf8ff'),
        orderBy('nameLower'),
        limit(max),
    ))
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
}
