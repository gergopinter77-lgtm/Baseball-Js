<template>
    <!-- A player starts at the top, so both photos line up however long the names are -->
    <div
        class="card p-4 md:p-6 text-center h-full flex flex-col items-center min-h-64"
        :class="player && !loading && !error ? 'justify-start' : 'justify-center'"
    >
        <p v-if="loading" class="text-primary-light">Loading...</p>
        <p v-else-if="error" class="text-secondary">{{ error }}</p>

        <template v-else-if="player">
            <img
                :src="playerPhotoUrl(player.id)"
                :alt="player.fullName"
                class="w-full max-w-52 aspect-[4/5] object-cover rounded-xl bg-white/10"
            />
            <h2 class="mt-4 text-2xl md:text-3xl font-bold">{{ player.fullName }}</h2>
            <p class="text-sm text-primary-light">
                {{ player.primaryPosition?.abbreviation }} · {{ player.currentTeam?.name }}
            </p>
        </template>

        <p v-else class="text-primary-light">No player picked yet</p>
    </div>
</template>

<script setup>
import { playerPhotoUrl } from '@/api/mlb'

defineProps({
    player: { type: Object, default: null },
    loading: { type: Boolean, default: false },
    error: { type: String, default: '' },
})
</script>
