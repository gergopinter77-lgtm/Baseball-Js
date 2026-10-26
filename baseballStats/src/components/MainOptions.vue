<template>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-6">
        <RouterLink
            v-for="option in options"
            :key="option.to"
            :to="option.to"
            class="card p-5 flex items-center justify-between group hover:border-secondary/50 hover:bg-primary-raised transition-colors"
        >
            <div>
                <p class="font-display text-2xl font-semibold tracking-wide">{{ option.title }}</p>
                <p class="text-sm text-primary-light">{{ option.text }}</p>
            </div>
            <span class="text-secondary text-xl transition-transform group-hover:translate-x-1">→</span>
        </RouterLink>
    </div>
</template>

<script setup>
const options = [
    { to: '/compare', title: 'Compare', text: 'Two players side by side' },
    { to: '/standings', title: 'Standings', text: 'Divisions and the postseason' },
    { to: '/matches', title: 'Matches', text: "Today's games and who will win" },
]
</script>
