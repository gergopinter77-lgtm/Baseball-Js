<template>
    <div class="p-6 rounded-xl bg-primary text-center">
        <p v-if="loading">Loading...</p>
        <p v-else-if="error">{{ error }}</p>

        <template v-else-if="player">
            <img
                :src="playerPhotoUrl(player.id)"
                :alt="player.fullName"
                class="w-80 h-100 mx-auto object-cover object-top rounded-xl"
            />
            <h2 class="mt-4 text-3xl font-bold">{{ player.fullName }}</h2>
            <p class="text-primary-light">
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