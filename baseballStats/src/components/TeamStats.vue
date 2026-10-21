<template>
    <div class="flex flex-col gap-8">
        <section v-for="block in TEAM_STATS" :key="block.group">
            <h2 class="text-xl font-semibold mb-3">{{ CURRENT_SEASON }} {{ block.title }}</h2>
            <div v-if="stats[block.group]" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                <div v-for="item in block.stats" :key="item.key" class="bg-primary-raised/60 rounded-xl p-4">
                    <div class="text-xs font-semibold uppercase tracking-wider text-secondary">{{ item.label }}</div>
                    <div class="font-display text-3xl font-semibold mt-1">{{ stats[block.group][item.key] ?? '–' }}</div>
                    <div class="text-xs text-primary-light mt-1">{{ item.name }}</div>
                </div>
            </div>
            <p v-else class="text-primary-light">No {{ block.title.toLowerCase() }} stats yet.</p>
        </section>
    </div>
</template>

<script setup>
import { CURRENT_SEASON } from './composables/player'
import { TEAM_STATS } from './composables/team'

defineProps({
    stats: { type: Object, required: true },
})
</script>
