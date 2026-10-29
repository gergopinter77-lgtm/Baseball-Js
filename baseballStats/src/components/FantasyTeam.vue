<template>
    <!-- The user's fantasy team: budget on top, then every spot -->
    <section class="card p-5">
        <div class="flex items-baseline justify-between gap-2">
            <h2 class="text-2xl font-semibold">Your team</h2>
            <span class="text-xs" :class="SAVE_LABELS[saveState]?.class">{{ SAVE_LABELS[saveState]?.text }}</span>
        </div>

        <!-- Budget -->
        <div class="mt-4">
            <div class="flex items-baseline justify-between text-sm mb-1.5">
                <span class="text-primary-light">Budget left</span>
                <span class="font-display text-3xl font-bold" :class="left <= 0 ? 'text-secondary' : 'text-white'">${{ left }}M</span>
            </div>
            <div class="h-2.5 rounded-full bg-white/8 overflow-hidden">
                <div class="h-full rounded-full bg-secondary-dark transition-all duration-300" :style="{ width: `${(spent / budget) * 100}%` }" />
            </div>
            <p class="text-xs text-primary-light mt-1.5">${{ spent }}M of ${{ budget }}M spent</p>
        </div>

        <div class="flex gap-2 mt-4 text-sm">
            <span class="flex-1 px-3 py-2 rounded-md bg-white/5">
                <span class="text-primary-light">Players</span>
                <span class="font-semibold ml-1.5">{{ filled }}/{{ team.length }}</span>
            </span>
            <span class="flex-1 px-3 py-2 rounded-md bg-white/5">
                <span class="text-primary-light">{{ statsSeason }} pts</span>
                <span class="font-semibold ml-1.5">{{ points }}</span>
            </span>
        </div>

        <p v-if="isFull" class="alert-success mt-4">Your team is complete. Good luck in {{ fantasySeason }}!</p>

        <!-- Spots -->
        <ul class="mt-4 flex flex-col">
            <li v-for="slot in team" :key="slot.id" class="flex items-center gap-3 py-2 border-t border-white/5">
                <span class="w-10 shrink-0 text-xs font-semibold text-primary-light">{{ slot.label }}</span>

                <template v-if="slot.player">
                    <RouterLink :to="{ name: 'player', params: { id: slot.player.id } }" class="flex-1 min-w-0 flex items-center gap-2.5 group">
                        <img loading="lazy" decoding="async" :src="playerPhotoUrl(slot.player.id, 80)" alt="" class="w-7 aspect-[4/5] rounded object-cover bg-white/10" />
                        <span class="truncate text-sm font-medium group-hover:text-secondary">{{ slot.player.name }}</span>
                    </RouterLink>
                    <span class="text-sm font-semibold">${{ slot.player.cost }}M</span>
                    <button
                        class="w-7 h-7 rounded-md text-primary-light hover:text-white hover:bg-white/10 cursor-pointer"
                        :aria-label="`Remove ${slot.player.name}`"
                        @click="$emit('remove', slot.id)"
                    >
                        ✕
                    </button>
                </template>
                <span v-else class="flex-1 text-sm text-white/35">Empty</span>
            </li>
        </ul>

        <button v-if="filled" class="btn-ghost w-full mt-4" @click="$emit('clear')">Clear team</button>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { playerPhotoUrl } from '@/api/mlb'

const props = defineProps({
    team: { type: Array, required: true },
    budget: { type: Number, required: true },
    spent: { type: Number, required: true },
    left: { type: Number, required: true },
    points: { type: Number, required: true },
    isFull: { type: Boolean, required: true },
    saveState: { type: String, required: true },
    statsSeason: { type: Number, required: true },
    fantasySeason: { type: Number, required: true },
})

defineEmits(['remove', 'clear'])

const SAVE_LABELS = {
    saving: { text: 'Saving...', class: 'text-primary-light' },
    saved: { text: 'Saved', class: 'text-emerald-400' },
    error: { text: 'Could not save', class: 'text-secondary' },
}

const filled = computed(() => props.team.filter((s) => s.player).length)
</script>
