import { describe, it, expect } from 'vitest'
import { runIteratedPD } from './iteratedPD'
import { createInitialMemory, strategies, applyNoise } from './strategies'

describe('iterated PD', () => {
  it('produces higher scores for mutual cooperation', () => {
    const payoffs = { T: 5, R: 3, P: 1, S: 0 }
    const result = runIteratedPD(
      strategies.AlwaysCooperate,
      strategies.AlwaysCooperate,
      { selfId: 'A', opponentId: 'B' },
      { selfId: 'B', opponentId: 'A' },
      payoffs,
      { H: 50, w: 1, noise: 0, random01: () => 0.5 },
      createInitialMemory(),
      createInitialMemory(),
      applyNoise
    )
    expect(result.scoreA).toBe(result.scoreB)
    expect(result.scoreA).toBe(50 * payoffs.R)
  })
})


