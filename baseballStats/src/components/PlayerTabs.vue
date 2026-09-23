<template>
    <div>
        <!-- ===== Tab buttons ===== -->
        <nav class="flex mt-8 border-b border-white/10">
            <button
                v-for="tab in TABS"
                :key="tab.id"
                class="flex-1 py-3 text-lg border-b-2 hover:cursor-pointer"
                :class="activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-primary-light hover:text-white'"
                @click="activeTab = tab.id"
            >
                {{ tab.label }}
            </button>
        </nav>

        <!-- ===== Overview tab ===== -->
        <section v-if="activeTab === 'overview'" class="grid md:grid-cols-[1fr_2fr] gap-6 mt-6">
            <div class="bg-primary-gradient rounded-lg p-4 self-start">
                <h2 class="text-center font-semibold mb-4">{{ CURRENT_SEASON }} Regular Season</h2>

                <div v-if="seasonStats" class="grid grid-cols-5 gap-2">
                    <div
                        v-for="item in statConfig.summary"
                        :key="item.key"
                        class="bg-white/10 rounded py-2 text-center"
                    >
                        <div class="text-lg font-bold">{{ seasonStats[item.key] ?? '–' }}</div>
                        <div class="text-xs text-primary-light">{{ item.label }}</div>
                    </div>
                </div>
                <p v-else class="text-center text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>

                <button
                    class="block w-full mt-4 bg-white/90 hover:bg-white text-primary font-semibold rounded py-1 hover:cursor-pointer"
                    @click="activeTab = 'season'"
                >
                    See all
                </button>
            </div>

            <div class="bg-primary-gradient rounded-lg p-4">
                <h2 class="text-center font-semibold mb-2">Most recent games</h2>
                <GameLogTable :games="games.slice(0, 5)" :columns="statConfig.gameLog" />
                <button
                    v-if="games.length > 5"
                    class="block mx-auto mt-3 text-primary-light hover:text-white hover:cursor-pointer"
                    @click="activeTab = 'games'"
                >
                    All games →
                </button>
            </div>
        </section>

        <!-- ===== Games tab ===== -->
        <section v-else-if="activeTab === 'games'" class="mt-6">
            <GameLogTable :games="games" :columns="statConfig.gameLog" />
        </section>

        <!-- ===== Season tab ===== -->
        <section v-else-if="activeTab === 'season'" class="mt-6">
            <h2 class="text-xl font-semibold mb-4">
                {{ CURRENT_SEASON }} Regular Season · {{ isPitcher ? 'Pitching' : 'Hitting' }}
            </h2>

            <div v-if="seasonStats" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <div v-for="item in statConfig.season" :key="item.key" class="bg-primary-gradient rounded-lg p-4">
                    <div class="text-sm text-secondary font-semibold">{{ item.label }}</div>
                    <div class="text-2xl font-bold">{{ seasonStats[item.key] ?? '–' }}</div>
                    <div class="text-xs text-primary-light">{{ item.name }}</div>
                </div>
            </div>
            <p v-else class="text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>
        </section>
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