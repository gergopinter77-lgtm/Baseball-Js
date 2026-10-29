import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getStandings } from '@/api/mlb'
import { CURRENT_SEASON } from './player'

// Division tables, and the open tab (?tab=postseason)
export function useStandings() {
    const route = useRoute()
    const router = useRouter()

    const divisions = ref([])
    const tab = computed(() => (route.query.tab === 'postseason' ? 'postseason' : 'regular'))

    function setTab(name) {
        router.replace({ query: name === 'regular' ? {} : { tab: name } })
    }

    onMounted(async () => {
        divisions.value = (await getStandings(CURRENT_SEASON)).records
    })

    return { divisions, tab, setTab }
}
