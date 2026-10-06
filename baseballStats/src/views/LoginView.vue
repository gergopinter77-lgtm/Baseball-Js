<template>
  <div>
    <h1>Login</h1>

    <div class="flex">
        <form @submit.prevent="login">
        <input type="email" placeholder="email" v-model="email">
        <input type="password" placeholder="password" v-model="password">
        <input type="submit" value="login">
        <p v-if="error">{{ error }}</p>
        <p>Need an account?
            <router-link to="/register">Register here</router-link>
        </p>
        </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style lang="scss" scoped>

</style>