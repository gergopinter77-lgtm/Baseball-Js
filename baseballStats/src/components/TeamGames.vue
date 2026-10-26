<template>
    <div class="flex flex-col gap-8">
        <!-- Upcoming games, only when there are any -->
        <section v-if="upcoming.length">
            <h2 class="text-xl font-semibold mb-2">Upcoming games</h2>
            <div class="overflow-x-auto bg-primary-raised/40 rounded-xl">
                <table class="w-full text-sm whitespace-nowrap text-left">
                    <thead>
                        <tr>
                            <th class="th">Date</th>
                            <th class="th">Time</th>
                            <th class="th">Opponent</th>
                            <th class="th">Venue</th>
                            <th class="th text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="g in upcoming" :key="g.gamePk" class="border-t border-white/5">
                            <td class="td">{{ formatDate(g.date) }}</td>
                            <td class="td text-primary-light">{{ g.timeTBD ? 'TBD' : formatTime(g.date) }}</td>
                            <td class="td"><OpponentCell :game="g" /></td>
                            <td class="td text-primary-light">{{ g.venue }}</td>
                            <td class="td text-right">
                                <RouterLink :to="{ name: 'match', params: { id: g.gamePk } }" class="hover:text-secondary">
                                    <span v-if="g.state === 'Live'" class="text-emerald-400 font-semibold">● Live</span>
                                    <span v-else class="text-primary-light">{{ g.status }}</span>
                                    <span class="text-secondary ml-1.5">→</span>
                                </RouterLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Results, newest first -->
        <section>
            <h2 class="text-xl font-semibold mb-2">Past games</h2>
            <p v-if="!past.length" class="py-6 text-center text-primary-light">No games played yet this season.</p>
            <div v-else class="overflow-x-auto bg-primary-raised/40 rounded-xl">
                <table class="w-full text-sm whitespace-nowrap text-left">
                    <thead>
                        <tr>
                            <th class="th">Date</th>
                            <th class="th">Opponent</th>
                            <th class="th">Result</th>
                            <th class="th text-right">Record</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="g in shownPast" :key="g.gamePk" class="border-t border-white/5 hover:bg-white/3">
                            <td class="td text-primary-light">{{ formatDate(g.date) }}</td>
                            <td class="td"><OpponentCell :game="g" /></td>
                            <td class="td font-semibold">
                                <RouterLink :to="{ name: 'match', params: { id: g.gamePk } }" class="hover:underline">
                                    <span :class="g.result === 'W' ? 'text-emerald-400' : 'text-secondary'">{{ g.result }}</span>
                                    {{ g.score }}
                                </RouterLink>
                            </td>
                            <td class="td text-right text-primary-light">{{ g.record || '–' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button
                v-if="past.length > shownPast.length"
                class="btn-ghost w-full mt-3"
                @click="limit += PAGE_SIZE"
            >
                Show more games
            </button>
        </section>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import OpponentCell from './OpponentCell.vue'

const props = defineProps({
    past: { type: Array, required: true },
    upcoming: { type: Array, required: true },
})

const PAGE_SIZE = 20
const limit = ref(PAGE_SIZE)
const shownPast = computed(() => props.past.slice(0, limit.value))

function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatTime(iso) {
    return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}
</script>
