import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { BatchResult, Payoffs, SimConfig, StrategyId } from '@/types'

const defaultPayoffs: Payoffs = { T: 5, R: 3, P: 1, S: 0 }

const defaultStrategies: Record<StrategyId, number> = {
  TitForTat: 0.3,
  TitForTwoTat: 0.1,
  AlwaysCooperate: 0.1,
  AlwaysDefect: 0.1,
  Random: 0.1,
  Joss: 0.1,
  Pavlov: 0.1,
  Grudger: 0.05,
  Friedman: 0.05,
}

const defaultConfig: SimConfig = {
  players: 16,
  strategies: defaultStrategies,
  payoffs: defaultPayoffs,
  w: 0.98,
  H: 200,
  noise: 0.01,
  allocatedLeaderIncentive: 100,
  dishonesty: { mode: 'prob', p: 0.0 },
  seed: 'default-seed',
  batches: 1,
}

export interface SimState {
  config: SimConfig
  running: boolean
  progress: number
  results: BatchResult[]
  setConfig: (c: Partial<SimConfig>) => void
  setRunning: (r: boolean) => void
  pushResult: (r: BatchResult) => void
  setProgress: (p: number) => void
  clearResults: () => void
}

export const useSimStore = create<SimState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      running: false,
      progress: 0,
      results: [],
      setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
      setRunning: (r) => set({ running: r }),
      pushResult: (r) => set((s) => ({ results: [...s.results, r] })),
      setProgress: (p) => set({ progress: p }),
      clearResults: () => set({ results: [] }),
    }),
    { name: 'sim-store' }
  )
)


