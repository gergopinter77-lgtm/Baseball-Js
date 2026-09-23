<template>
    <main class="px-4 py-8">
        <div class="max-w-5xl mx-auto bg-primary rounded-lg p-6 text-white">
            <p v-if="loading" class="text-center text-primary-light py-20">Loading player...</p>
            <p v-else-if="error" class="text-center text-secondary py-20">{{ error }}</p>

            <template v-else-if="player">
                <PlayerHeader :player="player" />
                <PlayerTabs
                    :key="player.id"
                    :season-stats="seasonStats"
                    :games="games"
                    :stat-config="statConfig"
                    :is-pitcher="isPitcher"
                />
            </template>
        </div>
    </main>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { usePlayer } from '@/components/composables/usePlayer'
import PlayerHeader from '@/components/PlayerHeader.vue'
import PlayerTabs from '@/components/PlayerTabs.vue'

const route = useRoute()
const { player, seasonStats, games, loading, error, isPitcher, statConfig } = usePlayer(() => route.params.id)
</script>