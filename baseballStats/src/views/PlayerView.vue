<template>
    <main class="page">
        <div class="card grid grid-cols-12 gap-x-6 gap-y-8 p-4 sm:p-6 md:p-8">
            <p v-if="loading" class="col-span-12 text-center text-lg text-primary-light py-24">Loading player...</p>
            <p v-else-if="error" class="col-span-12 text-center text-lg text-secondary py-24">{{ error }}</p>

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
