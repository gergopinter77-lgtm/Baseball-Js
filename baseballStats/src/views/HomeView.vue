<script setup>
  import searchPart from '../components/searchPart.vue'
  import MainOptions from '../components/MainOptions.vue'
</script>

<template>
  <main class="page flex flex-col items-center pt-16 md:pt-24">
    <h1 class="text-5xl md:text-6xl font-bold text-center">Every player. Every stat.</h1>
    <p class="text-primary-light text-lg mt-3 mb-10 text-center">Search MLB players, compare them and follow the standings.</p>
    <searchPart />
    <MainOptions />
  </main>
</template>
