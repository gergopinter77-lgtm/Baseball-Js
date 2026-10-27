<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { savePublicProfile, deletePublicProfile } from '@/components/composables/publicProfiles'
import { db } from '@/firebase'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuth, friendlyError } from '@/components/composables/useAuth'

const { user } = useAuth()

const accounts = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')

// The account open in the edit window, and the one waiting for a delete confirm
const editing = ref(null)
const deleting = ref(null)
const saving = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return accounts.value
  return accounts.value.filter((a) =>
    (a.displayName ?? '').toLowerCase().includes(q) || (a.email ?? '').toLowerCase().includes(q),
  )
})

const adminCount = computed(() => accounts.value.filter((a) => a.role === 'admin').length)

onMounted(loadAccounts)

async function loadAccounts() {
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

function isMe(account) {
  return account.id === user.value?.uid
}

function formatDate(ts) {
  return ts?.toDate ? ts.toDate().toLocaleDateString() : '—'
}

function openEdit(account) {
  error.value = ''
  editing.value = { ...account }
}

async function saveEdit() {
  saving.value = true
  error.value = ''
  try {
    const { id, displayName, role } = editing.value
    await updateDoc(doc(db, 'users', id), { displayName: displayName.trim(), role })
    const target = accounts.value.find((a) => a.id === id)
    Object.assign(target, { displayName: displayName.trim(), role })
    // The new name shows up in friend search too (if that fails, the next admin visit fixes it)
    savePublicProfile(id, target).catch(() => {})
    editing.value = null
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  saving.value = true
  error.value = ''
  try {
    await deleteDoc(doc(db, 'users', deleting.value.id))
    // Take them out of friend search as well (if that fails, the next admin visit cleans it up)
    deletePublicProfile(deleting.value.id).catch(() => {})
    accounts.value = accounts.value.filter((a) => a.id !== deleting.value.id)
    deleting.value = null
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <main class="page">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <h1 class="text-4xl font-bold">Admin panel</h1>
        <p class="text-sm text-primary-light mt-1">Manage every account in AtBat.</p>
      </div>
      <input
        v-model="search"
        type="text"
        placeholder="Search name or email..."
        class="input md:w-80! bg-primary!"
      >
    </div>

    <div class="grid grid-cols-12 gap-4 mb-6">
      <div class="col-span-6 md:col-span-3 card p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-primary-light">Accounts</p>
        <p class="font-display text-4xl font-semibold mt-1">{{ accounts.length }}</p>
      </div>
      <div class="col-span-6 md:col-span-3 card p-5">
        <p class="text-xs font-semibold uppercase tracking-wider text-primary-light">Admins</p>
        <p class="font-display text-4xl font-semibold mt-1">{{ adminCount }}</p>
      </div>
    </div>

    <p v-if="error && !editing && !deleting" class="alert-error mb-6">
      {{ error }}
    </p>

    <section class="card p-5 overflow-x-auto">
      <p v-if="loading" class="text-primary-light py-6 text-center">Loading accounts...</p>
      <p v-else-if="!filtered.length" class="text-primary-light py-6 text-center">No accounts found.</p>

      <table v-else class="w-full text-sm text-left whitespace-nowrap">
        <thead>
          <tr>
            <th class="th">Name</th>
            <th class="th">Email</th>
            <th class="th">Role</th>
            <th class="th">Joined</th>
            <th class="th"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.id" class="border-t border-white/5 hover:bg-white/3">
            <td class="td">
              <div class="flex items-center gap-3">
                <UserAvatar :photo="a.photoURL" :name="a.displayName || a.email" class="w-8 h-8 text-sm" />
                <span class="font-medium">{{ a.displayName || '—' }}</span>
                <span v-if="isMe(a)" class="text-xs text-primary-light">(you)</span>
              </div>
            </td>
            <td class="td text-primary-light">{{ a.email }}</td>
            <td class="td">
              <span
                class="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                :class="a.role === 'admin' ? 'bg-secondary-dark/20 text-secondary' : 'bg-white/10 text-white/80'"
              >
                {{ a.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td class="td text-primary-light">{{ formatDate(a.createdAt) }}</td>
            <td class="td text-right">
              <button class="btn-ghost h-9! px-3! text-sm mr-2" @click="openEdit(a)">
                Edit
              </button>
              <button
                class="btn-primary h-9! px-3! text-sm"
                :disabled="isMe(a)"
                :title="isMe(a) ? 'You cannot delete your own account' : ''"
                @click="error = ''; deleting = a"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Edit window -->
    <div v-if="editing" class="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-20" @click.self="editing = null">
      <form class="w-full max-w-md card p-6" @submit.prevent="saveEdit">
        <h2 class="text-2xl font-semibold mb-1">Edit account</h2>
        <p class="text-primary-light mb-6">{{ editing.email }}</p>

        <label class="label" for="edit-name">Name</label>
        <input
          id="edit-name"
          v-model="editing.displayName"
          type="text"
          required
          class="input mb-5"
        >

        <label class="label" for="edit-role">Role</label>
        <select
          id="edit-role"
          v-model="editing.role"
          :disabled="isMe(editing)"
          class="input mb-2"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <p v-if="isMe(editing)" class="text-sm text-primary-light mb-4">You cannot change your own role.</p>

        <p v-if="error" class="alert-error my-4">
          {{ error }}
        </p>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" class="btn-ghost" @click="editing = null">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleting" class="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-20" @click.self="deleting = null">
      <div class="w-full max-w-md card p-6">
        <h2 class="text-2xl font-semibold mb-2">Delete account?</h2>
        <p class="text-primary-light mb-6">
          <span class="text-white">{{ deleting.displayName || deleting.email }}</span>
          will be removed and won't be able to log in anymore.
        </p>

        <p v-if="error" class="alert-error mb-6">
          {{ error }}
        </p>

        <div class="flex justify-end gap-3">
          <button class="btn-ghost" @click="deleting = null">
            Cancel
          </button>
          <button :disabled="saving" class="btn-primary" @click="confirmDelete">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
