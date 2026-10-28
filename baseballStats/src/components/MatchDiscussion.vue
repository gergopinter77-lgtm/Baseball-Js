<template>
    <section class="bg-primary-raised/40 rounded-xl p-5 md:p-6">
        <div class="flex flex-wrap items-baseline justify-between gap-2 mb-4">
            <h2 class="text-2xl font-semibold">Discussion</h2>
            <p class="text-sm text-primary-light">{{ comments.length }} {{ comments.length === 1 ? 'comment' : 'comments' }}</p>
        </div>

        <!-- Write a comment -->
        <form v-if="user" class="flex gap-3" @submit.prevent="post">
            <UserAvatar :photo="profile?.photoURL" :name="profile?.displayName" class="w-9 h-9 text-sm hidden sm:flex" />
            <div class="flex-1 min-w-0">
                <label for="comment" class="sr-only">Your comment</label>
                <textarea
                    id="comment"
                    :value="text"
                    rows="3"
                    :maxlength="COMMENT_MAX"
                    :placeholder="`What do you think about ${match.away.team.teamName} vs ${match.home.team.teamName}?`"
                    class="input h-auto! py-3 resize-y min-h-24"
                    spellcheck="true"
                    autocomplete="off"
                    @input="onInput"
                />
                <div class="flex flex-wrap items-center justify-between gap-2 mt-2">
                    <p class="text-xs text-primary-light">
                        Plain text only.
                        <span :class="text.length >= COMMENT_MAX && 'text-secondary'">{{ text.length }}/{{ COMMENT_MAX }}</span>
                    </p>
                    <button type="submit" class="btn-primary h-9! px-4! text-sm" :disabled="!canPost">Post</button>
                </div>
            </div>
        </form>

        <!-- Logged out: comments can be read, writing needs an account -->
        <p v-else class="text-sm text-center py-3">
            <RouterLink :to="{ name: 'login', query: { redirect: route.fullPath } }" class="text-secondary font-medium hover:underline">Log in</RouterLink>
            <span class="text-primary-light"> to join the discussion.</span>
        </p>

        <!-- Comments, newest first. User text is shown with {{ }} only, never v-html. -->
        <p v-if="!comments.length" class="py-8 text-center text-primary-light border-t border-white/5 mt-5">
            No comments yet. Start the discussion!
        </p>
        <ul v-else class="mt-5">
            <li v-for="c in comments" :key="c.id" class="flex gap-3 py-3 border-t border-white/5">
                <UserAvatar :photo="c.photoURL" :name="c.displayName" class="w-9 h-9 text-sm" />
                <div class="flex-1 min-w-0">
                    <p class="text-sm">
                        <span class="font-semibold">{{ c.displayName }}</span>
                        <span class="text-xs text-primary-light ml-2">{{ c.time }}</span>
                    </p>
                    <p class="mt-1 text-sm whitespace-pre-line break-words">{{ c.text }}</p>
                </div>
            </li>
        </ul>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import UserAvatar from './UserAvatar.vue'
import { useAuth } from './composables/useAuth'
import { COMMENT_MAX, cleanWhileTyping, cleanForPosting } from './composables/sanitize'

defineProps({
    match: { type: Object, required: true },
})

const route = useRoute()
const { user, profile } = useAuth()

// Loading and saving comments isn't built yet, so the list stays empty
const comments = ref([])

const text = ref('')
const canPost = computed(() => cleanForPosting(text.value).length > 0)

// Clean the text on every key press, so what you see is what would be posted
function onInput(event) {
    const cleaned = cleanWhileTyping(event.target.value)
    text.value = cleaned
    // Put the cleaned text back in the box when something was taken out
    if (event.target.value !== cleaned) event.target.value = cleaned
}

function post() {
    const message = cleanForPosting(text.value)
    if (!message) return
    // Saving the comment comes here once the discussion logic is built
}
</script>
