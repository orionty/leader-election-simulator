import type { Action, Payoffs } from '@/types'
import type { StrategyFn, StrategyMemory, StrategyContext } from './strategies'

export interface IPDOptions {
  H: number
  w: number
  noise: number
  random01: () => number
}

export interface IPDResult {
  rounds: number
  scoreA: number
  scoreB: number
  coopRate: number
  historyA: Action[]
  historyB: Action[]
}

export function runIteratedPD(
  strategyA: StrategyFn,
  strategyB: StrategyFn,
  ctxA: StrategyContext,
  ctxB: StrategyContext,
  payoffs: Payoffs,
  options: IPDOptions,
  memA: StrategyMemory,
  memB: StrategyMemory,
  applyNoise: (a: Action, noise: number, r: () => number) => Action
): IPDResult {
  let t = 0
  let scoreA = 0
  let scoreB = 0
  const historyA: Action[] = []
  const historyB: Action[] = []
  let coopCount = 0

  const nextRound = () => {
    const a0 = strategyA(ctxA, memA)
    const b0 = strategyB(ctxB, memB)
    const a = applyNoise(a0, options.noise, options.random01)
    const b = applyNoise(b0, options.noise, options.random01)

    historyA.push(a)
    historyB.push(b)
    memA.lastSelfActions.push(a)
    memB.lastSelfActions.push(b)
    memA.lastOpponentActions.push(b)
    memB.lastOpponentActions.push(a)

    if (a === 'C' && b === 'C') {
      scoreA += payoffs.R
      scoreB += payoffs.R
      coopCount += 2
    } else if (a === 'C' && b === 'D') {
      scoreA += payoffs.S
      scoreB += payoffs.T
    } else if (a === 'D' && b === 'C') {
      scoreA += payoffs.T
      scoreB += payoffs.S
    } else {
      scoreA += payoffs.P
      scoreB += payoffs.P
    }

    t++
  }

  while (t < options.H) {
    nextRound()
    if (t >= options.H) break
    if (options.random01() > options.w) break
  }

  const totalActs = historyA.length + historyB.length
  const coopRate = totalActs > 0 ? coopCount / totalActs : 0
  return { rounds: t, scoreA, scoreB, coopRate, historyA, historyB }
}


