<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuth, friendlyError } from '@/components/composables/useAuth'
import { useFavourites, useFavouriteTeams } from '@/components/composables/useFavorites'
import { getPlayers, playerPhotoUrl, getTeams, teamLogoUrl } from '@/api/mlb'

const router = useRouter()
const { user, profile, logout, updateMyProfile, changePassword } = useAuth()
const { favourites, toggleFavourite } = useFavourites()
const { favouriteTeams, toggleFavouriteTeam } = useFavouriteTeams()

const PHOTO_SIZE = 160
const BIO_MAX = 200

// ---------- Profile (picture, name, bio) ----------

const name = ref(profile.value?.displayName ?? '')
const bio = ref(profile.value?.bio ?? '')
const photo = ref(profile.value?.photoURL ?? '')
const fileInput = ref(null)
const savingProfile = ref(false)
const profileMessage = ref('')
const profileError = ref('')

// Turns the chosen image into a small square JPEG so it fits in the database
function shrinkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = PHOTO_SIZE
      canvas.getContext('2d').drawImage(
        img,
        (img.width - side) / 2, (img.height - side) / 2, side, side,
        0, 0, PHOTO_SIZE, PHOTO_SIZE,
      )
      URL.revokeObjectURL(img.src)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => reject(new Error('That file is not an image.'))
    img.src = URL.createObjectURL(file)
  })
}

async function pickPhoto(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  profileError.value = ''
  try {
    photo.value = await shrinkImage(file)
  } catch (err) {
    profileError.value = err.message
  }
}

async function saveProfile() {
  savingProfile.value = true
  profileMessage.value = ''
  profileError.value = ''
  try {
    await updateMyProfile({ displayName: name.value.trim(), bio: bio.value.trim(), photoURL: photo.value })
    profileMessage.value = 'Profile saved.'
  } catch (err) {
    profileError.value = friendlyError(err)
  } finally {
    savingProfile.value = false
  }
}

// ---------- Password ----------

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const savingPassword = ref(false)
const passwordMessage = ref('')
const passwordError = ref('')

async function savePassword() {
  passwordMessage.value = ''
  passwordError.value = ''
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'The new passwords do not match.'
    return
  }
  savingPassword.value = true
  try {
    await changePassword(currentPassword.value, newPassword.value)
    currentPassword.value = newPassword.value = confirmPassword.value = ''
    passwordMessage.value = 'Password changed.'
  } catch (err) {
    passwordError.value = err.code === 'auth/invalid-credential' ? 'Current password is wrong.' : friendlyError(err)
  } finally {
    savingPassword.value = false
  }
}

// ---------- Favourites ----------

const favouritePlayers = ref([])
const loadingFavourites = ref(false)

watch(favourites, async (ids) => {
  // Removing a favourite just drops it from the list, no need to ask the API again
  const known = favouritePlayers.value.filter((p) => ids.includes(p.id))
  if (known.length === ids.length) {
    favouritePlayers.value = known
    return
  }
  loadingFavourites.value = true
  try {
    const data = await getPlayers(ids)
    favouritePlayers.value = data.people ?? []
  } catch {
    favouritePlayers.value = []
  } finally {
    loadingFavourites.value = false
  }
}, { immediate: true })

// Only 30 teams, so load them all once and pick the favourites
const allTeams = ref([])
const favouriteTeamList = computed(() => allTeams.value.filter((t) => favouriteTeams.value.includes(t.id)))

onMounted(async () => {
  try {
    allTeams.value = (await getTeams()).teams ?? []
  } catch {
    allTeams.value = []
  }
})

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <main class="page grid grid-cols-12 gap-6 items-start">
    <!-- Profile card -->
    <form class="col-span-12 lg:col-span-4 card p-6" @submit.prevent="saveProfile">
      <div class="flex flex-col items-center text-center">
        <button type="button" class="relative group rounded-full hover:cursor-pointer" @click="fileInput.click()">
          <UserAvatar :photo="photo" :name="name || user.email" class="w-28 h-28 text-5xl" />
          <span class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-semibold">
            Change picture
          </span>
        </button>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="pickPhoto">
        <button v-if="photo" type="button" class="text-sm text-primary-light hover:text-secondary mt-3 hover:cursor-pointer" @click="photo = ''">
          Remove picture
        </button>
        <p class="text-sm text-primary-light mt-2">{{ user.email }}</p>
      </div>

      <label class="label mt-8" for="name">Username</label>
      <input
        id="name"
        v-model="name"
        type="text"
        required
        class="input"
      >

      <label class="label mt-5" for="bio">Bio</label>
      <textarea
        id="bio"
        v-model="bio"
        rows="4"
        :maxlength="BIO_MAX"
        placeholder="Tell people about yourself and your team..."
        class="input h-auto! py-3 resize-none"
      ></textarea>
      <p class="text-right text-xs text-primary-light mt-1">{{ bio.length }}/{{ BIO_MAX }}</p>

      <p v-if="profileError" class="alert-error mt-4">{{ profileError }}</p>
      <p v-if="profileMessage" class="alert-success mt-4">{{ profileMessage }}</p>

      <button
        type="submit"
        :disabled="savingProfile"
        class="btn-primary w-full mt-5"
      >
        {{ savingProfile ? 'Saving...' : 'Save profile' }}
      </button>
      <button
        type="button"
        class="btn-ghost w-full mt-3"
        @click="handleLogout"
      >
        Log out
      </button>
    </form>

    <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
      <!-- Favourites -->
      <section class="card p-6">
        <h2 class="text-2xl font-semibold mb-4">Favourite players</h2>
        <p v-if="loadingFavourites && !favouritePlayers.length" class="text-sm text-primary-light">Loading favourites...</p>
        <p v-else-if="!favouritePlayers.length" class="text-sm text-primary-light">
          No favourites yet. Open a player and press the ★ to add them here.
        </p>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          <div v-for="p in favouritePlayers" :key="p.id" class="relative bg-primary-raised/60 rounded-lg overflow-hidden ring-1 ring-white/5 hover:ring-secondary transition-shadow">
            <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="block">
              <img :src="playerPhotoUrl(p.id, 300)" :alt="p.fullName" class="w-full aspect-[4/5] object-cover bg-white/10">
              <div class="p-3">
                <p class="text-sm font-semibold truncate">{{ p.fullName }}</p>
                <p class="text-xs text-primary-light truncate">
                  {{ p.primaryPosition?.abbreviation }}<template v-if="p.currentTeam"> · {{ p.currentTeam.name }}</template>
                </p>
              </div>
            </RouterLink>
            <button
              class="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-yellow-300 hover:cursor-pointer"
              title="Remove from favourites"
              @click="toggleFavourite(p.id)"
            >
              ★
            </button>
          </div>
        </div>
      </section>

      <!-- Favourite teams -->
      <section class="card p-6">
        <h2 class="text-2xl font-semibold mb-4">Favourite teams</h2>
        <p v-if="!favouriteTeamList.length" class="text-sm text-primary-light">
          No favourite teams yet. Open a team and press the ★ to add it here.
        </p>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          <div
            v-for="t in favouriteTeamList"
            :key="t.id"
            class="flex items-center gap-3 bg-primary-raised/60 rounded-lg p-3 ring-1 ring-white/5 hover:ring-secondary transition-shadow"
          >
            <RouterLink :to="{ name: 'team', params: { id: t.id } }" class="flex-1 flex items-center gap-3 min-w-0">
              <img :src="teamLogoUrl(t.id)" alt="" class="w-10 h-10 shrink-0">
              <div class="min-w-0">
                <p class="text-sm font-semibold truncate">{{ t.name }}</p>
                <p class="text-xs text-primary-light truncate">{{ t.division?.name }}</p>
              </div>
            </RouterLink>
            <button
              class="w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-yellow-300 shrink-0 hover:cursor-pointer"
              title="Remove from favourites"
              @click="toggleFavouriteTeam(t.id)"
            >
              ★
            </button>
          </div>
        </div>
      </section>

      <!-- Password -->
      <form class="card p-6" @submit.prevent="savePassword">
        <h2 class="text-2xl font-semibold mb-4">Change password</h2>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 md:col-span-4">
            <label class="label" for="current-password">Current password</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="input"
            >
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="label" for="new-password">New password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="input"
            >
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="label" for="confirm-password">Repeat new password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="input"
            >
          </div>
        </div>

        <p v-if="passwordError" class="alert-error mt-5">{{ passwordError }}</p>
        <p v-if="passwordMessage" class="alert-success mt-5">{{ passwordMessage }}</p>

        <button
          type="submit"
          :disabled="savingPassword"
          class="btn-primary mt-5"
        >
          {{ savingPassword ? 'Changing...' : 'Change password' }}
        </button>
      </form>
    </div>
  </main>
</template>
