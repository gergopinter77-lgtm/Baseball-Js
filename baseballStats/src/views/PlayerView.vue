<template>
    <main class="mx-20 py-12">
        <div class="grid grid-cols-12 gap-x-8 gap-y-10 bg-primary rounded-2xl p-12 text-white">
            <p v-if="loading" class="col-span-12 text-center text-3xl text-primary-light py-32">Loading player...</p>
            <p v-else-if="error" class="col-span-12 text-center text-3xl text-secondary py-32">{{ error }}</p>

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