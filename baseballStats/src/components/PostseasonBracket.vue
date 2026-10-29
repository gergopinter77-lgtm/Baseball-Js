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
                                        <img loading="lazy" decoding="async" v-if="t.team?.id" :src="teamLogoUrl(t.team.id)" alt="" class="w-5 h-5" />
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
                            <th class="th text-left hidden sm:table-cell">Game</th>
                            <th class="th text-left">Date</th>
                            <th class="th text-left">Away</th>
                            <th class="th text-center">R</th>
                            <th class="th text-left sm:pl-6!">Home</th>
                            <th class="th text-center">R</th>
                            <th class="th text-right hidden sm:table-cell">Status</th>
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
                            <td class="td hidden sm:table-cell">
                                <RouterLink v-if="hasTeams(g)" :to="matchLink(g)" class="hover:text-secondary">{{ g.seriesGameNumber }}</RouterLink>
                                <template v-else>{{ g.seriesGameNumber }}</template>
                            </td>
                            <td class="td">
                                {{ formatDate(g.gameDate) }}
                                <span v-if="g.ifNecessary === 'Y' && !isPlayed(g)" class="sm:hidden block text-[11px]">if needed</span>
                            </td>
                            <td class="td" :class="g.teams.away.isWinner && 'font-bold'">
                                <span class="flex items-center gap-2">
                                    <img loading="lazy" decoding="async" v-if="g.teams.away.team?.id" :src="teamLogoUrl(g.teams.away.team.id)" alt="" class="w-6 h-6" />
                                    <span class="sm:hidden">{{ g.teams.away.team?.abbreviation ?? 'TBD' }}</span>
                                    <span class="hidden sm:inline">{{ g.teams.away.team?.teamName ?? 'TBD' }}</span>
                                </span>
                            </td>
                            <td class="td text-center" :class="g.teams.away.isWinner && 'font-bold'">{{ g.teams.away.score ?? '–' }}</td>
                            <td class="td sm:pl-6!" :class="g.teams.home.isWinner && 'font-bold'">
                                <span class="flex items-center gap-2">
                                    <img loading="lazy" decoding="async" v-if="g.teams.home.team?.id" :src="teamLogoUrl(g.teams.home.team.id)" alt="" class="w-6 h-6" />
                                    <span class="sm:hidden">{{ g.teams.home.team?.abbreviation ?? 'TBD' }}</span>
                                    <span class="hidden sm:inline">{{ g.teams.home.team?.teamName ?? 'TBD' }}</span>
                                </span>
                            </td>
                            <td class="td text-center" :class="g.teams.home.isWinner && 'font-bold'">{{ g.teams.home.score ?? '–' }}</td>
                            <td class="td text-right hidden sm:table-cell">
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
import { useRouter } from 'vue-router'
import { teamLogoUrl } from '@/api/mlb'
import { BRACKET_COLUMNS, abbr, formatDate } from './composables/postseason'
import { usePostseason, BRACKET_SEASONS as seasons, isPlayed, hasTeams, matchLink } from './composables/usePostseason'

const router = useRouter()
const { season, seriesById, selectedId, selected, loading, error } = usePostseason()
</script>
