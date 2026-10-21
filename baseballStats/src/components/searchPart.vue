<template>
    <div class="relative w-full max-w-2xl">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
            v-model="query"
            type="text"
            placeholder="Search a player or team, e.g. Aaron Judge or Yankees"
            class="input h-14! pl-12! text-lg! rounded-xl! bg-primary!"
        />

        <ul
            v-if="query.trim().length >= MIN_CHARS && (matchingTeams.length || players.length || loading || error)"
            class="absolute left-0 right-0 top-full mt-2 z-10 card shadow-2xl overflow-hidden"
        >
            <template v-if="matchingTeams.length">
                <li class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-primary-light">Teams</li>
                <li
                    v-for="t in matchingTeams"
                    :key="'team-' + t.id"
                    class="flex items-center gap-3 px-4 py-2.5 hover:cursor-pointer hover:bg-white/5"
                    @click="selectTeam(t)"
                >
                    <img :src="teamLogoUrl(t.id)" alt="" class="w-8 h-8" />
                    <span class="flex-1">{{ t.name }}</span>
                    <span class="text-xs font-semibold text-primary-light">{{ t.abbreviation }}</span>
                </li>
                <li v-if="players.length" class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-primary-light border-t border-white/5">Players</li>
            </template>
            <li v-if="loading && !players.length" class="px-4 py-3 text-primary-light">Searching...</li>
            <li v-else-if="error" class="px-4 py-3 text-secondary">{{ error }}</li>
            <li
                v-for="p in players"
                :key="p.id"
                class="flex items-center gap-3 px-4 py-2.5 hover:cursor-pointer hover:bg-white/5"
                @click="selectPlayer(p)"
            >
                <img :src="playerPhotoUrl(p.id, 80)" alt="" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                <span class="flex-1">{{ p.fullName }}</span>
                <span class="text-xs font-semibold text-primary-light">{{ p.primaryPosition?.abbreviation }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { searchPlayers, playerPhotoUrl, getTeams, teamLogoUrl } from '@/api/mlb'

const router = useRouter()

const MIN_CHARS = 2
const MAX_RESULTS = 8
const MAX_TEAMS = 3
const DEBOUNCE_MS = 250

const query = ref('')
const players = ref([])
const loading = ref(false)
const error = ref('')

// There are only 30 teams, so load them once and search them right here
const teams = ref([])

onMounted(async () => {
    try {
        teams.value = (await getTeams()).teams ?? []
    } catch {
        teams.value = []
    }
})

// Matches anywhere in the full name ("yank", "new york") or the start of the abbreviation ("NYY")
const matchingTeams = computed(() => {
    const q = query.value.trim().toLowerCase()
    if (q.length < MIN_CHARS) return []
    return teams.value
        .filter((t) => t.name.toLowerCase().includes(q) || t.abbreviation.toLowerCase().startsWith(q))
        .slice(0, MAX_TEAMS)
})

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
    router.push({ name: 'player', params: { id: p.id } })
}

function selectTeam(t) {
    requestId++
    router.push({ name: 'team', params: { id: t.id } })
}
</script>

