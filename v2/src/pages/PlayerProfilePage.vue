<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Spieler-Profil</h1>
    <p class="text-gray-500 dark:text-gray-400 mt-1">ID: {{ route.params.id }}</p>
  </div>
</template>
