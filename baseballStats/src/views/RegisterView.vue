<template>
  <div>
    <h1>Register</h1>

    <form @submit.prevent="register">
      <input type="email" placeholder="email" v-model="email">
      <input type="password" placeholder="password" v-model="password">
      <input type="submit" value="register">
      <p v-if="error">{{ error }}</p>
      <p>Have an account?
        <router-link to="/login">Login here</router-link>
      </p>
    </form>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function register() {
  error.value = ''
  try {
    const result = await createUserWithEmailAndPassword(auth, email.value, password.value)
    alert(`Welcome, ${result.user.email}!`)
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style lang="scss" scoped>

</style>