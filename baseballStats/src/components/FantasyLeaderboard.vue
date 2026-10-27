<template>
    <!-- You and your friends, best team first -->
    <section class="card p-5">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 class="text-2xl font-semibold">Friends leaderboard</h2>
            <p class="text-xs text-primary-light">
                Until the {{ fantasySeason }} season starts, teams are ranked by their players' {{ statsSeason }} points.
            </p>
        </div>

        <p v-if="!ranked.length" class="py-6 text-center text-sm text-primary-light">
            Log in to see how your team compares with your friends.
        </p>

        <div v-else class="overflow-x-auto -mx-5">
            <table class="w-full text-sm whitespace-nowrap">
                <thead>
                    <tr>
                        <th class="th text-left pl-5! w-12">#</th>
                        <th class="th text-left">Manager</th>
                        <th class="th text-right">Players</th>
                        <th class="th text-right">Spent</th>
                        <th class="th text-right pr-5!">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="(e, i) in ranked"
                        :key="e.uid"
                        class="border-t border-white/5"
                        :class="e.isMe && 'bg-secondary-dark/10'"
                    >
                        <td class="td pl-5! font-display text-xl font-bold" :class="i === 0 ? 'text-yellow-300' : 'text-primary-light'">
                            {{ i + 1 }}
                        </td>
                        <td class="td">
                            <span class="flex items-center gap-2.5">
                                <UserAvatar :photo="e.photo" :name="e.name" class="w-8 h-8 text-sm" />
                                <span class="font-medium">{{ e.name }}</span>
                                <span v-if="e.isMe" class="text-xs text-secondary">You</span>
                            </span>
                        </td>
                        <td class="td text-right text-primary-light">{{ e.players }}/{{ slotCount }}</td>
                        <td class="td text-right text-primary-light">${{ e.spent }}M</td>
                        <td class="td text-right pr-5! font-display text-xl font-bold">{{ e.points }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Only you so far: point to the friends page -->
        <p v-if="ranked.length === 1" class="text-sm text-primary-light text-center mt-4">
            <RouterLink to="/friends" class="text-secondary font-medium hover:underline">Add friends</RouterLink>
            to see their teams here.
        </p>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import UserAvatar from './UserAvatar.vue'

const props = defineProps({
    // [{ uid, name, photo, players, spent, points, isMe }]
    entries: { type: Array, required: true },
    slotCount: { type: Number, required: true },
    statsSeason: { type: Number, required: true },
    fantasySeason: { type: Number, required: true },
})

const ranked = computed(() => [...props.entries].sort((a, b) => b.points - a.points))
</script>
