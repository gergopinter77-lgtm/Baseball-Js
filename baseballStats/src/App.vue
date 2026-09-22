<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <div class="flex justify-center bg-primary ">
      <div class="text-white text-xl my-5">
        <RouterLink to="/" class="mr-2.5  hover:text-secondary">Home</RouterLink>
        <RouterLink to="/about" class="ml-2.5 hover:text-secondary">About</RouterLink>
      </div>
    </div>
    <div class="wrapper">

      <nav>
      </nav>
    </div>
  </header>
  <div class="bg-white min-h-screen">
    <RouterView />
  </div>
</template>

<style scoped>

</style>
