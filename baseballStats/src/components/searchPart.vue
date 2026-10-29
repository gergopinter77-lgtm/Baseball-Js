<template>
    <div class="relative w-full max-w-2xl">
        <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
            v-model="query"
            type="text"
            placeholder="Search a player or team, e.g. Aaron Judge or Yankees"
            class="input h-14! pl-12! text-lg! rounded-xl! bg-primary!"
        />

        <ul
            v-if="showResults"
            class="absolute left-0 right-0 top-full mt-2 z-10 card shadow-2xl overflow-hidden"
        >
            <template v-if="matchingTeams.length">
                <li class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-primary-light">Teams</li>
                <li
                    v-for="t in matchingTeams"
                    :key="'team-' + t.id"
                    class="flex items-center gap-3 px-4 py-2.5 hover:cursor-pointer hover:bg-white/5"
                    @click="selectTeam(t)"
                >
                    <img loading="lazy" decoding="async" :src="teamLogoUrl(t.id)" alt="" class="w-8 h-8" />
                    <span class="flex-1">{{ t.name }}</span>
                    <span class="text-xs font-semibold text-primary-light">{{ t.abbreviation }}</span>
                </li>
                <li v-if="players.length" class="px-4 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-primary-light border-t border-white/5">Players</li>
            </template>
            <li v-if="loading && !players.length" class="px-4 py-3 text-primary-light">Searching...</li>
            <li v-else-if="error" class="px-4 py-3 text-secondary">{{ error }}</li>
            <li
                v-for="p in players"
                :key="p.id"
                class="flex items-center gap-3 px-4 py-2.5 hover:cursor-pointer hover:bg-white/5"
                @click="selectPlayer(p)"
            >
                <img loading="lazy" decoding="async" :src="playerPhotoUrl(p.id, 80)" alt="" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                <span class="flex-1">{{ p.fullName }}</span>
                <span class="text-xs font-semibold text-primary-light">{{ p.primaryPosition?.abbreviation }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'
import { useHomeSearch } from './composables/useHomeSearch'

const { query, players, loading, error, matchingTeams, showResults, selectPlayer, selectTeam } = useHomeSearch()
</script>

