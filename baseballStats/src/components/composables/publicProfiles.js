import { doc, getDoc, setDoc, deleteDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

// The part of a profile other users may see: name, picture, bio and favourites, never the email.
// Saved as publicProfiles/{uid}, so users can search each other without reading the private users collection.
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

// Keep the public copy in step with the private profile.
// merge keeps the fields that aren't in the private profile (the favourites).
export async function savePublicProfile(uid, profile) {
    await setDoc(profileDoc(uid), publicFields(profile), { merge: true })
}

// Favourite player and team ids, so others can see them on your profile.
// The name fields go along, so this also works before the public profile exists.
export async function saveFavourites(uid, profile, { favouritePlayers, favouriteTeams }) {
    await setDoc(profileDoc(uid), { ...publicFields(profile), favouritePlayers, favouriteTeams }, { merge: true })
}

// Admins only (the database lets only them read every account).
// Makes sure every account can be found in friend search: adds missing public profiles,
// fixes ones with an old name, picture or bio, and removes ones whose account was deleted.
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
