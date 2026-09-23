<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Atbat from '@/components/icons/atbat.svg?component'

</script>

<template>
  <header>
    <div class="bg-primary">
      <nav class="px-20 py-5   flex items-center gap-5 text-text-nav text-xl">
        <Atbat class="w-20 h-20" />
        <div class="flex-1 flex justify-center gap-5">
          <RouterLink to="/" class="hover:text-secondary">Home</RouterLink>
          <RouterLink to="/about" class="hover:text-secondary">About</RouterLink>
        </div>
      </nav>
    </div>
    <div class="wrapper">

      <nav>
      </nav>
    </div>
  </header>
  <div class="bg-linear-135 from-primary to-primary-gradient min-h-screen">
    <RouterView />
  </div>
</template>

<style scoped>

</style>
