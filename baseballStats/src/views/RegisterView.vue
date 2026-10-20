<template>
  <main class="flex justify-center px-4 py-20">
    <form @submit.prevent="submit" class="w-full max-w-md bg-primary rounded-2xl p-10 text-white shadow-xl">
      <h1 class="text-4xl font-bold mb-2">Create account</h1>
      <p class="text-primary-light mb-8">It only takes a few seconds.</p>

      <label class="block text-primary-light mb-2" for="name">Name</label>
      <input
        id="name"
        v-model="name"
        type="text"
        autocomplete="name"
        placeholder="Your name"
        class="w-full h-14 rounded-lg bg-primary-gradient border border-white/10 px-4 text-lg mb-5 placeholder:text-white/30 focus:outline-none focus:border-secondary"
      >

      <label class="block text-primary-light mb-2" for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="you@example.com"
        class="w-full h-14 rounded-lg bg-primary-gradient border border-white/10 px-4 text-lg mb-5 placeholder:text-white/30 focus:outline-none focus:border-secondary"
      >

      <label class="block text-primary-light mb-2" for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        minlength="6"
        autocomplete="new-password"
        placeholder="At least 6 characters"
        class="w-full h-14 rounded-lg bg-primary-gradient border border-white/10 px-4 text-lg mb-6 placeholder:text-white/30 focus:outline-none focus:border-secondary"
      >

      <p v-if="error" class="bg-secondary-dark/15 border border-secondary-dark/40 text-secondary rounded-lg px-4 py-3 mb-6">
        {{ error }}
      </p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full h-14 rounded-lg bg-secondary-dark hover:bg-secondary text-xl font-semibold transition-colors disabled:opacity-60 hover:cursor-pointer"
      >
        {{ loading ? 'Creating account...' : 'Register' }}
      </button>

      <p class="text-center text-primary-light mt-8">
        Have an account?
        <RouterLink to="/login" class="text-secondary hover:underline">Log in here</RouterLink>
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
