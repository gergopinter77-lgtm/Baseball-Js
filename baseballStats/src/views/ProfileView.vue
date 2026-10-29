<script setup>
import { ref } from 'vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useAuth } from '@/components/composables/useAuth'
import { useLogout } from '@/components/composables/useLoginGate'
import { useFavourites, useFavouriteTeams } from '@/components/composables/useFavorites'
import { useFavouriteDetails } from '@/components/composables/useFavouriteDetails'
import { useProfileForm, usePasswordForm, BIO_MAX } from '@/components/composables/useProfileForm'
import { playerPhotoUrl, teamLogoUrl } from '@/api/mlb'

const { user } = useAuth()
const { logoutAndLeave: handleLogout } = useLogout()
const { favourites, toggleFavourite } = useFavourites()
const { favouriteTeams, toggleFavouriteTeam } = useFavouriteTeams()

const fileInput = ref(null)

const {
  name, bio, photo, pickPhoto,
  saving: savingProfile, message: profileMessage, error: profileError, save: saveProfile,
} = useProfileForm()

const {
  current: currentPassword, next: newPassword, confirm: confirmPassword,
  saving: savingPassword, message: passwordMessage, error: passwordError, save: savePassword,
} = usePasswordForm()

const { players: favouritePlayers, teams: favouriteTeamList, loading: loadingFavourites } = useFavouriteDetails(
  () => favourites.value,
  () => favouriteTeams.value,
)
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
