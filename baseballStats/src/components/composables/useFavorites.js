import { ref } from 'vue'

const STORAGE_KEY = 'favourites'

// Created once, outside the function, so every component shares the same list
const favourites = ref(read())

function read() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []
    } catch {
        return []
    }
}

function save() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites.value))
    } catch {
    }
}

export function useFavourites() {
    function isFavourite(id) {
        return favourites.value.includes(id)
    }

    function toggleFavourite(id) {
        favourites.value = isFavourite(id)
            ? favourites.value.filter((f) => f !== id)
            : [...favourites.value, id]
        save()
    }

    return { favourites, isFavourite, toggleFavourite }
}