import type { RoundSummary } from '@/types'
import { vrfDraw } from '@/lib/vrf'

export function electLeader(
  totals: Record<string, number>,
  seed: string,
  roundIndex: number
): RoundSummary {
  const entries = Object.entries(totals)
  const leaderboard = entries
    .map(([id, score]) => ({ id, label: id, strategy: 'TitForTat' as any, score, trust: 0, trustLife: 0 }))
    .sort((a, b) => b.score - a.score)

  const topScore = leaderboard[0]?.score ?? 0
  const topCandidates = leaderboard.filter((e) => e.score === topScore)

  if (topCandidates.length === 1) {
    return {
      leaderboard,
      leaderId: topCandidates[0].id,
    }
  }

  const { winnerId, proof } = vrfDraw(
    seed,
    topCandidates.map((c) => ({ id: c.id, score: c.score })),
    roundIndex
  )
  return { leaderboard, leaderId: winnerId, tie: true, vrfProof: proof }
}


