<template>
    <section class="bg-primary-raised/40 rounded-xl p-5 md:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 class="text-2xl font-semibold">Who will win?</h2>
            <p v-if="counts" class="text-sm text-primary-light">{{ total }} {{ total === 1 ? 'vote' : 'votes' }}</p>
        </div>

        <p v-if="loading" class="py-6 text-center text-primary-light">Loading poll...</p>

        <!-- Results: only after you voted -->
        <div v-else-if="counts" class="flex flex-col gap-3">
            <div v-for="t in teams" :key="t.id">
                <div class="flex items-center justify-between text-sm mb-1.5">
                    <span class="flex items-center gap-2 font-medium">
                        <img :src="teamLogoUrl(t.id)" alt="" class="w-6 h-6" />
                        {{ t.teamName }}
                        <span v-if="myVote === t.id" class="text-xs text-secondary">Your pick</span>
                    </span>
                    <span class="font-semibold">{{ percent(t.id) }}%</span>
                </div>
                <div class="h-2.5 rounded-full bg-white/8 overflow-hidden">
                    <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="myVote === t.id ? 'bg-secondary-dark' : 'bg-primary-light/60'"
                        :style="{ width: `${percent(t.id)}%` }"
                    />
                </div>
            </div>
        </div>

        <!-- Voting closes once the game starts -->
        <p v-else-if="closed" class="py-4 text-center text-primary-light">
            Voting closed when the game started.
        </p>

        <!-- Everyone sees the buttons; logged out users go to login -->
        <template v-else>
            <div class="grid grid-cols-2 gap-3">
                <button
                    v-for="t in teams"
                    :key="t.id"
                    :disabled="voting"
                    class="btn-ghost h-auto! py-4 flex-col"
                    @click="pick(t.id)"
                >
                    <img :src="teamLogoUrl(t.id)" alt="" class="w-10 h-10" />
                    <span>{{ t.teamName }}</span>
                </button>
            </div>
            <p class="text-sm text-primary-light text-center mt-3">
                <template v-if="user">Results show up after you vote.</template>
                <template v-else>Log in to vote. Results show up after you vote.</template>
            </p>
        </template>

        <p v-if="error" class="alert-error mt-4">{{ error }}</p>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { teamLogoUrl } from '@/api/mlb'
import { useAuth } from '@/components/composables/useAuth'
import { useLoginGate } from '@/components/composables/useLoginGate'
import { usePoll } from '@/components/composables/usePoll'

const props = defineProps({
    match: { type: Object, required: true },
})

const { user } = useAuth()
const { requireLogin } = useLoginGate()

const teams = computed(() => [props.match.away.team, props.match.home.team])
const closed = computed(() => props.match.state !== 'Preview')

const { myVote, counts, total, percent, loading, voting, error, vote } = usePoll(
    () => props.match.gamePk,
    () => teams.value.map((t) => t.id),
)

const pick = (teamId) => requireLogin() && vote(teamId)
</script>
