<template>
    <!-- "vs [logo] Yankees  WORLD SERIES" -->
    <RouterLink :to="{ name: 'team', params: { id: game.opponent.id } }" class="flex items-center gap-2 group">
        <span class="text-primary-light w-5 text-xs">{{ game.isHome ? 'vs' : '@' }}</span>
        <img :src="teamLogoUrl(game.opponent.id)" alt="" class="w-6 h-6" />
        <span class="group-hover:text-secondary">{{ game.opponent.teamName }}</span>
        <span
            v-if="game.round"
            class="ml-1 px-2 py-0.5 rounded bg-secondary-dark/20 text-secondary text-[11px] font-semibold uppercase tracking-wide"
        >
            {{ game.round }}
        </span>
    </RouterLink>
</template>

<script setup>
import { teamLogoUrl } from '@/api/mlb'

defineProps({
    game: { type: Object, required: true },
})
</script>
