<template>
    <main class="page">
        <div class="mb-6">
            <h1 class="text-4xl md:text-5xl font-bold">Fantasy {{ FANTASY_SEASON }}</h1>
            <p class="text-primary-light mt-1">
                Build your team for the {{ FANTASY_SEASON }} season with ${{ BUDGET }}M.
                Prices are based on how players did in {{ STATS_SEASON }}.
            </p>
        </div>

        <!-- How points and prices work -->
        <details class="card px-5 py-4 mb-6">
            <summary class="cursor-pointer font-semibold select-none">How prices work</summary>
            <p class="text-sm text-primary-light mt-3">
                Every player gets fantasy points for their {{ STATS_SEASON }} stats. The best hitter and the best pitcher cost
                $25M, and prices drop quickly from there, so most players cost $1–5M. Players need at least 100 plate
                appearances or 20 innings in {{ STATS_SEASON }} to be in the market.
            </p>
            <div class="grid sm:grid-cols-2 gap-4 mt-4">
                <div v-for="(rules, group) in SCORING" :key="group">
                    <h3 class="text-lg font-semibold capitalize mb-1">{{ group }}</h3>
                    <ul class="text-sm">
                        <li v-for="rule in rules" :key="rule.key" class="flex justify-between py-1 border-t border-white/5">
                            <span class="text-primary-light">{{ rule.label }}</span>
                            <span class="font-semibold" :class="rule.points < 0 ? 'text-secondary' : 'text-emerald-400'">
                                {{ rule.points > 0 ? '+' : '' }}{{ rule.points }}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </details>

        <p v-if="!user" class="card px-5 py-4 mb-6 text-sm">
            <RouterLink :to="loginLink" class="text-secondary font-medium hover:underline">Log in</RouterLink>
            <span class="text-primary-light"> to build and save your team.</span>
        </p>

        <p v-if="error" class="alert-error mb-6">{{ error }}</p>

        <div class="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 items-start">
            <!-- Player market -->
            <section class="card p-5 min-w-0">
                <div class="flex flex-col sm:flex-row gap-3">
                    <input v-model="search" type="search" placeholder="Search players or teams" class="input sm:flex-1" />
                    <select v-model="sort" class="input sm:w-44!" aria-label="Sort by">
                        <option value="cost">Price: high to low</option>
                        <option value="costAsc">Price: low to high</option>
                        <option value="points">{{ STATS_SEASON }} points</option>
                        <option value="value">Points per $M</option>
                    </select>
                </div>

                <div class="flex flex-wrap gap-1.5 mt-3">
                    <button
                        v-for="pos in POSITION_FILTERS"
                        :key="pos"
                        class="px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                        :class="position === pos ? 'bg-secondary-dark text-white' : 'bg-white/5 text-primary-light hover:text-white hover:bg-white/10'"
                        @click="position = pos"
                    >
                        {{ pos }}
                    </button>
                    <label class="ml-auto flex items-center gap-2 text-xs text-primary-light cursor-pointer select-none">
                        <input v-model="affordableOnly" type="checkbox" class="accent-secondary-dark" />
                        Only what I can add
                    </label>
                </div>

                <p v-if="loading" class="py-16 text-center text-primary-light">Loading players...</p>
                <p v-else-if="!filtered.length" class="py-16 text-center text-primary-light">No players match.</p>

                <div v-else class="overflow-x-auto mt-4 -mx-5">
                    <table class="w-full text-sm whitespace-nowrap">
                        <thead>
                            <tr>
                                <th class="th text-left pl-5!">Player</th>
                                <th class="th text-left">Pos</th>
                                <th class="th text-right">Pts</th>
                                <th class="th text-right">Price</th>
                                <th class="th pr-5!"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="p in shown" :key="p.key" class="border-t border-white/5 hover:bg-white/3">
                                <td class="td pl-5!">
                                    <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="flex items-center gap-3 group">
                                        <img :src="playerPhotoUrl(p.id, 80)" alt="" loading="lazy" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                                        <span class="flex flex-col">
                                            <span class="font-medium group-hover:text-secondary">{{ p.name }}</span>
                                            <span class="flex items-center gap-1 text-xs text-primary-light">
                                                <template v-if="p.team">
                                                    <img :src="teamLogoUrl(p.team.id)" alt="" class="w-3.5 h-3.5" />
                                                    {{ p.team.abbreviation }}
                                                </template>
                                                <!-- No room for the stats on phones -->
                                                <span class="hidden sm:inline">· {{ statLine(p) }}</span>
                                            </span>
                                        </span>
                                    </RouterLink>
                                </td>
                                <td class="td font-semibold">{{ p.position }}</td>
                                <td class="td text-right">{{ p.points }}</td>
                                <td class="td text-right font-display text-xl font-bold">${{ p.cost }}M</td>
                                <td class="td text-right pr-5!">
                                    <span v-if="user && cantAddReason(p)" class="text-xs text-primary-light">{{ cantAddReason(p) }}</span>
                                    <button v-else class="btn-primary h-8! px-3! text-sm" @click="pick(p)">Add</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <button v-if="filtered.length > shown.length" class="btn-ghost w-full mt-4" @click="limit += PAGE_SIZE">
                    Show more players
                </button>
            </section>

            <!-- Team, stays in view while scrolling the market on big screens -->
            <div class="lg:sticky lg:top-20">
                <FantasyTeam
                    :team="team"
                    :budget="BUDGET"
                    :spent="spent"
                    :left="left"
                    :points="points"
                    :is-full="isFull"
                    :save-state="saveState"
                    :stats-season="STATS_SEASON"
                    :fantasy-season="FANTASY_SEASON"
                    @remove="remove"
                    @clear="clear"
                />
            </div>
        </div>
    </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'
import { useAuth } from '@/components/composables/useAuth'
import { useFantasy } from '@/components/composables/useFantasy'
import { BUDGET, STATS_SEASON, FANTASY_SEASON, SCORING, POSITION_FILTERS, statLine } from '@/components/composables/fantasy'
import FantasyTeam from '@/components/FantasyTeam.vue'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { market, team, spent, left, points, isFull, loading, error, saveState, cantAddReason, add, remove, clear } = useFantasy()

const search = ref('')
const position = ref('All')
const sort = ref('cost')
const affordableOnly = ref(false)

const SORTS = {
    cost: (a, b) => b.cost - a.cost || b.points - a.points,
    costAsc: (a, b) => a.cost - b.cost || b.points - a.points,
    points: (a, b) => b.points - a.points,
    value: (a, b) => b.points / b.cost - a.points / a.cost,
}

const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    return market.value
        .filter((p) => position.value === 'All' || p.position === position.value)
        .filter((p) => !q || p.name.toLowerCase().includes(q)
            || p.team?.name.toLowerCase().includes(q) || p.team?.abbreviation.toLowerCase() === q)
        .filter((p) => !affordableOnly.value || !cantAddReason(p))
        .sort(SORTS[sort.value])
})

const PAGE_SIZE = 50
const limit = ref(PAGE_SIZE)
const shown = computed(() => filtered.value.slice(0, limit.value))

// A new search or filter starts at the top of the list again
watch([search, position, sort, affordableOnly], () => (limit.value = PAGE_SIZE))

const loginLink = computed(() => ({ name: 'login', query: { redirect: route.fullPath } }))

function pick(player) {
    // Not logged in: go log in, then come back here
    if (!user.value) return router.push(loginLink.value)
    add(player)
}
</script>
