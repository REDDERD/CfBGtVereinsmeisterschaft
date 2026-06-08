<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Archiv</h1>
    <p v-if="route.params.year" class="text-gray-500 dark:text-gray-400 mt-1">Saison {{ route.params.year }}</p>
  </div>
</template>
