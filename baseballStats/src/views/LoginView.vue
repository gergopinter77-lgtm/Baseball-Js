<template>
  <main class="flex justify-center px-4 py-12 md:py-20">
    <form @submit.prevent="submit" class="w-full max-w-md card p-8 shadow-2xl">
      <h1 class="text-4xl font-bold mb-1">Welcome back</h1>
      <p class="text-sm text-primary-light mb-6">Log in to keep track of your favourite players.</p>

      <label class="label" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
        class="input mb-5"
      >

      <label class="label" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        autocomplete="current-password"
        placeholder="••••••••"
        class="input mb-6"
      >

      <p v-if="error" class="alert-error mb-6">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full"
      >
        {{ loading ? 'Logging in...' : 'Log in' }}
      </button>

      <p class="text-center text-sm text-primary-light mt-6">
        Need an account?
        <RouterLink to="/register" class="text-secondary font-medium hover:underline">Register here</RouterLink>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, friendlyError } from '@/components/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await login(email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    loading.value = false
  }
}
</script>
