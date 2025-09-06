import { SeededRng } from '@/lib/rng'

export interface RaftConfig {
  nodes: number
  electionTimeoutMs: { min: number; max: number }
  networkDelayMs: { mean: number; jitter: number; dropProb: number }
  trials: number
  seed: string
}

export interface RaftResultSummary {
  times: number[]
  mean: number
  p50: number
  p95: number
}

function sampleExp(mean: number, r: () => number): number {
  const u = Math.max(1e-12, 1 - r())
  return -Math.log(u) * mean
}

export function simulateRaftLatency(cfg: RaftConfig): RaftResultSummary {
  const rng = new SeededRng(cfg.seed)
  const times: number[] = []

  for (let t = 0; t < cfg.trials; t++) {
    const timeouts = Array.from({ length: cfg.nodes }, () =>
      cfg.electionTimeoutMs.min + rng.next() * (cfg.electionTimeoutMs.max - cfg.electionTimeoutMs.min)
    )
    // First to timeout tries to become leader
    const attemptTime = Math.min(...timeouts)
    // Simulate message delays to majority and possible drops; retry if dropped too much
    let done = false
    let total = attemptTime
    let retries = 0
    while (!done && retries < 10) {
      const quorum = Math.floor(cfg.nodes / 2) + 1
      let successes = 1 // self vote
      for (let i = 0; i < cfg.nodes - 1; i++) {
        const dropped = rng.bool(cfg.networkDelayMs.dropProb)
        if (dropped) continue
        const delay = sampleExp(cfg.networkDelayMs.mean, () => rng.next()) + (rng.next() - 0.5) * cfg.networkDelayMs.jitter
        total += Math.max(0, delay)
        successes++
        if (successes >= quorum) break
      }
      if (successes >= quorum) {
        done = true
      } else {
        retries++
        total += cfg.electionTimeoutMs.min + rng.next() * (cfg.electionTimeoutMs.max - cfg.electionTimeoutMs.min)
      }
    }
    times.push(Math.max(0, total))
  }

  const sorted = [...times].sort((a, b) => a - b)
  const mean = times.reduce((a, b) => a + b, 0) / Math.max(1, times.length)
  const p = (q: number) => sorted[Math.floor(q * (sorted.length - 1))] ?? 0
  return { times, mean, p50: p(0.5), p95: p(0.95) }
}


