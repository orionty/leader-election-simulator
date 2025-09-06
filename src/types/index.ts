// Types for the game-theoretic leader election simulator

export type Action = 'C' | 'D';

export type StrategyId =
  | 'TitForTat'
  | 'TitForTwoTat'
  | 'AlwaysCooperate'
  | 'AlwaysDefect'
  | 'Random'
  | 'Joss'
  | 'Pavlov'
  | 'Grudger'
  | 'Friedman';

export interface Payoffs { T: number; R: number; P: number; S: number }

export interface Player {
  id: string
  label: string
  strategy: StrategyId
  trust: number
  trustLife: number
  blacklisted?: boolean
}

export interface DishonestyModel {
  mode: 'prob' | 'script'
  p?: number
}

export interface SimConfig {
  players: number
  strategies: Record<StrategyId, number>
  payoffs: Payoffs
  w: number
  H: number
  noise: number
  allocatedLeaderIncentive: number
  dishonesty: DishonestyModel
  seed: string
  batches: number
}

export interface MatchResult {
  a: string
  b: string
  rounds: number
  scoreA: number
  scoreB: number
  coopRate: number
}

export interface RoundSummary {
  leaderboard: Array<{ id: string; label: string; strategy: StrategyId; score: number; trust: number; trustLife: number }>
  leaderId: string
  tie?: boolean
  vrfProof?: string
}

export interface BatchResult {
  config: SimConfig
  seed: string
  roundResults: RoundSummary[]
  matches: MatchResult[]
  stats: Record<string, number>
}

export interface VrfDrawResult {
  winnerId: string
  proof: string
  scoresHash: string
}


