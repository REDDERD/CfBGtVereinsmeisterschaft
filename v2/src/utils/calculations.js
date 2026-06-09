import { useAppStore } from '@/stores/app.js'
import { getGroupPlayers } from './helpers.js'

export function calculateStandings(groupNum) {
  const store = useAppStore()
  const players = getGroupPlayers(groupNum)
  const stats = {}

  players.forEach(p => {
    stats[p.id] = { id: p.id, name: p.name, matches: 0, points: 0, setsWon: 0, setsLost: 0, pointsFor: 0, pointsAgainst: 0 }
  })

  store.singlesMatches.forEach(match => {
    if (!match.sets) return
    const status = match.status || 'confirmed'
    if (status !== 'confirmed') return
    const p1 = match.player1Id, p2 = match.player2Id
    if (!stats[p1] || !stats[p2]) return

    let p1Sets = 0, p2Sets = 0, p1Pts = 0, p2Pts = 0
    match.sets.forEach(set => {
      p1Pts += set.p1; p2Pts += set.p2
      if (set.p1 > set.p2) p1Sets++; else p2Sets++
    })
    stats[p1].matches++; stats[p2].matches++
    stats[p1].setsWon += p1Sets; stats[p1].setsLost += p2Sets
    stats[p2].setsWon += p2Sets; stats[p2].setsLost += p1Sets
    stats[p1].pointsFor += p1Pts; stats[p1].pointsAgainst += p2Pts
    stats[p2].pointsFor += p2Pts; stats[p2].pointsAgainst += p1Pts

    if (p1Sets > p2Sets) {
      stats[p1].points += (p1Sets === 2 && p2Sets === 0) ? 3 : 2
      stats[p2].points += p2Sets === 1 ? 1 : 0
    } else {
      stats[p2].points += (p2Sets === 2 && p1Sets === 0) ? 3 : 2
      stats[p1].points += p1Sets === 1 ? 1 : 0
    }
  })

  const groupPlayers = getGroupPlayers(groupNum)
  const totalGamesPerPlayer = (groupPlayers.length - 1) * 2

  return Object.values(stats).map(p => ({
    ...p,
    totalGames: totalGamesPerPlayer,
    pointDiff: p.pointsFor - p.pointsAgainst,
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    const aD = a.setsWon - a.setsLost, bD = b.setsWon - b.setsLost
    if (bD !== aD) return bD - aD
    return b.pointDiff - a.pointDiff
  })
}
