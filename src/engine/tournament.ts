import type { MatchResult, Player, Payoffs } from '@/types'
import { strategies, createInitialMemory, type StrategyFn } from './strategies'
import { runIteratedPD } from './iteratedPD'
import { applyNoise as applyNoiseUtil } from './strategies'

export interface TournamentOptions {
  H: number
  w: number
  noise: number
  random01: () => number
}

export function runRoundRobin(
  players: Player[],
  payoffs: Payoffs,
  options: TournamentOptions
): { totals: Record<string, number>; matches: MatchResult[] } {
  const totals: Record<string, number> = {}
  const memories: Record<string, Record<string, ReturnType<typeof createInitialMemory>>> = {}
  const matches: MatchResult[] = []

  for (const p of players) {
    totals[p.id] = 0
    memories[p.id] = {}
  }

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const a = players[i]
      const b = players[j]
      if (a.blacklisted || b.blacklisted) continue

      const stratA: StrategyFn = strategies[a.strategy]
      const stratB: StrategyFn = strategies[b.strategy]
      const memA = memories[a.id][b.id] ?? (memories[a.id][b.id] = createInitialMemory())
      const memB = memories[b.id][a.id] ?? (memories[b.id][a.id] = createInitialMemory())

      const result = runIteratedPD(
        stratA,
        stratB,
        { selfId: a.id, opponentId: b.id },
        { selfId: b.id, opponentId: a.id },
        payoffs,
        options,
        memA,
        memB,
        applyNoiseUtil
      )

      totals[a.id] += result.scoreA
      totals[b.id] += result.scoreB
      const coopRate = result.coopRate
      matches.push({ a: a.id, b: b.id, rounds: result.rounds, scoreA: result.scoreA, scoreB: result.scoreB, coopRate })
    }
  }

  return { totals, matches }
}


