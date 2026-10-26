<template>
    <main class="page">
        <div class="card p-6 md:p-8">
            <p v-if="loading && !match" class="text-center text-lg text-primary-light py-24">Loading match...</p>
            <p v-else-if="error" class="text-center text-lg text-secondary py-24">{{ error }}</p>

            <template v-else-if="match">
                <RouterLink
                    :to="{ name: 'matches', query: { date: match.day } }"
                    class="text-sm text-primary-light hover:text-secondary"
                >
                    ← All matches that day
                </RouterLink>

                <!-- Header: away @ home with the score or start time in the middle -->
                <section class="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mt-6">
                    <RouterLink
                        v-for="(s, i) in [match.away, match.home]"
                        :key="s.team.id"
                        :to="{ name: 'team', params: { id: s.team.id } }"
                        class="flex flex-col items-center text-center gap-2 group"
                        :class="i === 0 ? 'order-1' : 'order-3'"
                    >
                        <div class="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary-raised/60 flex items-center justify-center">
                            <img :src="teamLogoUrl(s.team.id)" :alt="s.team.name" class="w-14 h-14 md:w-16 md:h-16" />
                        </div>
                        <h1 class="text-2xl md:text-4xl font-bold group-hover:text-secondary">{{ s.team.teamName }}</h1>
                        <p class="text-sm text-primary-light">{{ s.record }} · {{ i === 0 ? 'Away' : 'Home' }}</p>
                    </RouterLink>

                    <div class="order-2 flex flex-col items-center text-center">
                        <span
                            v-if="match.round"
                            class="px-2 py-0.5 mb-2 rounded bg-secondary-dark/20 text-secondary text-[11px] font-semibold uppercase tracking-wide"
                        >
                            {{ match.round }}
                        </span>
                        <p v-if="match.state === 'Preview'" class="font-display text-3xl md:text-5xl font-bold">
                            {{ match.timeTBD ? 'TBD' : formatTime(match.date) }}
                        </p>
                        <p v-else class="font-display text-4xl md:text-6xl font-bold">
                            {{ match.away.score }} – {{ match.home.score }}
                        </p>
                        <p class="text-sm mt-1" :class="match.state === 'Live' ? 'text-emerald-400 font-semibold' : 'text-primary-light'">
                            {{ match.state === 'Live' ? '● Live' : match.status }}
                        </p>
                        <p v-if="match.seriesGame" class="text-xs text-primary-light mt-1">{{ match.seriesGame }}</p>
                    </div>
                </section>

                <p class="text-center text-sm text-primary-light mt-6">
                    {{ formatDate(match.date) }}<template v-if="match.venue"> · {{ match.venue }}</template>
                </p>

                <!-- Probable starting pitchers -->
                <div v-if="match.away.pitcher || match.home.pitcher" class="grid grid-cols-2 gap-3 mt-6">
                    <div v-for="s in [match.away, match.home]" :key="s.team.id" class="bg-primary-raised/40 rounded-xl px-4 py-3">
                        <p class="text-xs uppercase tracking-wider text-primary-light mb-1.5">{{ s.team.teamName }} starter</p>
                        <RouterLink
                            v-if="s.pitcher"
                            :to="{ name: 'player', params: { id: s.pitcher.id } }"
                            class="flex items-center gap-3 group"
                        >
                            <img :src="playerPhotoUrl(s.pitcher.id, 80)" alt="" class="w-9 aspect-[4/5] rounded-md object-cover bg-white/10" />
                            <span class="font-medium group-hover:text-secondary">{{ s.pitcher.fullName }}</span>
                        </RouterLink>
                        <p v-else class="text-primary-light">TBD</p>
                    </div>
                </div>

                <div class="flex flex-col gap-8 mt-8">
                    <WhoWillWinPoll :match="match" />

                    <HeadToHead :history="history" :teams="[match.away.team, match.home.team]" :seasons="H2H_SEASONS" />

                    <section>
                        <h2 class="text-xl font-semibold mb-2">Players</h2>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                            <MatchRoster :team="match.away.team" :groups="rosters.away" />
                            <MatchRoster :team="match.home.team" :groups="rosters.home" />
                        </div>
                    </section>
                </div>
            </template>
        </div>
    </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { teamLogoUrl, playerPhotoUrl } from '@/api/mlb'
import { useMatch, H2H_SEASONS } from '@/components/composables/useMatch'
import { formatDate, formatTime } from '@/components/composables/match'
import WhoWillWinPoll from '@/components/WhoWillWinPoll.vue'
import HeadToHead from '@/components/HeadToHead.vue'
import MatchRoster from '@/components/MatchRoster.vue'

const route = useRoute()
const { match, rosters, history, loading, error } = useMatch(() => route.params.id)
</script>
