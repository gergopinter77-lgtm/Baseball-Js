import { ref } from 'vue'

// One saved list of ids (players or teams), kept in the browser
function createFavouriteList(storageKey) {
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
    }

    return { list, has, toggle }
}

const players = createFavouriteList('favourites')
const teams = createFavouriteList('favouriteTeams')

export function useFavourites() {
    return { favourites: players.list, isFavourite: players.has, toggleFavourite: players.toggle }
}

export function useFavouriteTeams() {
    return { favouriteTeams: teams.list, isFavouriteTeam: teams.has, toggleFavouriteTeam: teams.toggle }
}
