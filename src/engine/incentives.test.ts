import { describe, it, expect } from 'vitest'
import { applyIncentives } from './incentives'

describe('incentives', () => {
  it('increments trust on honest completion up to cap', () => {
    const players = [{ id: 'L', label: 'L', strategy: 'AlwaysCooperate' as const, trust: 0, trustLife: 3 }]
    const { updatedPlayers } = applyIncentives(players, 'L', { allocatedLeaderIncentive: 100, dishonestyEvent: false })
    expect(updatedPlayers[0].trust).toBeCloseTo(0.001)
  })

  it('resets trust and decrements life on dishonesty', () => {
    const players = [{ id: 'L', label: 'L', strategy: 'AlwaysCooperate' as const, trust: 5, trustLife: 2 }]
    const { updatedPlayers } = applyIncentives(players, 'L', { allocatedLeaderIncentive: 100, dishonestyEvent: true })
    expect(updatedPlayers[0].trust).toBe(0)
    expect(updatedPlayers[0].trustLife).toBe(1)
  })
})


