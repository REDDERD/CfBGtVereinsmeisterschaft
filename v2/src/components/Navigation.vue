<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app.js'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const mobileMoreOpen = ref(false)

const isMorePage = computed(() =>
  ['/challenges', '/matches', '/players'].includes(route.path)
)

const hasArchiveSeasons = computed(() => store.hasArchiveSeasons)
const inArchive = computed(() => store.archiveMode)

function navigate(path) {
  mobileMoreOpen.value = false
  router.push(path)
}
</script>

<template>
  <!-- Desktop Navigation -->
  <nav class="bg-white dark:bg-gray-900 shadow-lg hidden md:block border-b border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center cursor-pointer">
          <img src="/assets/logo.gif" alt="CfB Gütersloh Logo" class="h-12" />
        </RouterLink>

        <div class="flex items-center space-x-1">
          <RouterLink to="/singles" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/singles' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Einzel
          </RouterLink>
          <RouterLink to="/doubles" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/doubles' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Doppel
          </RouterLink>
          <RouterLink v-if="!inArchive" to="/challenges" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/challenges' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Herausforderungen
          </RouterLink>
          <RouterLink to="/statistics" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/statistics' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Statistiken
          </RouterLink>
          <RouterLink to="/matches" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/matches' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Spiele
          </RouterLink>
          <RouterLink to="/players" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/players' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Spieler
          </RouterLink>
          <RouterLink v-if="!inArchive && hasArchiveSeasons" to="/archive" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
            :class="route.path === '/archive' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
            Archiv
          </RouterLink>
          <template v-if="!inArchive">
            <template v-if="store.user">
              <RouterLink v-if="store.isAdmin" to="/admin" class="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium"
                :class="route.path === '/admin' ? 'bg-indigo-600 text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'">
                Admin
              </RouterLink>
              <button class="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                Logout
              </button>
            </template>
            <RouterLink v-else to="/admin" class="flex items-center space-x-2 px-4 py-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors font-medium">
              Admin Login
            </RouterLink>
          </template>
          <button @click="store.toggleDarkMode()" class="px-3 py-2 rounded-lg transition-colors text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            :title="store.darkMode ? 'Light Mode' : 'Dark Mode'">
            {{ store.darkMode ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Mobile Top Bar -->
  <header class="md:hidden bg-white dark:bg-gray-900 shadow-sm px-4 py-3 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
    <RouterLink to="/" class="flex items-center">
      <img src="/assets/logo.gif" alt="CfB Gütersloh Logo" class="h-8" />
    </RouterLink>
  </header>

  <!-- Mobile Bottom Tab Bar -->
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
    <div class="grid grid-cols-5 h-16">
      <button @click="navigate('/singles')" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium"
        :class="route.path === '/singles' ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span>Einzel</span>
      </button>
      <button @click="navigate('/doubles')" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium"
        :class="route.path === '/doubles' ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        <span>Doppel</span>
      </button>
      <button @click="navigate('/statistics')" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium"
        :class="route.path === '/statistics' ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        <span>Statistik</span>
      </button>
      <button @click="mobileMoreOpen = !mobileMoreOpen" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium"
        :class="isMorePage || mobileMoreOpen ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
        <span>Mehr</span>
      </button>
      <template v-if="!inArchive">
        <button v-if="store.user" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-red-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          <span>Logout</span>
        </button>
        <button v-else @click="navigate('/admin')" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium"
          :class="route.path === '/admin' ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>
          <span>Login</span>
        </button>
      </template>
      <button v-else @click="navigate('/')" class="flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-amber-600">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
        <span>Zurück</span>
      </button>
    </div>
  </nav>

  <!-- Mobile More Drawer -->
  <Teleport to="body">
    <div v-if="mobileMoreOpen" class="md:hidden fixed inset-0 z-40" @click="mobileMoreOpen = false">
      <div class="absolute inset-0 bg-black/30"></div>
      <div class="absolute bottom-16 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl p-4" @click.stop>
        <div class="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
        <div class="grid grid-cols-3 gap-3">
          <button v-if="!inArchive" @click="navigate('/challenges')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
            :class="route.path === '/challenges' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Heraus&shy;forderungen
          </button>
          <button @click="navigate('/matches')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
            :class="route.path === '/matches' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            Alle Spiele
          </button>
          <button @click="navigate('/players')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
            :class="route.path === '/players' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            Spieler
          </button>
          <button v-if="!inArchive && hasArchiveSeasons" @click="navigate('/archive')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
            :class="route.path === '/archive' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8"/></svg>
            Archiv
          </button>
          <button v-if="!inArchive && store.user && store.isAdmin" @click="navigate('/admin')" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium"
            :class="route.path === '/admin' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            Admin
          </button>
          <button @click="store.toggleDarkMode(); mobileMoreOpen = false" class="flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800">
            <span class="text-2xl">{{ store.darkMode ? '☀️' : '🌙' }}</span>
            {{ store.darkMode ? 'Light Mode' : 'Dark Mode' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
