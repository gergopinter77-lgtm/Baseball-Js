<script setup>
import { teamLogoUrl } from '@/api/mlb'
import { useStandings } from '@/components/composables/useStandings'
import PostseasonBracket from '@/components/PostseasonBracket.vue'

const { divisions, tab, setTab } = useStandings()
</script>

<template>
  <main class="page grid grid-cols-12 gap-6">
    <div class="col-span-12 flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-4xl font-bold">Standings</h1>
      <div class="flex gap-1 card p-1">
        <button
          v-for="t in [{ id: 'regular', label: 'Regular season' }, { id: 'postseason', label: 'Postseason' }]"
          :key="t.id"
          class="px-4 py-2 rounded-lg text-sm font-semibold hover:cursor-pointer transition-colors"
          :class="tab === t.id ? 'bg-secondary-dark text-white' : 'text-primary-light hover:text-white'"
          @click="setTab(t.id)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <template v-if="tab === 'regular'">
      <section v-for="div in divisions" :key="div.division.id" class="col-span-12 lg:col-span-6 card p-5">
        <h2 class="text-xl font-semibold mb-2">{{ div.division.name }}</h2>
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="th text-left pl-0!">Team</th>
              <th class="th text-right">W</th>
              <th class="th text-right">L</th>
              <th class="th text-right">PCT</th>
              <th class="th text-right">GB</th>
              <th class="th text-right pr-0!">STRK</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in div.teamRecords" :key="t.team.id" class="border-t border-white/5">
              <td class="td pl-0!">
                <RouterLink :to="{ name: 'team', params: { id: t.team.id } }" class="flex items-center gap-2.5 font-medium hover:text-secondary">
                  <img :src="teamLogoUrl(t.team.id)" class="w-6 h-6" alt="" />{{ t.team.teamName }}
                </RouterLink>
              </td>
              <td class="td text-right">{{ t.wins }}</td>
              <td class="td text-right">{{ t.losses }}</td>
              <td class="td text-right">{{ t.winningPercentage }}</td>
              <td class="td text-right text-primary-light">{{ t.gamesBack }}</td>
              <td
                class="td text-right pr-0!"
                :class="t.streak?.streakType === 'wins' ? 'text-emerald-400' : 'text-secondary'"
              >
                {{ t.streak?.streakCode }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <PostseasonBracket v-else />
  </main>
</template>
