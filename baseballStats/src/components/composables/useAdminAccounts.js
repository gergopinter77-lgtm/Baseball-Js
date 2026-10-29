import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth, friendlyError } from './useAuth'
import { savePublicProfile, deletePublicProfile } from './publicProfiles'

// The admin panel: every account, with search, edit and delete
export function useAdminAccounts() {
    const { user } = useAuth()

    const accounts = ref([])
    const loading = ref(true)
    const error = ref('')
    const search = ref('')
    const editing = ref(null) // account open in the edit window
    const deleting = ref(null) // account waiting for a delete confirm
    const saving = ref(false)

    const filtered = computed(() => {
        const q = search.value.trim().toLowerCase()
        if (!q) return accounts.value
        return accounts.value.filter((a) =>
            (a.displayName ?? '').toLowerCase().includes(q) || (a.email ?? '').toLowerCase().includes(q))
    })

    const adminCount = computed(() => accounts.value.filter((a) => a.role === 'admin').length)

    const isMe = (account) => account.id === user.value?.uid

    async function load() {
        loading.value = true
        error.value = ''
        try {
            const snap = await getDocs(collection(db, 'users'))
            accounts.value = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        } catch (err) {
            error.value = friendlyError(err)
        } finally {
            loading.value = false
        }
    }

    function openEdit(account) {
        error.value = ''
        editing.value = { ...account }
    }

    // Runs a change with the saving flag and error message handled
    async function withSaving(change) {
        saving.value = true
        error.value = ''
        try {
            await change()
        } catch (err) {
            error.value = friendlyError(err)
        } finally {
            saving.value = false
        }
    }

    const saveEdit = () => withSaving(async () => {
        const { id, role } = editing.value
        const displayName = editing.value.displayName.trim()
        await updateDoc(doc(db, 'users', id), { displayName, role })
        const target = accounts.value.find((a) => a.id === id)
        Object.assign(target, { displayName, role })
        // If this fails, the next admin visit fixes it
        savePublicProfile(id, target).catch(() => {})
        editing.value = null
    })

    const confirmDelete = () => withSaving(async () => {
        const { id } = deleting.value
        await deleteDoc(doc(db, 'users', id))
        deletePublicProfile(id).catch(() => {})
        accounts.value = accounts.value.filter((a) => a.id !== id)
        deleting.value = null
    })

    onMounted(load)

    return { accounts, filtered, adminCount, loading, error, search, editing, deleting, saving, isMe, openEdit, saveEdit, confirmDelete }
}

// Firestore timestamp -> "26/10/2026"
export function formatAccountDate(ts) {
    return ts?.toDate ? ts.toDate().toLocaleDateString() : '—'
}
