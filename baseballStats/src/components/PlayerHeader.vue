<template>
    <section class="col-span-12 grid grid-cols-subgrid items-center">
        <img
            :src="playerPhotoUrl(player.id)"
            :alt="player.fullName"
            class="col-span-2 w-full h-100 aspect-square object-cover object-top rounded-2xl bg-white/10"
        />

        <div class="col-span-7">
            <h1 class="text-6xl font-bold">
                {{ player.fullName }} &nbsp;-&nbsp; {{ player.primaryPosition?.abbreviation }}
            </h1>
            <div v-if="player.currentTeam" class="flex items-center gap-5 mt-8 text-4xl font-semibold">
                <img :src="teamLogoUrl(player.currentTeam.id)" alt="" class="w-14 h-14" />
                <span>{{ player.currentTeam.name }}</span>
            </div>
            <p class="mt-5 text-2xl text-primary-light">{{ playerInfoLine(player) }}</p>
        </div>

        <button
            class="col-span-3 self-start bg-secondary hover:bg-secondary-dark rounded-xl my-23 px-8 py-5 text-3xl font-semibold flex items-center justify-between hover:cursor-pointer"
            @click="toggleFavourite(player.id)"
        >
            Favourite
            <span class="text-4xl" :class="isFavourite(player.id) ? 'text-yellow-300' : 'text-primary'">★</span>
        </button>
    </section>
</template>

<script setup>
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'
import { playerInfoLine } from './composables/player'
import { useFavourites } from './composables/useFavorites'

defineProps({
    player: { type: Object, required: true },
})

const { isFavourite, toggleFavourite } = useFavourites()
</script>