import { describe, it, expect } from 'vitest'
import { strategies, createInitialMemory } from './strategies'

describe('strategies', () => {
  it('TitForTat cooperates first, then mirrors', () => {
    const memA = createInitialMemory()
    const a1 = strategies.TitForTat({ selfId: 'A', opponentId: 'B' }, memA)
    expect(a1).toBe('C')
    memA.lastOpponentActions.push('D')
    const a2 = strategies.TitForTat({ selfId: 'A', opponentId: 'B' }, memA)
    expect(a2).toBe('D')
  })
})


