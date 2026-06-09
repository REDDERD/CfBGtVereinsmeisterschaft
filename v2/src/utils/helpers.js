import { useAppStore } from '@/stores/app.js'

export function getPlayerName(playerId) {
  const store = useAppStore()
  const player = store.players.find(p => p.id === playerId)
  return player ? player.name : 'Gelöschter Spieler'
}

export function getGroupPlayers(groupNum) {
  const store = useAppStore()
  return store.players.filter(p => p.singlesGroup === groupNum)
}

export function formatDate(val) {
  if (!val) return ''
  const ms = val.seconds ? val.seconds * 1000 : val.toDate?.()?.getTime?.() ?? 0
  return new Date(ms).toLocaleDateString('de-DE')
}

export function isReadOnly() {
  const store = useAppStore()
  return store.archiveMode
}
