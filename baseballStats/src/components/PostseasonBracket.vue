<template>
    <div class="col-span-12">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 class="text-2xl font-semibold">{{ season }} Postseason</h2>
            <select
                v-model="season"
                class="input w-32! bg-primary! hover:cursor-pointer"
            >
                <option v-for="y in seasons" :key="y" :value="y">{{ y }}</option>
            </select>
        </div>

        <p v-if="loading" class="card p-8 text-primary-light text-center">Loading bracket...</p>
        <p v-else-if="error" class="card p-8 text-secondary text-center">{{ error }}</p>
        <p v-else-if="!seriesById.size" class="card p-8 text-primary-light text-center">
            The {{ season }} postseason hasn't started yet.
        </p>

        <template v-else>
            <!-- Bracket: scrolls sideways on small screens -->
            <section class="card p-5 overflow-x-auto">
                <div class="grid grid-cols-7 gap-4 min-w-[1000px]">
                    <div v-for="col in BRACKET_COLUMNS" :key="col.title" class="flex flex-col">
                        <h3
                            class="text-center text-xs font-semibold uppercase tracking-wider mb-4"
                            :class="col.title === 'World Series' ? 'text-secondary' : 'text-primary-light'"
                        >
                            {{ col.title }}
                        </h3>
                        <div class="flex-1 flex flex-col justify-around gap-6 min-h-72">
                            <template v-for="id in col.ids" :key="id">
                                <button
                                    v-if="seriesById.get(id)"
                                    class="text-left text-sm rounded-lg bg-primary-raised/60 border overflow-hidden hover:border-secondary hover:cursor-pointer transition-colors"
                                    :class="[
                                        selectedId === id ? 'border-secondary' : 'border-white/10',
                                        id === 'W_1' && 'ring-1 ring-secondary/40',
                                    ]"
                                    @click="selectedId = id"
                                >
                                    <div
                                        v-for="(t, i) in seriesById.get(id).teams"
                                        :key="i"
                                        class="flex items-center gap-2 px-3 py-1.5"
                                        :class="[i === 0 && 'border-b border-white/10', t.isLoser && 'opacity-45']"
                                    >
                                        <img v-if="t.team?.id" :src="teamLogoUrl(t.team.id)" alt="" class="w-5 h-5" />
                                        <span v-else class="w-5 h-5 rounded-full bg-white/10"></span>
                                        <span class="flex-1 truncate" :class="t.isWinner ? 'font-bold' : 'font-medium'">{{ abbr(t.team) }}</span>
                                        <span class="font-display text-lg tabular-nums" :class="t.isWinner ? 'font-bold text-white' : 'text-primary-light'">
                                            {{ t.wins }}
                                        </span>
                                    </div>
                                    <p class="px-3 py-1 text-[11px] text-primary-light bg-black/15">{{ seriesById.get(id).status }}</p>
                                </button>
                                <div v-else class="rounded-lg border border-dashed border-white/10 h-20 flex items-center justify-center text-primary-light text-sm">
                                    TBD
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Game by game results of the clicked series -->
            <section v-if="selected" class="card p-5 mt-6 overflow-x-auto">
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                    <h3 class="text-xl font-semibold">{{ selected.name }}</h3>
                    <p class="text-sm text-primary-light">Best of {{ selected.bestOf }} · {{ selected.status }}</p>
                </div>
                <table class="w-full text-sm whitespace-nowrap">
                    <thead>
                        <tr>
                            <th class="th text-left">Game</th>
                            <th class="th text-left">Date</th>
                            <th class="th text-left">Away</th>
                            <th class="th text-center">R</th>
                            <th class="th text-left pl-6!">Home</th>
                            <th class="th text-center">R</th>
                            <th class="th text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="g in selected.games"
                            :key="g.gamePk"
                            class="border-t border-white/5"
                            :class="[!isPlayed(g) && 'text-primary-light', hasTeams(g) && 'cursor-pointer hover:bg-white/3']"
                            @click="hasTeams(g) && router.push(matchLink(g))"
                        >
                            <td class="td">
                                <RouterLink v-if="hasTeams(g)" :to="matchLink(g)" class="hover:text-secondary">{{ g.seriesGameNumber }}</RouterLink>
                                <template v-else>{{ g.seriesGameNumber }}</template>
                            </td>
                            <td class="td">{{ formatDate(g.gameDate) }}</td>
                            <td class="td" :class="g.teams.away.isWinner && 'font-bold'">
                                <span class="flex items-center gap-2">
                                    <img v-if="g.teams.away.team?.id" :src="teamLogoUrl(g.teams.away.team.id)" alt="" class="w-6 h-6" />
                                    {{ g.teams.away.team?.teamName ?? 'TBD' }}
                                </span>
                            </td>
                            <td class="td text-center" :class="g.teams.away.isWinner && 'font-bold'">{{ g.teams.away.score ?? '–' }}</td>
                            <td class="td pl-6!" :class="g.teams.home.isWinner && 'font-bold'">
                                <span class="flex items-center gap-2">
                                    <img v-if="g.teams.home.team?.id" :src="teamLogoUrl(g.teams.home.team.id)" alt="" class="w-6 h-6" />
                                    {{ g.teams.home.team?.teamName ?? 'TBD' }}
                                </span>
                            </td>
                            <td class="td text-center" :class="g.teams.home.isWinner && 'font-bold'">{{ g.teams.home.score ?? '–' }}</td>
                            <td class="td text-right">
                                {{ g.status.detailedState }}<span v-if="g.ifNecessary === 'Y' && !isPlayed(g)" class="text-xs"> (if needed)</span>
                                <span v-if="hasTeams(g)" class="text-secondary ml-1.5">→</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        </template>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getPostseason, teamLogoUrl } from '@/api/mlb'
import { CURRENT_SEASON } from './composables/player'
import { BRACKET_COLUMNS, FIRST_BRACKET_SEASON, summarizeSeries, abbr, formatDate } from './composables/postseason'

const seasons = Array.from(
    { length: CURRENT_SEASON - FIRST_BRACKET_SEASON + 1 },
    (_, i) => CURRENT_SEASON - i,
)

const router = useRouter()

// A game opens its match page once both teams are known (not "TBD")
const hasTeams = (g) => !!(g.teams.away.team?.id && g.teams.home.team?.id)
const matchLink = (g) => ({ name: 'match', params: { id: g.gamePk } })

const season = ref(CURRENT_SEASON)
const seriesById = ref(new Map())
const selectedId = ref('W_1')
const loading = ref(false)
const error = ref('')

const selected = computed(() => seriesById.value.get(selectedId.value))

// Games that have been played (or are being played) show a score
function isPlayed(game) {
    return game.status.abstractGameState !== 'Preview'
}

watch(season, async (year) => {
    loading.value = true
    error.value = ''
    try {
        const data = await getPostseason(year)
        if (year !== season.value) return
        seriesById.value = new Map((data.series ?? []).map((s) => [s.series.id, summarizeSeries(s)]))
        selectedId.value = 'W_1'
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}, { immediate: true })
</script>
