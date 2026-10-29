import { ref, computed, watch } from 'vue'
import { getBoxscore } from '@/api/mlb'
import { useAuth } from './useAuth'
import { playersWhoPlayed } from './match'
import { cleanWhileTyping, cleanForPosting } from './sanitize'

// The comment form: text plus an optional star rating of one player
export function useCommentForm(getGamePk, post) {
    const { user } = useAuth()

    // Everyone who got into the game, to pick from for the rating
    const players = ref({ away: [], home: [] })
    watch([getGamePk, () => user.value?.uid], async ([gamePk, uid]) => {
        players.value = { away: [], home: [] }
        if (!gamePk || !uid) return
        try {
            players.value = playersWhoPlayed(await getBoxscore(gamePk))
        } catch {
            // No box score: commenting still works, just without a rating
        }
    }, { immediate: true })

    const ratedPlayerId = ref(0)
    const stars = ref(0)
    const ratedPlayer = computed(() =>
        [...players.value.away, ...players.value.home].find((p) => p.id === ratedPlayerId.value) ?? null)

    function clearRating() {
        ratedPlayerId.value = 0
        stars.value = 0
    }

    const text = ref('')

    // Text, a rating, or both; a picked player needs stars first
    const canPost = computed(() => {
        if (ratedPlayer.value && !stars.value) return false
        return cleanForPosting(text.value).length > 0 || !!ratedPlayer.value
    })

    // Cleans on every key press, so what you see is what gets posted
    function onInput(event) {
        const cleaned = cleanWhileTyping(event.target.value)
        text.value = cleaned
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

    return { players, ratedPlayerId, stars, ratedPlayer, clearRating, text, canPost, onInput, submit }
}
