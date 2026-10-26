import { ref, computed } from 'vue'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'

// Created once, outside the function, so every component shares the same user
const user = ref(null)
const profile = ref(null)
const isAdmin = computed(() => profile.value?.role === 'admin')

// Set while registering, so the listener doesn't sign out before the profile is saved
let registering = false

// Resolves after Firebase tells us for the first time who is logged in (or nobody)
let markReady
const ready = new Promise((resolve) => (markReady = resolve))

onAuthStateChanged(auth, async (firebaseUser) => {
    user.value = firebaseUser
    profile.value = null
    if (firebaseUser && !registering) {
        profile.value = await loadProfile(firebaseUser.uid)
        // An admin removed this account, so don't let it stay logged in
        if (!profile.value) await signOut(auth)
    }
    markReady()
})

async function loadProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

async function login(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    const found = await loadProfile(result.user.uid)
    if (!found) {
        await signOut(auth)
        throw new Error('This account has been removed.')
    }
    profile.value = found
}

async function register(email, password, displayName) {
    registering = true
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        const data = {
            email,
            displayName: displayName || email.split('@')[0],
            role: 'user',
            createdAt: serverTimestamp(),
        }
        await setDoc(doc(db, 'users', result.user.uid), data)
        profile.value = { id: result.user.uid, ...data }
    } finally {
        registering = false
    }
}

async function logout() {
    await signOut(auth)
}

// Saves the logged in user's own name, bio or picture
async function updateMyProfile(fields) {
    await updateDoc(doc(db, 'users', user.value.uid), fields)
    profile.value = { ...profile.value, ...fields }
}

// Firebase wants the current password again before it lets you set a new one
async function changePassword(currentPassword, newPassword) {
    const credential = EmailAuthProvider.credential(user.value.email, currentPassword)
    await reauthenticateWithCredential(user.value, credential)
    await updatePassword(user.value, newPassword)
}

// Where to go after logging in: back to the page that sent you here (?redirect=/match/123), or home.
// Only paths inside this site, so a link can't send you to another website.
export function redirectPath(query) {
    const path = query.redirect
    return typeof path === 'string' && path.startsWith('/') && !path.startsWith('//') ? path : '/'
}

// Turns Firebase error codes into something readable
export function friendlyError(err) {
    const messages = {
        'auth/invalid-credential': 'Wrong email or password.',
        'auth/invalid-email': 'That email address is not valid.',
        'auth/user-not-found': 'Wrong email or password.',
        'auth/wrong-password': 'Wrong email or password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/too-many-requests': 'Too many attempts. Try again in a moment.',
        'auth/requires-recent-login': 'Please log out and back in, then try again.',
        'permission-denied': 'You do not have permission to do that.',
    }
    return messages[err.code] ?? err.message
}

export function useAuth() {
    return { user, profile, isAdmin, ready, login, register, logout, updateMyProfile, changePassword }
}
