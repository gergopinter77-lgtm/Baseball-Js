<template>
    <div class="col-span-12 grid grid-cols-subgrid gap-y-6">
        <!-- ===== Tab buttons ===== -->
        <nav class="col-span-12 flex gap-6 border-b border-white/10">
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

        <!-- ===== Overview tab ===== -->
        <template v-if="activeTab === 'overview'">
            <div class="col-span-12 xl:col-span-5 self-start bg-primary-raised/60 rounded-xl p-5">
                <h2 class="text-xl font-semibold mb-4">{{ CURRENT_SEASON }} Regular Season</h2>

                <div v-if="seasonStats" class="grid grid-cols-5 gap-2">
                    <div
                        v-for="item in statConfig.summary"
                        :key="item.key"
                        class="bg-white/5 rounded-lg py-3 text-center"
                    >
                        <div class="font-display text-2xl font-semibold">{{ seasonStats[item.key] ?? '–' }}</div>
                        <div class="text-xs font-semibold uppercase tracking-wider text-primary-light mt-0.5">{{ item.label }}</div>
                    </div>
                </div>
                <p v-else class="text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>

                <button class="btn-ghost w-full mt-4" @click="activeTab = 'season'">See all stats</button>
            </div>

            <div class="col-span-12 xl:col-span-7 bg-primary-raised/60 rounded-xl p-2">
                <div class="flex items-center justify-between mb-2 mx-2.75">
                    <h2 class="text-xl font-semibold">Most recent games</h2>
                    <button
                        v-if="games.length > 5"
                        class="text-sm font-medium text-secondary hover:text-white hover:cursor-pointer"
                        @click="activeTab = 'games'"
                    >
                        All games →
                    </button>
                </div>
                <GameLogTable :games="games.slice(0, 5)" :columns="statConfig.gameLog" />
            </div>
        </template>

        <!-- ===== Games tab ===== -->
        <div v-else-if="activeTab === 'games'" class="col-span-12">
            <GameLogTable :games="games" :columns="statConfig.gameLog" />
        </div>

        <!-- ===== Season tab ===== -->
        <template v-else-if="activeTab === 'season'">
            <h2 class="col-span-12 text-2xl font-semibold">
                {{ CURRENT_SEASON }} Regular Season · {{ isPitcher ? 'Pitching' : 'Hitting' }}
            </h2>

            <template v-if="seasonStats">
                <div
                    v-for="item in statConfig.season"
                    :key="item.key"
                    class="col-span-6 sm:col-span-4 lg:col-span-3 xl:col-span-2 bg-primary-raised/60 rounded-xl p-4"
                >
                    <div class="text-xs font-semibold uppercase tracking-wider text-secondary">{{ item.label }}</div>
                    <div class="font-display text-4xl font-semibold mt-1">{{ seasonStats[item.key] ?? '–' }}</div>
                    <div class="text-sm text-primary-light mt-1">{{ item.name }}</div>
                </div>
            </template>
            <p v-else class="col-span-12 text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>
        </template>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { CURRENT_SEASON } from '@/components/composables/player'
import GameLogTable from './GameLogTable.vue'

defineProps({
    seasonStats: { type: Object, default: null },
    games: { type: Array, required: true },
    statConfig: { type: Object, required: true },
    isPitcher: { type: Boolean, default: false },
})

const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'games', label: 'Games' },
    { id: 'season', label: 'Season' },
]

const activeTab = ref('overview')
</script>
