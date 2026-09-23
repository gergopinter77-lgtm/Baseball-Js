<template>
    <div class="col-span-12 grid grid-cols-subgrid gap-y-10">
        <!-- ===== Tab buttons ===== -->
        <nav class="col-span-12 flex border-b-2 border-white/10">
            <button
                v-for="tab in TABS"
                :key="tab.id"
                class="flex-1 py-5 text-3xl border-b-4 -mb-0.5 hover:cursor-pointer"
                :class="activeTab === tab.id
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-primary-light hover:text-white'"
                @click="activeTab = tab.id"
            >
                {{ tab.label }}
            </button>
        </nav>

        <!-- ===== Overview tab ===== -->
        <template v-if="activeTab === 'overview'">
            <div class="col-span-12 2xl:col-span-4 self-start bg-primary-gradient rounded-2xl p-8">
                <h2 class="text-center text-3xl font-semibold mb-8">{{ CURRENT_SEASON }} Regular Season</h2>

                <div v-if="seasonStats" class="grid grid-cols-5 gap-4">
                    <div
                        v-for="item in statConfig.summary"
                        :key="item.key"
                        class="bg-white/10 rounded-xl py-4 text-center"
                    >
                        <div class="text-2xl font-bold">{{ seasonStats[item.key] ?? '–' }}</div>
                        <div class="text-base text-primary-light mt-1">{{ item.label }}</div>
                    </div>
                </div>
                <p v-else class="text-center text-2xl text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>

                <button
                    class="block w-full mt-8 bg-white/90 hover:bg-white text-primary text-2xl font-semibold rounded-xl py-3 hover:cursor-pointer"
                    @click="activeTab = 'season'"
                >
                    See all
                </button>
            </div>

            <div class="col-span-12 2xl:col-span-8 bg-primary-gradient rounded-2xl p-8">
                <h2 class="text-center text-3xl font-semibold mb-4">Most recent games</h2>
                <GameLogTable :games="games.slice(0, 5)" :columns="statConfig.gameLog" />
                <button
                    v-if="games.length > 5"
                    class="block mx-auto mt-6 text-2xl text-primary-light hover:text-white hover:cursor-pointer"
                    @click="activeTab = 'games'"
                >
                    All games →
                </button>
            </div>
        </template>

        <!-- ===== Games tab ===== -->
        <div v-else-if="activeTab === 'games'" class="col-span-12">
            <GameLogTable :games="games" :columns="statConfig.gameLog" />
        </div>

        <!-- ===== Season tab ===== -->
        <template v-else-if="activeTab === 'season'">
            <h2 class="col-span-12 text-4xl font-semibold">
                {{ CURRENT_SEASON }} Regular Season · {{ isPitcher ? 'Pitching' : 'Hitting' }}
            </h2>

            <template v-if="seasonStats">
                <div
                    v-for="item in statConfig.season"
                    :key="item.key"
                    class="col-span-4 xl:col-span-3 2xl:col-span-2 bg-primary-gradient rounded-2xl p-6"
                >
                    <div class="text-xl text-secondary font-semibold">{{ item.label }}</div>
                    <div class="text-5xl font-bold mt-2">{{ seasonStats[item.key] ?? '–' }}</div>
                    <div class="text-lg text-primary-light mt-2">{{ item.name }}</div>
                </div>
            </template>
            <p v-else class="col-span-12 text-2xl text-primary-light">No stats for {{ CURRENT_SEASON }} yet.</p>
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