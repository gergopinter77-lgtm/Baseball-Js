import { ref, watch } from 'vue'
import { useAuth } from './useAuth'
import { getPublicProfile, saveFavourites } from './publicProfiles'

// Saved with your account when logged in (public profile), in the browser otherwise

// One saved list of ids (players or teams), kept in the browser
function createFavouriteList(storageKey, onChange) {
    // Created once, outside the use functions, so every component shares the same list
    const list = ref(read())

    function read() {
        try {
            return JSON.parse(localStorage.getItem(storageKey)) ?? []
        } catch {
            return []
        }
    }

    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(list.value))
        } catch {
            // Storage blocked (private window): the list still works until the page closes
        }
    }

    function has(id) {
        return list.value.includes(id)
    }

    function toggle(id) {
        list.value = has(id)
            ? list.value.filter((f) => f !== id)
            : [...list.value, id]
        save()
        onChange()
    }

    // Use the list saved with the account instead of the browser's
    function replace(ids) {
        list.value = ids
        save()
    }

    return { list, has, toggle, replace }
}

const { user, profile } = useAuth()

function uploadFavourites() {
    if (!user.value || !profile.value) return
    // In the background: if it fails, the favourite still works in this browser
    saveFavourites(user.value.uid, profile.value, {
        favouritePlayers: players.list.value,
        favouriteTeams: teams.list.value,
    }).catch(() => {})
}

const players = createFavouriteList('favourites', uploadFavourites)
const teams = createFavouriteList('favouriteTeams', uploadFavourites)

// Which account the browser's lists belong to ('' = logged out)
const OWNER_KEY = 'favouritesOwner'
function readOwner() {
    try {
        return localStorage.getItem(OWNER_KEY) ?? ''
    } catch {
        return ''
    }
}
function writeOwner(uid) {
    try {
        localStorage.setItem(OWNER_KEY, uid)
    } catch {
        // Storage blocked: nothing to remember
    }
}

// After login: use the account's list, or upload this browser's the first time
watch(() => profile.value?.id, async (uid) => {
    if (!uid) return
    try {
        const saved = await getPublicProfile(uid)
        if (Array.isArray(saved.favouritePlayers) || Array.isArray(saved.favouriteTeams)) {
            players.replace(saved.favouritePlayers ?? [])
            teams.replace(saved.favouriteTeams ?? [])
        } else {
            const owner = readOwner()
            if (owner && owner !== uid) {
                players.replace([])
                teams.replace([])
            }
            uploadFavourites()
        }
        writeOwner(uid)
    } catch {
        // Can't reach the account right now: keep using this browser's favourites
    }
}, { immediate: true })

export function useFavourites() {
    return { favourites: players.list, isFavourite: players.has, toggleFavourite: players.toggle }
}

export function useFavouriteTeams() {
    return { favouriteTeams: teams.list, isFavouriteTeam: teams.has, toggleFavouriteTeam: teams.toggle }
}
