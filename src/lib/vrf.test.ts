import { describe, it, expect } from 'vitest'
import { vrfDraw } from './vrf'

describe('vrfDraw', () => {
  it('is deterministic for same inputs', () => {
    const seed = 'seed'
    const candidates = [
      { id: 'A', score: 10 },
      { id: 'B', score: 10 },
    ]
    const r1 = vrfDraw(seed, candidates, 0)
    const r2 = vrfDraw(seed, candidates, 0)
    expect(r1).toEqual(r2)
  })
})


