<template>
    <section class="flex flex-wrap gap-6 items-start">
            <img :src="playerPhotoUrl(player.id)"
                :alt="player.fullName"
                class="w-36 h-36 object-cover object-top rounded-lg bg-white/10">
        <div class="flex-1 min-w-60">
            <h1 class="text-3xl font-bold">
                {{ player.fullName }} &nbsp;-&nbsp;  {{ player.primaryPosition?.abbreviation }}
            </h1>
            <div v-if="player.currentTeam" class="flex items-center gap-3 mt-6 text-2xl font-semibold">
                <img :src="teamLogoUrl(player.currentTeam.id)" alt="" class="w-8 h-8">
                <span>{{ player.currentTeam.name }}</span>
            </div>
            <p class="mt-3 text-lg text-primary-light">{{ playerInfoLine(player) }}</p>
        </div>
        <button class="bg-secondary hover:bg-secondary-dark rounded px-4 py-2
        text-xl font-semibold flex items-center gap-6 hover:cursor-pointer"
        @click="toggleFavourite(player.id)">Favourite
            <span class="text-2xl" :class="isFavourite(player.id) ? 'text-yellow-300' : 'text-primary'">★</span>
            </button>
    </section>
</template>

<script setup>
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb';
import { playerInfoLine } from './composables/player'
import { useFavourites } from './composables/useFavorites';

defineProps({
    player: { type: Object, required: true },
})

const { isFavourite, toggleFavourite } = useFavourites()
</script>

<style lang="scss" scoped>

</style>