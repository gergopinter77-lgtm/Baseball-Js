<template>
    <div class="flex flex-col gap-6">
        <p v-if="!groups.length" class="py-8 text-center text-primary-light">No roster available.</p>

        <section v-for="group in groups" :key="group.id">
            <h2 class="text-xl font-semibold mb-2">
                {{ group.title }}
                <span class="text-sm font-sans font-normal text-primary-light ml-1">{{ group.players.length }}</span>
            </h2>

            <div class="overflow-x-auto bg-primary-raised/40 rounded-xl">
                <table class="w-full text-sm whitespace-nowrap">
                    <thead>
                        <tr>
                            <th class="th text-left w-10">#</th>
                            <th class="th text-left">Player</th>
                            <th class="th text-left">Pos</th>
                            <th class="th text-left">B/T</th>
                            <th class="th text-right">Age</th>
                            <th v-for="col in ROSTER_COLUMNS[group.stats]" :key="col.key" class="th text-right">{{ col.label }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in group.players" :key="p.id" class="border-t border-white/5 hover:bg-white/3">
                            <td class="td text-primary-light">{{ p.number ?? '–' }}</td>
                            <td class="td">
                                <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="flex items-center gap-3 group">
                                    <img :src="playerPhotoUrl(p.id, 80)" alt="" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                                    <span class="font-medium group-hover:text-secondary">{{ p.name }}</span>
                                    <span v-if="p.status" class="text-xs text-secondary">{{ p.status }}</span>
                                </RouterLink>
                            </td>
                            <td class="td">{{ p.position }}</td>
                            <td class="td text-primary-light">{{ p.batsThrows }}</td>
                            <td class="td text-right text-primary-light">{{ p.age ?? '–' }}</td>
                            <td v-for="col in ROSTER_COLUMNS[group.stats]" :key="col.key" class="td text-right">
                                {{ p.stat?.[col.key] ?? '–' }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    </div>
</template>

<script setup>
import { playerPhotoUrl } from '@/api/mlb'
import { ROSTER_COLUMNS } from './composables/team'

defineProps({
    groups: { type: Array, required: true },
})
</script>
