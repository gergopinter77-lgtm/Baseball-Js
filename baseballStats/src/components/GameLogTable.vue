<template>
    <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap">
            <thead class="text-primary-light text-sm">
                <tr>
                    <th class="py-3 px-2">Date</th>
                    <th class="py-3 px-2">Opponent</th>
                    <th class="py-3 px-2">Result</th>
                    <th v-for="col in columns" :key="col.key" class="py-3 px-2">
                        {{ col.lable }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="game in games" :key="game.gamePk" class="border-t border-white/10">
                    <td class="py-3 px-2 text-primary-light">{{ formatDate(game.date) }}</td>
                    <td class="py-2 px-2">
                        <div class="flex items-center gap-2">
                            <span class="text-primary-light w-5">{{ game.isHome ? 'vs' : '@' }}</span>
                            <img :src="teamlogoUrl(game.opponent.id)" alt="teamLogo" class="w-6 h-6">
                            <span>{{ game.opponent.name }}</span>
                        </div>
                    </td>
                    <td class="py-3 px-2">
                        <span v-if="game.result" class="inline-block min-w-16 text-center rounded-full px-3 py-0.5 text-sm font-semibold"
                            :class="game.result === 'W' ? 'bg-green-600' : 'bg-secondary'">
                            {{ game.result }} {{ game.score }}
                        </span>
                        <span v-else class="text-primary-light">-</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-if="!games.length" py-6 text-center text-primary-light>No games yet this season.</p>
    </div>
</template>

<script setup>
import { teamlogoUrl } from '@/api/mlb';

defineProps({
    games: { type:Array, required: true },
    columns: { type: Array, required: true },
})

function formatDate(date) {
    const[, month, day] = date.split('-')
    return `${day}/${month}`
}
</script>

<style lang="scss" scoped>

</style>