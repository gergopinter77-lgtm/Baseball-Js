<template>
  <main class="flex justify-center px-4 py-12 md:py-20">
    <form @submit.prevent="submit" class="w-full max-w-md card p-8 shadow-2xl">
      <h1 class="text-4xl font-bold mb-1">Create account</h1>
      <p class="text-sm text-primary-light mb-6">It only takes a few seconds.</p>

      <label class="label" for="name">Name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        autocomplete="name"
        placeholder="Your name"
        class="input mb-5"
      >

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
        minlength="6"
        autocomplete="new-password"
        placeholder="At least 6 characters"
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
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>

      <p class="text-center text-sm text-primary-light mt-6">
        Have an account?
        <RouterLink to="/login" class="text-secondary font-medium hover:underline">Log in here</RouterLink>
      </p>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth, friendlyError } from '@/components/composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await register(email.value, password.value, name.value.trim())
    router.push('/')
  } catch (err) {
    error.value = friendlyError(err)
  } finally {
    loading.value = false
  }
}
</script>
