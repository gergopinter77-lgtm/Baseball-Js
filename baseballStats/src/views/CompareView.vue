<template>
    <main class="page grid grid-cols-12 gap-4 md:gap-6">
        <h1 class="col-span-12 text-4xl font-bold">Compare players</h1>

        <!-- Row 1: two search boxes -->
        <div class="col-span-12 md:col-span-6">
            <PlayerSearch placeholder="Player A..." @select="(player) => pick('a', player)" />
        </div>
        <div class="col-span-12 md:col-span-6">
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
        <p v-if="message" class="col-span-12 text-center text-primary-light py-4">{{ message }}</p>

        <div v-else class="col-span-12 card overflow-hidden">
            <table class="w-full text-center">
                <thead class="bg-primary-raised/60">
                    <tr>
                        <th class="th w-2/5 text-sm! normal-case! tracking-normal! text-white!">{{ a.player.fullName }}</th>
                        <th class="th">Stat</th>
                        <th class="th w-2/5 text-sm! normal-case! tracking-normal! text-white!">{{ b.player.fullName }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in rows" :key="row.key" class="border-t border-white/5">
                        <td class="td text-lg" :class="row.winner === 'a' ? 'text-secondary font-semibold' : ''">
                            {{ row.valueA ?? '–' }}
                        </td>
                        <td class="td text-sm text-primary-light">{{ row.name }}</td>
                        <td class="td text-lg" :class="row.winner === 'b' ? 'text-secondary font-semibold' : ''">
                            {{ row.valueB ?? '–' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
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
