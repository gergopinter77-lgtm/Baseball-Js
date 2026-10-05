<template>
    <main class="grid grid-cols-12 gap-6 mx-20 py-12 text-white">
        <!-- Row 1: two search boxes -->
        <div class="col-span-6">
            <PlayerSearch placeholder="Player A..." @select="(player) => pick('a', player)" />
        </div>
        <div class="col-span-6">
            <PlayerSearch placeholder="Player B..." @select="(player) => pick('b', player)" />
        </div>

        <!-- Row 2: two player cards -->
        <div class="col-span-6">
            <CompareCard :player="a.player" :loading="a.loading" :error="a.error" />
        </div>
        <div class="col-span-6">
            <CompareCard :player="b.player" :loading="b.loading" :error="b.error" />
        </div>

        <!-- Row 3: the comparison table (or a message) -->
        <p v-if="message" class="col-span-12 text-center text-2xl text-primary-light">{{ message }}</p>

        <table v-else class="col-span-12 rounded-xl overflow-hidden bg-primary text-xl text-center">
            <thead>
                <tr>
                    <th class="px-4 py-3">{{ a.player.fullName }}</th>
                    <th class="px-4 py-3">Stat</th>
                    <th class="px-4 py-3">{{ b.player.fullName }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in rows" :key="row.key" class="border-t border-white/10">
                    <td class="px-4 py-3" :class="{ 'text-secondary font-bold': row.winner === 'a' }">
                        {{ row.valueA ?? '–' }}
                    </td>
                    <td class="px-4 py-3 text-primary-light">{{ row.name }}</td>
                    <td class="px-4 py-3" :class="{ 'text-secondary font-bold': row.winner === 'b' }">
                        {{ row.valueB ?? '–' }}
                    </td>
                </tr>
            </tbody>
        </table>
    </main>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useCompare } from '@/components/composables/useCompare'
import PlayerSearch from '@/components/PlayerSearch.vue'
import CompareCard from '@/components/CompareCard.vue'

const route = useRoute()
const router = useRouter()

// The two player ids live in the address: /compare?a=801139&b=592450
const { a, b, message, rows } = useCompare(
    () => route.query.a,
    () => route.query.b,
)

// side is 'a' or 'b'
function pick(side, player) {
    router.replace({ query: { ...route.query, [side]: player.id } })
}
</script>