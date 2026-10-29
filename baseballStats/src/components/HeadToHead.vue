<template>
    <section>
        <h2 class="text-xl font-semibold mb-2">
            Previous matches
            <span class="text-sm font-sans font-normal text-primary-light ml-1">last {{ seasons }} seasons</span>
        </h2>

        <p v-if="!history.games.length" class="py-6 text-center text-primary-light bg-primary-raised/40 rounded-xl">
            These teams haven't played each other recently.
        </p>

        <template v-else>
            <!-- Series score: wins for each team -->
            <div class="flex items-center justify-center gap-6 bg-primary-raised/40 rounded-xl py-4 mb-3">
                <div v-for="(t, i) in teams" :key="t.id" class="flex items-center gap-3" :class="i === 1 && 'flex-row-reverse'">
                    <img loading="lazy" decoding="async" :src="teamLogoUrl(t.id)" alt="" class="w-8 h-8" />
                    <span class="font-display text-4xl font-bold">{{ history.wins[t.id] }}</span>
                </div>
            </div>

            <div class="overflow-x-auto bg-primary-raised/40 rounded-xl">
                <table class="w-full text-sm whitespace-nowrap text-left">
                    <thead>
                        <tr>
                            <th class="th">Date</th>
                            <th class="th">Away</th>
                            <th class="th text-center">Score</th>
                            <th class="th">Home</th>
                            <th class="th text-right hidden sm:table-cell"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="g in shown" :key="g.gamePk" class="border-t border-white/5 hover:bg-white/3">
                            <td class="td text-primary-light">
                                <RouterLink :to="{ name: 'match', params: { id: g.gamePk } }" class="hover:text-secondary">
                                    <span class="sm:hidden">{{ formatDayShort(g.day) }}</span>
                                    <span class="hidden sm:inline">{{ formatDay(g.day) }}</span>
                                </RouterLink>
                            </td>
                            <td class="td" :class="g.away.isWinner && 'font-semibold'">
                                <span class="flex items-center gap-2">
                                    <img loading="lazy" decoding="async" :src="teamLogoUrl(g.away.team.id)" alt="" class="w-5 h-5" />
                                    <span class="sm:hidden">{{ g.away.team.abbreviation }}</span>
                                    <span class="hidden sm:inline">{{ g.away.team.teamName }}</span>
                                </span>
                            </td>
                            <td class="td text-center font-semibold">{{ g.away.score }} – {{ g.home.score }}</td>
                            <td class="td" :class="g.home.isWinner && 'font-semibold'">
                                <span class="flex items-center gap-2">
                                    <img loading="lazy" decoding="async" :src="teamLogoUrl(g.home.team.id)" alt="" class="w-5 h-5" />
                                    <span class="sm:hidden">{{ g.home.team.abbreviation }}</span>
                                    <span class="hidden sm:inline">{{ g.home.team.teamName }}</span>
                                </span>
                            </td>
                            <td class="td text-right hidden sm:table-cell">
                                <span
                                    v-if="g.round"
                                    class="px-2 py-0.5 rounded bg-secondary-dark/20 text-secondary text-[11px] font-semibold uppercase tracking-wide"
                                >
                                    {{ g.round }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button
                v-if="history.games.length > shown.length"
                class="btn-ghost w-full mt-3"
                @click="limit += PAGE_SIZE"
            >
                Show more games
            </button>
        </template>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { teamLogoUrl } from '@/api/mlb'
import { formatDay, formatDayShort } from './composables/match'

const props = defineProps({
    history: { type: Object, required: true },
    // [away team, home team]
    teams: { type: Array, required: true },
    seasons: { type: Number, required: true },
})

const PAGE_SIZE = 10
const limit = ref(PAGE_SIZE)
const shown = computed(() => props.history.games.slice(0, limit.value))
</script>
