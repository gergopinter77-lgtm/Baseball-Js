<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
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
  <main class="mx-4 md:mx-20 py-12 text-white">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 class="text-4xl font-bold">Admin panel</h1>
        <p class="text-primary-light mt-1">Manage every account in AtBat.</p>
      </div>
      <input
        v-model="search"
        type="text"
        placeholder="Search name or email..."
        class="w-full md:w-80 h-12 rounded-lg bg-primary border border-white/10 px-4 placeholder:text-white/40 focus:outline-none focus:border-secondary"
      >
    </div>

    <div class="grid grid-cols-12 gap-6 mb-8">
      <div class="col-span-6 md:col-span-3 bg-primary rounded-2xl p-6">
        <p class="text-primary-light">Accounts</p>
        <p class="text-4xl font-bold mt-1">{{ accounts.length }}</p>
      </div>
      <div class="col-span-6 md:col-span-3 bg-primary rounded-2xl p-6">
        <p class="text-primary-light">Admins</p>
        <p class="text-4xl font-bold mt-1">{{ adminCount }}</p>
      </div>
    </div>

    <p v-if="error && !editing && !deleting" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 mb-6">
      {{ error }}
    </p>

    <section class="bg-primary rounded-2xl p-6 md:p-8 overflow-x-auto">
      <p v-if="loading" class="text-primary-light py-6 text-center">Loading accounts...</p>
      <p v-else-if="!filtered.length" class="text-primary-light py-6 text-center">No accounts found.</p>

      <table v-else class="w-full text-lg">
        <thead>
          <tr class="text-primary-light text-left">
            <th class="pb-3 font-normal">Name</th>
            <th class="pb-3 font-normal">Email</th>
            <th class="pb-3 font-normal">Role</th>
            <th class="pb-3 font-normal">Joined</th>
            <th class="pb-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.id" class="border-t border-white/10">
            <td class="py-4 pr-4">
              <div class="flex items-center gap-3">
                <UserAvatar :photo="a.photoURL" :name="a.displayName || a.email" class="w-10 h-10" />
                <span>{{ a.displayName || '—' }}</span>
                <span v-if="isMe(a)" class="text-xs text-primary-light">(you)</span>
              </div>
            </td>
            <td class="py-4 pr-4 text-primary-light">{{ a.email }}</td>
            <td class="py-4 pr-4">
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="a.role === 'admin' ? 'bg-secondary-dark/20 text-secondary' : 'bg-white/10 text-white/80'"
              >
                {{ a.role === 'admin' ? 'Admin' : 'User' }}
              </span>
            </td>
            <td class="py-4 pr-4 text-primary-light">{{ formatDate(a.createdAt) }}</td>
            <td class="py-4 text-right whitespace-nowrap">
              <button class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 mr-2 hover:cursor-pointer" @click="openEdit(a)">
                Edit
              </button>
              <button
                class="px-4 py-2 rounded-lg bg-secondary-dark hover:bg-secondary hover:cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
      <form class="w-full max-w-md bg-primary rounded-2xl p-8" @submit.prevent="saveEdit">
        <h2 class="text-2xl font-bold mb-1">Edit account</h2>
        <p class="text-primary-light mb-6">{{ editing.email }}</p>

        <label class="block text-primary-light mb-2" for="edit-name">Name</label>
        <input
          id="edit-name"
          v-model="editing.displayName"
          type="text"
          required
          class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 mb-5 focus:outline-none focus:border-secondary"
        >

        <label class="block text-primary-light mb-2" for="edit-role">Role</label>
        <select
          id="edit-role"
          v-model="editing.role"
          :disabled="isMe(editing)"
          class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 mb-2 focus:outline-none focus:border-secondary disabled:opacity-50"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <p v-if="isMe(editing)" class="text-sm text-primary-light mb-4">You cannot change your own role.</p>

        <p v-if="error" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 my-4">
          {{ error }}
        </p>

        <div class="flex justify-end gap-3 mt-6">
          <button type="button" class="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 hover:cursor-pointer" @click="editing = null">
            Cancel
          </button>
          <button type="submit" :disabled="saving" class="px-5 py-3 rounded-lg bg-secondary-dark hover:bg-secondary font-semibold disabled:opacity-60 hover:cursor-pointer">
            {{ saving ? 'Saving...' : 'Save changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Delete confirm -->
    <div v-if="deleting" class="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-20" @click.self="deleting = null">
      <div class="w-full max-w-md bg-primary rounded-2xl p-8">
        <h2 class="text-2xl font-bold mb-3">Delete account?</h2>
        <p class="text-primary-light mb-6">
          <span class="text-white">{{ deleting.displayName || deleting.email }}</span>
          will be removed and won't be able to log in anymore.
        </p>

        <p v-if="error" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 mb-6">
          {{ error }}
        </p>

        <div class="flex justify-end gap-3">
          <button class="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 hover:cursor-pointer" @click="deleting = null">
            Cancel
          </button>
          <button :disabled="saving" class="px-5 py-3 rounded-lg bg-secondary-dark hover:bg-secondary font-semibold disabled:opacity-60 hover:cursor-pointer" @click="confirmDelete">
            {{ saving ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
