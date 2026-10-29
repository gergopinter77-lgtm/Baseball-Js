<template>
    <div class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap text-sm">
            <thead>
                <tr>
                    <th class="th">Date</th>
                    <th class="th">Opponent</th>
                    <th class="th">Result</th>
                    <th v-for="col in columns" :key="col.key" class="th text-right">
                        {{ col.label }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="game in games" :key="game.gamePk" class="border-t border-white/5 hover:bg-white/3">
                    <td class="td text-primary-light">{{ formatDate(game.date) }}</td>
                    <td class="td">
                        <div class="flex items-center gap-2">
                            <span class="text-primary-light w-5 text-xs">{{ game.isHome ? 'vs' : '@' }}</span>
                            <img loading="lazy" decoding="async" :src="teamLogoUrl(game.opponent.id)" alt="" class="w-6 h-6" />
                            <span>{{ game.opponent.name }}</span>
                        </div>
                    </td>
                    <td class="td">
                        <span v-if="game.result" class="font-semibold">
                            <span :class="game.result === 'W' ? 'text-emerald-400' : 'text-secondary'">{{ game.result }}</span>
                            {{ game.score }}
                        </span>
                        <span v-else class="text-primary-light">–</span>
                    </td>
                    <td v-for="col in columns" :key="col.key" class="td text-right">
                        {{ game.stat[col.key] ?? '–' }}
                    </td>
                </tr>
            </tbody>
        </table>

        <p v-if="!games.length" class="py-8 text-center text-primary-light">No games yet this season.</p>
    </div>
</template>

<script setup>
import { teamLogoUrl } from '@/api/mlb'

defineProps({
    games: { type: Array, required: true },
    columns: { type: Array, required: true },
})

function formatDate(date) {
    const [, month, day] = date.split('-')
    return `${day}/${month}`
}
</script>
