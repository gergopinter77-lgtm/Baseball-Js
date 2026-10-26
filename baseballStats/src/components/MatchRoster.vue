<template>
    <!-- One team's players, short version for the match page -->
    <section class="bg-primary-raised/40 rounded-xl overflow-hidden">
        <RouterLink :to="{ name: 'team', params: { id: team.id } }" class="flex items-center gap-3 px-4 py-3 border-b border-white/5 group">
            <img :src="teamLogoUrl(team.id)" alt="" class="w-8 h-8" />
            <h3 class="text-xl font-semibold group-hover:text-secondary">{{ team.name }}</h3>
        </RouterLink>

        <p v-if="!groups.length" class="py-8 text-center text-primary-light">No roster available.</p>

        <table v-else class="w-full text-sm whitespace-nowrap">
            <template v-for="group in groups" :key="group.id">
                <thead>
                    <tr>
                        <th class="th text-left w-10">#</th>
                        <th class="th text-left">{{ group.title }}</th>
                        <th class="th text-left">Pos</th>
                        <th v-for="col in COLUMNS[group.stats]" :key="col.key" class="th text-right">{{ col.label }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="p in group.players" :key="p.id" class="border-t border-white/5 hover:bg-white/3">
                        <td class="td text-primary-light">{{ p.number ?? '–' }}</td>
                        <td class="td">
                            <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="flex items-center gap-2.5 group">
                                <img :src="playerPhotoUrl(p.id, 80)" alt="" class="w-7 aspect-[4/5] rounded object-cover bg-white/10" />
                                <span class="font-medium group-hover:text-secondary">{{ p.name }}</span>
                            </RouterLink>
                        </td>
                        <td class="td">{{ p.position }}</td>
                        <td v-for="col in COLUMNS[group.stats]" :key="col.key" class="td text-right">
                            {{ p.stat?.[col.key] ?? '–' }}
                        </td>
                    </tr>
                </tbody>
            </template>
        </table>
    </section>
</template>

<script setup>
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'

defineProps({
    team: { type: Object, required: true },
    groups: { type: Array, required: true },
})

// Only the most important stats, so both teams fit next to each other
const COLUMNS = {
    pitching: [
        { key: 'era', label: 'ERA' },
        { key: 'strikeOuts', label: 'K' },
    ],
    hitting: [
        { key: 'avg', label: 'AVG' },
        { key: 'homeRuns', label: 'HR' },
    ],
}
</script>
