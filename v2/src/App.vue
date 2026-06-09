<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/app.js'
import Navigation from '@/components/Navigation.vue'

const store = useAppStore()
const isDark = computed(() => store.darkMode)
</script>

<template>
  <div :class="{ dark: isDark }" class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
    <Navigation />
    <main class="pb-20 md:pb-0">
      <RouterView />
    </main>
  </div>
</template>
