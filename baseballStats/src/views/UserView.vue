<template>
    <main class="page">
        <p v-if="loading" class="card text-center text-lg text-primary-light py-24">Loading profile...</p>
        <p v-else-if="person?.missing" class="card text-center text-lg text-primary-light py-24">This user doesn't exist.</p>

        <template v-else-if="person">
            <!-- Picture, name, bio and friend buttons -->
            <section class="card p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
                <UserAvatar :photo="person.photoURL" :name="person.displayName" class="w-24 h-24 md:w-28 md:h-28 text-5xl" />
                <div class="flex-1 min-w-0">
                    <h1 class="text-4xl md:text-5xl font-bold break-words">{{ person.displayName }}</h1>
                    <p class="mt-2 text-primary-light whitespace-pre-line">{{ person.bio || 'No bio yet.' }}</p>
                </div>
                <div class="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <RouterLink v-if="isMe" to="/profile" class="btn-ghost">Edit profile</RouterLink>
                    <FriendActions v-else :uid="person.uid" allow-remove @error="actionError = $event" />
                </div>
            </section>

            <p v-if="actionError" class="alert-error mt-4">{{ actionError }}</p>

            <!-- Favourite players and teams -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <section class="card p-5 md:p-6">
                    <h2 class="text-2xl font-semibold mb-3">Favourite players</h2>
                    <p v-if="favouritesLoading" class="py-6 text-center text-primary-light">Loading...</p>
                    <p v-else-if="!favouritePlayers.length" class="py-6 text-center text-primary-light">No favourite players yet.</p>
                    <ul v-else>
                        <li v-for="p in favouritePlayers" :key="p.id" class="border-t border-white/5 first:border-t-0">
                            <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="flex items-center gap-3 py-2 group">
                                <img :src="playerPhotoUrl(p.id, 80)" alt="" class="w-8 aspect-[4/5] rounded-md object-cover bg-white/10" />
                                <span class="flex-1 min-w-0">
                                    <span class="block truncate font-medium group-hover:text-secondary">{{ p.fullName }}</span>
                                    <span class="block text-xs text-primary-light">
                                        {{ p.primaryPosition?.abbreviation }}<template v-if="p.currentTeam?.name"> · {{ p.currentTeam.name }}</template>
                                    </span>
                                </span>
                            </RouterLink>
                        </li>
                    </ul>
                </section>

                <section class="card p-5 md:p-6">
                    <h2 class="text-2xl font-semibold mb-3">Favourite teams</h2>
                    <p v-if="favouritesLoading" class="py-6 text-center text-primary-light">Loading...</p>
                    <p v-else-if="!favouriteTeams.length" class="py-6 text-center text-primary-light">No favourite teams yet.</p>
                    <ul v-else>
                        <li v-for="t in favouriteTeams" :key="t.id" class="border-t border-white/5 first:border-t-0">
                            <RouterLink :to="{ name: 'team', params: { id: t.id } }" class="flex items-center gap-3 py-2 group">
                                <img :src="teamLogoUrl(t.id)" alt="" class="w-8 h-8" />
                                <span class="truncate font-medium group-hover:text-secondary">{{ t.name }}</span>
                            </RouterLink>
                        </li>
                    </ul>
                </section>
            </div>

            <!-- Fantasy team: only for you and your friends -->
            <section class="card p-5 md:p-6 mt-6">
                <div class="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                    <h2 class="text-2xl font-semibold">Fantasy {{ FANTASY_SEASON }} team</h2>
                    <div v-if="canSeeTeam && totals.players" class="flex gap-2 text-sm">
                        <span class="px-3 py-1 rounded-md bg-white/5">
                            <span class="text-primary-light">Players</span>
                            <span class="font-semibold ml-1.5">{{ totals.players }}/{{ team.length }}</span>
                        </span>
                        <span class="px-3 py-1 rounded-md bg-white/5">
                            <span class="text-primary-light">Spent</span>
                            <span class="font-semibold ml-1.5">${{ totals.spent }}M</span>
                        </span>
                        <span class="px-3 py-1 rounded-md bg-white/5">
                            <span class="text-primary-light">{{ STATS_SEASON }} pts</span>
                            <span class="font-semibold ml-1.5">{{ totals.points }}</span>
                        </span>
                    </div>
                </div>

                <p v-if="!canSeeTeam" class="py-8 text-center text-primary-light">
                    Become friends with {{ person.displayName }} to see their fantasy team.
                </p>
                <p v-else-if="teamLoading" class="py-8 text-center text-primary-light">Loading team...</p>
                <p v-else-if="!totals.players" class="py-8 text-center text-primary-light">
                    {{ isMe ? "You haven't" : `${person.displayName} hasn't` }} picked a fantasy team yet.
                </p>

                <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                    <li v-for="slot in team" :key="slot.id" class="flex items-center gap-3 py-2 border-t border-white/5">
                        <span class="w-10 shrink-0 text-xs font-semibold text-primary-light">{{ slot.label }}</span>
                        <template v-if="slot.player">
                            <RouterLink :to="{ name: 'player', params: { id: slot.player.id } }" class="flex-1 min-w-0 flex items-center gap-2.5 group">
                                <img :src="playerPhotoUrl(slot.player.id, 80)" alt="" class="w-7 aspect-[4/5] rounded object-cover bg-white/10" />
                                <span class="truncate text-sm font-medium group-hover:text-secondary">{{ slot.player.name }}</span>
                            </RouterLink>
                            <span class="text-sm font-semibold">${{ slot.player.cost }}M</span>
                        </template>
                        <span v-else class="flex-1 text-sm text-white/35">Empty</span>
                    </li>
                </ul>
            </section>
        </template>
    </main>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'
import UserAvatar from '@/components/UserAvatar.vue'
import FriendActions from '@/components/FriendActions.vue'
import { useUserProfile } from '@/components/composables/useUserProfile'
import { STATS_SEASON, FANTASY_SEASON } from '@/components/composables/fantasy'

const route = useRoute()
const {
    person, loading, isMe, canSeeTeam,
    favouritePlayers, favouriteTeams, favouritesLoading,
    team, totals, teamLoading,
} = useUserProfile(() => route.params.id)

const actionError = ref('')
watch(() => route.params.id, () => (actionError.value = ''))
</script>
