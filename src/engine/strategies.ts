import type { Action, StrategyId } from '@/types'

export interface StrategyContext {
  selfId: string
  opponentId: string
}

export interface StrategyMemory {
  lastOpponentActions: Action[]
  lastSelfActions: Action[]
  grudged?: boolean
}

export type StrategyFn = (ctx: StrategyContext, memory: StrategyMemory) => Action

export function createInitialMemory(): StrategyMemory {
  return { lastOpponentActions: [], lastSelfActions: [], grudged: false }
}

const cooperate: Action = 'C'
const defect: Action = 'D'

export const strategies: Record<StrategyId, StrategyFn> = {
  AlwaysCooperate: () => cooperate,
  AlwaysDefect: () => defect,
  Random: () => (Math.random() < 0.5 ? cooperate : defect),
  TitForTat: (_ctx, mem) => (mem.lastOpponentActions[mem.lastOpponentActions.length - 1] ?? cooperate),
  TitForTwoTat: (_ctx, mem) => {
    const l = mem.lastOpponentActions.length
    const lastTwo = mem.lastOpponentActions.slice(Math.max(0, l - 2))
    const defections = lastTwo.filter((a) => a === defect).length
    return defections >= 2 ? defect : cooperate
  },
  Joss: (_ctx, mem) => {
    // TFT with small random defections injected by caller via noise
    return mem.lastOpponentActions[mem.lastOpponentActions.length - 1] ?? cooperate
  },
  Pavlov: (_ctx, mem) => {
    const la = mem.lastSelfActions[mem.lastSelfActions.length - 1]
    const lb = mem.lastOpponentActions[mem.lastOpponentActions.length - 1]
    if (la === undefined || lb === undefined) return cooperate
    const same = la === lb
    // Win-Stay, Lose-Shift: if outcomes matched, repeat C; if not, switch
    if (same) return la
    return la === cooperate ? defect : cooperate
  },
  Grudger: (_ctx, mem) => {
    if (mem.grudged) return defect
    if (mem.lastOpponentActions.includes(defect)) {
      mem.grudged = true
      return defect
    }
    return cooperate
  },
  Friedman: (_ctx, mem) => {
    // Cooperate until the opponent defects once, then defect forever
    return mem.lastOpponentActions.includes(defect) ? defect : cooperate
  },
}

export function applyNoise(action: Action, noise: number, random01: () => number): Action {
  if (noise <= 0) return action
  return random01() < noise ? (action === 'C' ? 'D' : 'C') : action
}


