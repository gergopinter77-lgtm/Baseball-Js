<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuth, friendlyError } from '@/components/composables/useAuth'
import { useFavourites } from '@/components/composables/useFavorites'
import { getPlayers, playerPhotoUrl } from '@/api/mlb'

const router = useRouter()
const { user, profile, logout, updateMyProfile, changePassword } = useAuth()
const { favourites, toggleFavourite } = useFavourites()

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

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>

<template>
  <main class="mx-4 md:mx-20 py-12 grid grid-cols-12 gap-8 text-white items-start">
    <!-- Profile card -->
    <form class="col-span-12 lg:col-span-4 bg-primary rounded-2xl p-8" @submit.prevent="saveProfile">
      <div class="flex flex-col items-center text-center">
        <button type="button" class="relative group rounded-full hover:cursor-pointer" @click="fileInput.click()">
          <UserAvatar :photo="photo" :name="name || user.email" class="w-36 h-36 text-6xl" />
          <span class="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-semibold">
            Change picture
          </span>
        </button>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="pickPhoto">
        <button v-if="photo" type="button" class="text-sm text-primary-light hover:text-secondary mt-3 hover:cursor-pointer" @click="photo = ''">
          Remove picture
        </button>
        <p class="text-primary-light mt-3">{{ user.email }}</p>
      </div>

      <label class="block text-primary-light mt-8 mb-2" for="name">Username</label>
      <input
        id="name"
        v-model="name"
        type="text"
        required
        class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 focus:outline-none focus:border-secondary"
      >

      <label class="block text-primary-light mt-5 mb-2" for="bio">Bio</label>
      <textarea
        id="bio"
        v-model="bio"
        rows="4"
        :maxlength="BIO_MAX"
        placeholder="Tell people about yourself and your team..."
        class="w-full rounded-lg bg-primary-gradient border border-white/10 px-4 py-3 resize-none placeholder:text-white/30 focus:outline-none focus:border-secondary"
      ></textarea>
      <p class="text-right text-sm text-primary-light">{{ bio.length }}/{{ BIO_MAX }}</p>

      <p v-if="profileError" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 mt-4">{{ profileError }}</p>
      <p v-if="profileMessage" class="bg-green-500/15 border border-green-500/40 text-green-300 rounded-lg px-4 py-3 mt-4">{{ profileMessage }}</p>

      <button
        type="submit"
        :disabled="savingProfile"
        class="w-full h-12 rounded-lg bg-secondary-dark hover:bg-secondary font-semibold mt-5 disabled:opacity-60 hover:cursor-pointer"
      >
        {{ savingProfile ? 'Saving...' : 'Save profile' }}
      </button>
      <button
        type="button"
        class="w-full h-12 rounded-lg bg-white/10 hover:bg-white/20 mt-3 hover:cursor-pointer"
        @click="handleLogout"
      >
        Log out
      </button>
    </form>

    <div class="col-span-12 lg:col-span-8 flex flex-col gap-8">
      <!-- Favourites -->
      <section class="bg-primary rounded-2xl p-8">
        <h2 class="text-3xl font-bold mb-6">Favourite players</h2>
        <p v-if="loadingFavourites && !favouritePlayers.length" class="text-primary-light">Loading favourites...</p>
        <p v-else-if="!favouritePlayers.length" class="text-primary-light">
          No favourites yet. Open a player and press the ★ to add them here.
        </p>
        <div v-else class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          <div v-for="p in favouritePlayers" :key="p.id" class="relative bg-primary-gradient rounded-xl overflow-hidden hover:ring-2 hover:ring-secondary">
            <RouterLink :to="{ name: 'player', params: { id: p.id } }" class="block">
              <img :src="playerPhotoUrl(p.id)" :alt="p.fullName" class="w-full aspect-square object-cover object-top bg-white/10">
              <div class="p-3">
                <p class="font-semibold truncate">{{ p.fullName }}</p>
                <p class="text-sm text-primary-light truncate">
                  {{ p.primaryPosition?.abbreviation }}<template v-if="p.currentTeam"> · {{ p.currentTeam.name }}</template>
                </p>
              </div>
            </RouterLink>
            <button
              class="absolute top-2 right-2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-yellow-300 text-xl hover:cursor-pointer"
              title="Remove from favourites"
              @click="toggleFavourite(p.id)"
            >
              ★
            </button>
          </div>
        </div>
      </section>

      <!-- Password -->
      <form class="bg-primary rounded-2xl p-8" @submit.prevent="savePassword">
        <h2 class="text-3xl font-bold mb-6">Change password</h2>
        <div class="grid grid-cols-12 gap-5">
          <div class="col-span-12 md:col-span-4">
            <label class="block text-primary-light mb-2" for="current-password">Current password</label>
            <input
              id="current-password"
              v-model="currentPassword"
              type="password"
              required
              autocomplete="current-password"
              class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 focus:outline-none focus:border-secondary"
            >
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="block text-primary-light mb-2" for="new-password">New password</label>
            <input
              id="new-password"
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 focus:outline-none focus:border-secondary"
            >
          </div>
          <div class="col-span-12 md:col-span-4">
            <label class="block text-primary-light mb-2" for="confirm-password">Repeat new password</label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              required
              minlength="6"
              autocomplete="new-password"
              class="w-full h-12 rounded-lg bg-primary-gradient border border-white/10 px-4 focus:outline-none focus:border-secondary"
            >
          </div>
        </div>

        <p v-if="passwordError" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 mt-5">{{ passwordError }}</p>
        <p v-if="passwordMessage" class="bg-green-500/15 border border-green-500/40 text-green-300 rounded-lg px-4 py-3 mt-5">{{ passwordMessage }}</p>

        <button
          type="submit"
          :disabled="savingPassword"
          class="px-6 h-12 rounded-lg bg-secondary-dark hover:bg-secondary font-semibold mt-5 disabled:opacity-60 hover:cursor-pointer"
        >
          {{ savingPassword ? 'Changing...' : 'Change password' }}
        </button>
      </form>
    </div>
  </main>
</template>
