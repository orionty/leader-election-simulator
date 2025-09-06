/// <reference lib="webworker" />
import type { BatchResult, MatchResult, Payoffs, Player, RoundSummary, SimConfig, StrategyId } from '@/types'
import { SeededRng } from '@/lib/rng'
import { runRoundRobin } from '@/engine/tournament'
import { electLeader } from '@/engine/election'
import { applyIncentives } from '@/engine/incentives'

export type WorkerRequest = { type: 'run'; config: SimConfig }
export type WorkerProgress = { type: 'tick'; progress: number; batch: number }
export type WorkerDone = { type: 'done'; result: BatchResult }
export type WorkerMessage = WorkerProgress | WorkerDone

const defaultPayoffs: Payoffs = { T: 5, R: 3, P: 1, S: 0 }

function instantiatePlayers(cfg: SimConfig, rng: SeededRng): Player[] {
  const ids: Player[] = []
  const weights = Object.entries(cfg.strategies) as Array<[StrategyId, number]>
  
  // Check if this is a single match (exactly 2 players with 2 strategies)
  const isSingleMatch = cfg.players === 2 && weights.length === 2 && weights.every(([, w]) => w === 0.5)
  
  if (isSingleMatch) {
    // For single matches, assign strategies directly to P1 and P2
    const strategies = weights.map(([strategy]) => strategy)
    ids.push({ id: 'P1', label: strategies[0], strategy: strategies[0], trust: 0, trustLife: 3 })
    ids.push({ id: 'P2', label: strategies[1], strategy: strategies[1], trust: 0, trustLife: 3 })
  } else {
    // For tournaments, use random sampling
    const sum = weights.reduce((a, [, w]) => a + w, 0) || 1
    const normalized = weights.map(([k, w]) => [k, w / sum] as const)
    for (let i = 0; i < cfg.players; i++) {
      // sample strategy by cumulative distribution
      const r = rng.next()
      let acc = 0
      let chosen: StrategyId = normalized[0][0]
      for (const [sid, p] of normalized) {
        acc += p
        if (r <= acc) { chosen = sid; break }
      }
      ids.push({ id: `P${i + 1}`, label: chosen, strategy: chosen, trust: 0, trustLife: 3 })
    }
  }
  return ids
}

function dishonestyEvent(mode: SimConfig['dishonesty'], rng: SeededRng): boolean {
  if (mode.mode === 'prob') return rng.bool(mode.p ?? 0)
  // script mode can be extended via incoming events; default false here
  return false
}

function runSingleBatch(cfg: SimConfig): BatchResult {
  const rng = new SeededRng(cfg.seed)
  const payoffs = cfg.payoffs ?? defaultPayoffs
  let players = instantiatePlayers(cfg, rng)
  const matchesAll: MatchResult[] = []
  const roundResults: RoundSummary[] = []
  const runs = 1 // leader per tournament; extend to multi-round later if needed

  for (let r = 0; r < runs; r++) {
    const { totals, matches } = runRoundRobin(
      players.filter((p) => !p.blacklisted),
      payoffs,
      { H: cfg.H, w: cfg.w, noise: cfg.noise, random01: () => rng.next() }
    )
    matchesAll.push(...matches)
    const summary = electLeader(totals, cfg.seed, r)
    // Merge trust/trustLife and player info into leaderboard snapshot
    summary.leaderboard = summary.leaderboard.map((e) => {
      const p = players.find((x) => x.id === e.id)!
      return { ...e, label: p.label, strategy: p.strategy, trust: p.trust, trustLife: p.trustLife }
    })
    const dishonest = dishonestyEvent(cfg.dishonesty, rng)
    const { updatedPlayers } = applyIncentives(players, summary.leaderId, {
      allocatedLeaderIncentive: cfg.allocatedLeaderIncentive,
      dishonestyEvent: dishonest,
    })
    players = updatedPlayers
    roundResults.push(summary)
  }

  const stats: Record<string, number> = {
    // Placeholder stats; expanded later when we have time series
    cooperation: matchesAll.reduce((a, m) => a + m.coopRate, 0) / Math.max(1, matchesAll.length),
  }

  return { config: cfg, seed: cfg.seed, roundResults, matches: matchesAll, stats }
}

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const data = ev.data
  if (data?.type === 'run') {
    const results: BatchResult[] = []
    for (let b = 0; b < data.config.batches; b++) {
      const result = runSingleBatch({ ...data.config, seed: data.config.seed + `#${b}` })
      results.push(result)
      ;(self as unknown as { postMessage: (msg: WorkerMessage) => void }).postMessage({ type: 'tick', progress: (b + 1) / data.config.batches, batch: b + 1 })
    }
    // If batches > 1, we could aggregate; return the last for now along with ability to combine client-side
    const final = results[results.length - 1]
    ;(self as unknown as { postMessage: (msg: WorkerMessage) => void }).postMessage({ type: 'done', result: final })
  }
}

export {}


