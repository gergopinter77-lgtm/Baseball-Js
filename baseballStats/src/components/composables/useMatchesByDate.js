import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSchedule } from '@/api/mlb'
import { scheduleToMatches, toDateString } from './match'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// The matches page: games of one day. The day is in the URL (?date=2026-10-26).
export function useMatchesByDate() {
    const route = useRoute()
    const router = useRouter()

    const today = toDateString(new Date())
    const date = computed(() => (DATE_PATTERN.test(route.query.date) ? route.query.date : today))
    const longDate = computed(() => {
        const [y, m, d] = date.value.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    })

    const matches = ref([])
    const loading = ref(false)
    const error = ref('')

    function setDate(value) {
        if (value) router.push({ query: { date: value } })
    }

    async function load(day) {
        loading.value = true
        error.value = ''
        try {
            matches.value = scheduleToMatches(await getSchedule(day))
        } catch (e) {
            error.value = `Could not load matches (${e.message})`
        } finally {
            loading.value = false
        }
    }

    watch(date, load, { immediate: true })

    return { today, date, longDate, matches, loading, error, setDate }
}
