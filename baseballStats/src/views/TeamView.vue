<template>
    <main class="page">
        <div class="card p-6 md:p-8">
            <p v-if="loading && !team" class="text-center text-lg text-primary-light py-24">Loading team...</p>
            <p v-else-if="error" class="text-center text-lg text-secondary py-24">{{ error }}</p>

            <template v-else-if="team">
                <!-- Header -->
                <section class="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div class="w-24 h-24 md:w-28 md:h-28 rounded-xl bg-primary-raised/60 flex items-center justify-center shrink-0">
                        <img :src="teamLogoUrl(team.id)" :alt="team.name" class="w-16 h-16 md:w-20 md:h-20" />
                    </div>

                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-baseline gap-x-3">
                            <h1 class="text-4xl md:text-5xl font-bold">{{ team.name }}</h1>
                            <span class="font-display text-2xl font-semibold text-secondary">{{ team.abbreviation }}</span>
                        </div>
                        <p class="mt-2 text-sm text-primary-light">
                            {{ team.division?.name }} · {{ team.venue?.name }}
                        </p>

                        <div v-if="record" class="flex flex-wrap gap-2 mt-4">
                            <span class="px-3 py-1 rounded-md bg-white/5 text-sm">
                                <span class="text-primary-light">Record</span>
                                <span class="font-semibold ml-1.5">{{ record.leagueRecord.wins }}-{{ record.leagueRecord.losses }}</span>
                            </span>
                            <span v-if="record.divisionRank" class="px-3 py-1 rounded-md bg-white/5 text-sm">
                                <span class="font-semibold">{{ ordinal(record.divisionRank) }}</span>
                                <span class="text-primary-light ml-1.5">in division</span>
                            </span>
                            <span v-if="record.streak" class="px-3 py-1 rounded-md bg-white/5 text-sm">
                                <span class="text-primary-light">Streak</span>
                                <span
                                    class="font-semibold ml-1.5"
                                    :class="record.streak.streakType === 'wins' ? 'text-emerald-400' : 'text-secondary'"
                                >
                                    {{ record.streak.streakCode }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <button
                        class="self-start sm:self-center"
                        :class="isFavouriteTeam(team.id) ? 'btn-primary' : 'btn-ghost'"
                        @click="toggleFavouriteTeam(team.id)"
                    >
                        <span :class="isFavouriteTeam(team.id) ? 'text-yellow-300' : 'text-primary-light'">★</span>
                        {{ isFavouriteTeam(team.id) ? 'Favourited' : 'Add to favourites' }}
                    </button>
                </section>

                <!-- Tabs -->
                <nav class="flex gap-6 border-b border-white/10 mt-8 mb-6">
                    <button
                        v-for="tab in TABS"
                        :key="tab.id"
                        class="pb-3 text-sm font-semibold uppercase tracking-wider border-b-2 -mb-px hover:cursor-pointer transition-colors"
                        :class="activeTab === tab.id
                            ? 'border-secondary text-white'
                            : 'border-transparent text-primary-light hover:text-white'"
                        @click="activeTab = tab.id"
                    >
                        {{ tab.label }}
                    </button>
                </nav>

                <TeamRoster v-if="activeTab === 'roster'" :groups="rosterGroups" />
                <TeamGames v-else-if="activeTab === 'games'" :past="pastGames" :upcoming="upcomingGames" />
                <TeamStats v-else :stats="stats" />
            </template>
        </div>
    </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { teamLogoUrl } from '@/api/mlb'
import { useTeam } from '@/components/composables/useTeam'
import { useFavouriteTeams } from '@/components/composables/useFavorites'
import { ordinal } from '@/components/composables/team'
import TeamRoster from '@/components/TeamRoster.vue'
import TeamGames from '@/components/TeamGames.vue'
import TeamStats from '@/components/TeamStats.vue'

const route = useRoute()
const { team, rosterGroups, pastGames, upcomingGames, stats, loading, error } = useTeam(() => route.params.id)
const { isFavouriteTeam, toggleFavouriteTeam } = useFavouriteTeams()

const TABS = [
    { id: 'roster', label: 'Roster' },
    { id: 'games', label: 'Games' },
    { id: 'stats', label: 'Team stats' },
]

const activeTab = ref('roster')
const record = computed(() => team.value?.record)

// Opening another team starts on the roster again
watch(() => route.params.id, () => (activeTab.value = 'roster'))
</script>
