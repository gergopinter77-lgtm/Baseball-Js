<template>
    <div class="flex justify-center">
        <div class="relative mt-90">
            <input
                v-model="query"
                type="text"
                placeholder="Search..."
                class="bg-secondary-dark w-160.5 h-16 rounded-lg hover:cursor-pointer hover:bg-secondary-dark text-2xl px-6 text-white placeholder:text-white"
            />

            <ul
                v-if="query.trim().length >= MIN_CHARS && (players.length || loading || error)"
                class="absolute left-0 right-0 top-full mt-2 z-10 bg-secondary-dark rounded-lg overflow-hidden text-white text-xl"
            >
                <li v-if="loading && !players.length" class="px-6 py-3 opacity-70">Searching...</li>
                <li v-else-if="error" class="px-6 py-3 text-red-500">{{ error }}</li>
                <li
                    v-for="p in players"
                    :key="p.id"
                    class="px-6 py-3 hover:cursor-pointer hover:bg-white/10"
                    @click="selectPlayer(p)"
                >
                    {{ p.fullName }} – {{ p.primaryPosition?.abbreviation }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { searchPlayers } from '@/api/mlb'

const router = useRouter()

const MIN_CHARS = 2
const MAX_RESULTS = 8
const DEBOUNCE_MS = 250

const query = ref('')
const players = ref([])
const loading = ref(false)
const error = ref('')

let timer = null
let requestId = 0
let skipNextSearch = false

// Search after every letter, waiting briefly so fast typing doesn't spam the API
watch(query, (value) => {
    clearTimeout(timer)
    if (skipNextSearch) {
        skipNextSearch = false
        return
    }
    const text = value.trim()
    if (text.length < MIN_CHARS) {
        players.value = []
        error.value = ''
        loading.value = false
        return
    }
    timer = setTimeout(() => search(text), DEBOUNCE_MS)
})

async function search(text) {
    const id = ++requestId
    loading.value = true
    error.value = ''
    try {
        const data = await searchPlayers(text)
        // Ignore responses that come back after a newer search was started
        if (id !== requestId) return
        players.value = rankByCloseness(data.people ?? [], text).slice(0, MAX_RESULTS)
    } catch (e) {
        if (id !== requestId) return
        players.value = []
        error.value = e.message
    } finally {
        if (id === requestId) loading.value = false
    }
}

// Names where the first or last name starts with what was typed come first
function rankByCloseness(people, text) {
    const q = text.toLowerCase()
    const score = (p) => {
        const full = (p.fullName ?? '').toLowerCase()
        if (full.startsWith(q)) return 0
        if (full.split(' ').some((part) => part.startsWith(q))) return 1
        return 2
    }
    return [...people].sort((a, b) => score(a) - score(b))
}

function selectPlayer(p) {
    skipNextSearch = true
    requestId++
    loading.value = false
    query.value = p.fullName
    players.value = []
    router.push({ name: 'player', params: { id: p.id } })   // ← ADD THIS
}
</script>

<style lang="scss" scoped>

</style>
