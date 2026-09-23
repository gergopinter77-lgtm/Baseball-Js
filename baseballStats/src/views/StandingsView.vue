<script setup>
import { ref, onMounted } from 'vue'
import { getStandings, teamLogoUrl } from '@/api/mlb'
import { CURRENT_SEASON } from '@/components/composables/player'

const divisions = ref([])

onMounted(async () => {
  const data = await getStandings(CURRENT_SEASON)
  divisions.value = data.records
})
</script>

<template>
  <main class="mx-20 py-12 grid grid-cols-12 gap-8 text-white">
    <section v-for="div in divisions" :key="div.division.id" class="col-span-6 bg-primary rounded-2xl p-8">
      <h2 class="text-3xl font-bold mb-4">{{ div.division.name }}</h2>
      <table class="w-full text-xl">
        <tr class="text-primary-light"><th class="text-left">Team</th><th>W</th><th>L</th><th>PCT</th><th>GB</th><th>STRK</th></tr>
        <tr v-for="t in div.teamRecords" :key="t.team.id" class="border-t border-white/10 text-center">
          <td class="text-left py-3 flex items-center gap-3">
            <img :src="teamLogoUrl(t.team.id)" class="w-8 h-8" alt="" />{{ t.team.teamName }}
          </td>
          <td>{{ t.wins }}</td><td>{{ t.losses }}</td><td>{{ t.winningPercentage }}</td>
          <td>{{ t.gamesBack }}</td><td>{{ t.streak?.streakCode }}</td>
        </tr>
      </table>
    </section>
  </main>
</template>

