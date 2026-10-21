<template>
    <section class="col-span-12 flex flex-col sm:flex-row sm:items-center gap-6">
        <img
            :src="playerPhotoUrl(player.id)"
            :alt="player.fullName"
            class="w-36 md:w-44 aspect-[4/5] object-cover rounded-xl bg-white/10 shrink-0"
        />

        <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-baseline gap-x-3">
                <h1 class="text-4xl md:text-5xl font-bold">{{ player.fullName }}</h1>
                <span class="font-display text-2xl font-semibold text-secondary">{{ player.primaryPosition?.abbreviation }}</span>
            </div>
            <RouterLink
                v-if="player.currentTeam"
                :to="{ name: 'team', params: { id: player.currentTeam.id } }"
                class="inline-flex items-center gap-2.5 mt-3 text-lg font-medium hover:text-secondary"
            >
                <img :src="teamLogoUrl(player.currentTeam.id)" alt="" class="w-7 h-7" />
                <span>{{ player.currentTeam.name }}</span>
            </RouterLink>
            <p class="mt-3 text-sm text-primary-light leading-relaxed">{{ playerInfoLine(player) }}</p>
        </div>

        <button
            class="self-start sm:self-center"
            :class="isFavourite(player.id) ? 'btn-primary' : 'btn-ghost'"
            @click="toggleFavourite(player.id)"
        >
            <span :class="isFavourite(player.id) ? 'text-yellow-300' : 'text-primary-light'">★</span>
            {{ isFavourite(player.id) ? 'Favourited' : 'Add to favourites' }}
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
