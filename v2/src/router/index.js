import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/pages/HomePage.vue') },
  { path: '/singles', component: () => import('@/pages/SinglesPage.vue') },
  { path: '/doubles', component: () => import('@/pages/DoublesPage.vue') },
  { path: '/challenges', component: () => import('@/pages/ChallengesPage.vue') },
  { path: '/statistics', component: () => import('@/pages/StatisticsPage.vue') },
  { path: '/matches', component: () => import('@/pages/MatchesPage.vue') },
  { path: '/players', component: () => import('@/pages/PlayersPage.vue') },
  { path: '/players/:id', component: () => import('@/pages/PlayerProfilePage.vue') },
  { path: '/archive', component: () => import('@/pages/ArchivePage.vue') },
  { path: '/archive/:year', component: () => import('@/pages/ArchivePage.vue') },
  { path: '/admin', component: () => import('@/pages/admin/AdminPage.vue') },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
