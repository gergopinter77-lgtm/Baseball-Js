<template>
    <section class="bg-primary-raised/40 rounded-xl p-5 md:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 class="text-2xl font-semibold">Discussion</h2>
            <p v-if="user" class="text-sm text-primary-light">{{ comments.length }} {{ comments.length === 1 ? 'comment' : 'comments' }}</p>
        </div>

        <!-- Logged out: the discussion needs an account, to read and to write -->
        <p v-if="!user" class="text-sm text-center py-6">
            <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="text-secondary font-medium hover:underline">Log in</RouterLink>
            <span class="text-primary-light"> to see and join the discussion.</span>
        </p>

        <template v-else>
            <!-- Write a comment, and maybe rate one player -->
            <form class="flex gap-3" @submit.prevent="submit">
                <UserAvatar :photo="profile?.photoURL" :name="profile?.displayName" class="w-9 h-9 text-sm hidden sm:flex" />
                <div class="flex-1 min-w-0">
                    <label for="comment" class="sr-only">Your comment</label>
                    <textarea
                        id="comment"
                        :value="text"
                        rows="3"
                        :maxlength="COMMENT_MAX"
                        :placeholder="`What did you think of ${match.away.team.teamName} vs ${match.home.team.teamName}?`"
                        class="input h-auto! py-3 resize-y min-h-24"
                        spellcheck="true"
                        autocomplete="off"
                        @input="onInput"
                    />

                    <!-- Optional: rate one player who played -->
                    <div class="flex flex-wrap items-center gap-3 mt-3">
                        <label for="rate-player" class="text-sm text-primary-light">Rate a player</label>
                        <select id="rate-player" v-model="ratedPlayerId" class="input h-9! w-auto! max-w-full text-sm py-0!">
                            <option :value="0">{{ players.away.length ? 'No rating' : 'Loading players...' }}</option>
                            <optgroup v-for="side in ['away', 'home']" :key="side" :label="match[side].team.name">
                                <option v-for="p in players[side]" :key="p.id" :value="p.id">
                                    {{ p.name }} ({{ p.position }}){{ p.summary ? ` · ${p.summary}` : '' }}
                                </option>
                            </optgroup>
                        </select>
                        <template v-if="ratedPlayer">
                            <StarRating v-model="stars" />
                            <button type="button" class="text-xs text-primary-light hover:text-white cursor-pointer" @click="clearRating">Remove rating</button>
                        </template>
                    </div>

                    <div class="flex flex-wrap items-center justify-between gap-2 mt-3">
                        <p class="text-xs text-primary-light">
                            Plain text only.
                            <span :class="text.length >= COMMENT_MAX && 'text-secondary'">{{ text.length }}/{{ COMMENT_MAX }}</span>
                            <span v-if="ratedPlayer && !stars" class="text-secondary ml-1">Pick 1–5 stars for {{ ratedPlayer.name }}.</span>
                        </p>
                        <button type="submit" class="btn-primary h-9! px-4! text-sm" :disabled="!canPost || posting">
                            {{ posting ? 'Posting...' : 'Post' }}
                        </button>
                    </div>
                </div>
            </form>

            <p v-if="error" class="alert-error mt-4">{{ error }}</p>

            <!-- Fan ratings: average stars per player -->
            <div v-if="ratings.length" class="mt-5 pt-4 border-t border-white/5">
                <h3 class="text-lg font-semibold mb-2">Fan ratings</h3>
                <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    <li v-for="r in ratings" :key="r.playerId" class="flex items-center gap-2 text-sm">
                        <img :src="teamLogoUrl(r.teamId)" alt="" class="w-4 h-4" />
                        <RouterLink :to="{ name: 'player', params: { id: r.playerId } }" class="flex-1 min-w-0 truncate hover:text-secondary">
                            {{ r.playerName }}
                        </RouterLink>
                        <StarRating :model-value="r.average" readonly size="sm" />
                        <span class="w-16 text-right text-xs text-primary-light">
                            {{ r.average.toFixed(1) }} ({{ r.count }})
                        </span>
                    </li>
                </ul>
            </div>

            <!-- Comments, newest first. User text is shown with {{ }} only, never v-html. -->
            <p v-if="!loaded" class="py-8 text-center text-primary-light border-t border-white/5 mt-5">Loading comments...</p>
            <p v-else-if="!comments.length" class="py-8 text-center text-primary-light border-t border-white/5 mt-5">
                No comments yet. Start the discussion!
            </p>
            <ul v-else class="mt-5">
                <li v-for="c in comments" :key="c.id" class="flex gap-3 py-3 border-t border-white/5">
                    <RouterLink :to="{ name: 'user', params: { id: c.uid } }" class="shrink-0">
                        <UserAvatar :photo="c.photoURL" :name="c.displayName" class="w-9 h-9 text-sm" />
                    </RouterLink>
                    <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                            <RouterLink :to="{ name: 'user', params: { id: c.uid } }" class="font-semibold hover:text-secondary">
                                {{ c.displayName }}
                            </RouterLink>
                            <!-- Their favourite team -->
                            <span
                                v-if="c.favouriteTeam"
                                class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[11px] font-semibold text-primary-light"
                                :title="`Favourite team: ${c.favouriteTeam.name ?? ''}`"
                            >
                                <img :src="teamLogoUrl(c.favouriteTeam.id)" alt="" class="w-3.5 h-3.5" />
                                {{ c.favouriteTeam.abbreviation }}
                            </span>
                            <span class="text-xs text-primary-light">{{ timeAgo(c.createdAt) }}</span>

                            <template v-if="c.canDelete">
                                <template v-if="confirmingDelete === c.id">
                                    <button class="ml-auto text-xs text-secondary hover:underline cursor-pointer" @click="deleteComment(c.id)">Delete</button>
                                    <button class="text-xs text-primary-light hover:text-white cursor-pointer" @click="confirmingDelete = ''">Keep</button>
                                </template>
                                <button
                                    v-else
                                    class="ml-auto text-xs text-primary-light hover:text-white cursor-pointer"
                                    @click="confirmingDelete = c.id"
                                >
                                    Delete
                                </button>
                            </template>
                        </div>

                        <p v-if="c.rating" class="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                            <span class="text-primary-light">Rated</span>
                            <RouterLink :to="{ name: 'player', params: { id: c.rating.playerId } }" class="font-medium hover:text-secondary">
                                {{ c.rating.playerName }}
                            </RouterLink>
                            <StarRating :model-value="c.rating.stars" readonly size="sm" />
                        </p>
                        <p v-if="c.text" class="mt-1 text-sm whitespace-pre-line break-words">{{ c.text }}</p>
                    </div>
                </li>
            </ul>
        </template>
    </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import UserAvatar from './UserAvatar.vue'
import StarRating from './StarRating.vue'
import { getBoxscore, teamLogoUrl } from '@/api/mlb'
import { useAuth } from './composables/useAuth'
import { useDiscussion } from './composables/useDiscussion'
import { playersWhoPlayed, timeAgo } from './composables/match'
import { COMMENT_MAX, cleanWhileTyping, cleanForPosting } from './composables/sanitize'

const props = defineProps({
    match: { type: Object, required: true },
})

const route = useRoute()
const { user, profile } = useAuth()
const { comments, ratings, loaded, posting, error, post, remove } = useDiscussion(
    () => props.match.gamePk,
    () => [props.match.away.team.id, props.match.home.team.id],
)

// ---------- Players who played, for the rating ----------

const players = ref({ away: [], home: [] })

watch([() => props.match.gamePk, () => user.value?.uid], async ([gamePk, uid]) => {
    players.value = { away: [], home: [] }
    if (!gamePk || !uid) return
    try {
        players.value = playersWhoPlayed(await getBoxscore(gamePk))
    } catch {
        // Box score couldn't load: commenting still works, just without a rating
    }
}, { immediate: true })

const ratedPlayerId = ref(0)
const stars = ref(0)
const ratedPlayer = computed(() => [...players.value.away, ...players.value.home].find((p) => p.id === ratedPlayerId.value) ?? null)

function clearRating() {
    ratedPlayerId.value = 0
    stars.value = 0
}

// ---------- Writing ----------

const text = ref('')

// Can post with text, a rating, or both. A picked player needs stars first.
const canPost = computed(() => {
    if (ratedPlayer.value && !stars.value) return false
    return cleanForPosting(text.value).length > 0 || !!ratedPlayer.value
})

// Clean the text on every key press, so what you see is what will be posted
function onInput(event) {
    const cleaned = cleanWhileTyping(event.target.value)
    text.value = cleaned
    // Put the cleaned text back in the box when something was taken out
    if (event.target.value !== cleaned) event.target.value = cleaned
}

async function submit() {
    if (!canPost.value) return
    const rating = ratedPlayer.value ? { player: ratedPlayer.value, stars: stars.value } : null
    if (await post(text.value, rating)) {
        text.value = ''
        clearRating()
    }
}

// ---------- Deleting ----------

const confirmingDelete = ref('')

async function deleteComment(id) {
    confirmingDelete.value = ''
    await remove(id)
}
</script>
