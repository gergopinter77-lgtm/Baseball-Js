<template>
    <main class="page">
        <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
                <h1 class="text-4xl md:text-5xl font-bold">Matches</h1>
                <p class="text-primary-light mt-1">{{ longDate }}</p>
            </div>

            <!-- Day picker -->
            <div class="flex items-center gap-2">
                <button class="btn-ghost px-3!" aria-label="Previous day" @click="setDate(addDays(date, -1))">←</button>
                <input type="date" :value="date" class="input w-auto! scheme-dark" @change="setDate($event.target.value)" />
                <button class="btn-ghost px-3!" aria-label="Next day" @click="setDate(addDays(date, 1))">→</button>
                <button v-if="date !== today" class="btn-ghost" @click="setDate(today)">Today</button>
            </div>
        </div>

        <p v-if="loading" class="card text-center text-lg text-primary-light py-24">Loading matches...</p>
        <p v-else-if="error" class="card text-center text-lg text-secondary py-24">{{ error }}</p>
        <p v-else-if="!matches.length" class="card text-center text-lg text-primary-light py-24">No matches on this day.</p>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RouterLink
                v-for="m in matches"
                :key="m.gamePk"
                :to="{ name: 'match', params: { id: m.gamePk } }"
                class="card p-5 hover:border-secondary/50 hover:bg-primary-raised transition-colors"
            >
                <div class="flex items-center justify-between text-xs mb-3">
                    <span v-if="m.state === 'Live'" class="text-emerald-400 font-semibold">● Live</span>
                    <span v-else-if="m.state === 'Preview'" class="text-primary-light">
                        {{ m.timeTBD ? 'Time TBD' : formatTime(m.date) }}
                    </span>
                    <span v-else class="text-primary-light">{{ m.status }}</span>
                    <span
                        v-if="m.round"
                        class="px-2 py-0.5 rounded bg-secondary-dark/20 text-secondary text-[11px] font-semibold uppercase tracking-wide"
                    >
                        {{ m.round }}<template v-if="m.seriesGame"> · {{ m.seriesGame }}</template>
                    </span>
                </div>

                <div v-for="s in [m.away, m.home]" :key="s.team.id" class="flex items-center gap-3 py-1">
                    <img :src="teamLogoUrl(s.team.id)" alt="" class="w-8 h-8" />
                    <div class="flex-1 min-w-0">
                        <p class="font-medium truncate" :class="m.state === 'Final' && !s.isWinner && 'text-primary-light'">
                            {{ s.team.name }}
                            <span class="text-xs text-primary-light font-normal ml-1">{{ s.record }}</span>
                        </p>
                        <p v-if="m.state === 'Preview' && s.pitcher" class="text-xs text-primary-light truncate">
                            SP {{ s.pitcher.fullName }}
                        </p>
                    </div>
                    <span v-if="s.score != null" class="font-display text-2xl font-bold" :class="!s.isWinner && m.state === 'Final' && 'text-primary-light'">
                        {{ s.score }}
                    </span>
                </div>
            </RouterLink>
        </div>
    </main>
</template>

<script setup>
import { teamLogoUrl } from '@/api/mlb'
import { addDays, formatTime } from '@/components/composables/match'
import { useMatchesByDate } from '@/components/composables/useMatchesByDate'

const { today, date, longDate, matches, loading, error, setDate } = useMatchesByDate()
</script>
