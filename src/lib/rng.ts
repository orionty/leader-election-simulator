import prand from 'pure-rand'

export interface SeededRngConfig {
  seed: string
}

export class SeededRng {
  private engine: prand.RandomGenerator

  constructor(seed: string) {
    const numeric = SeededRng.hashSeedToInt(seed)
    this.engine = prand.xorshift128plus(numeric)
  }

  static hashSeedToInt(seed: string): number {
    // Convert string to a 32-bit integer deterministically
    let h = 2166136261 >>> 0
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }

  next(): number {
    const n = prand.unsafeUniformIntDistribution(0, 0xffffffff, this.engine)
    return n / 0x100000000
  }

  int(min: number, max: number): number {
    if (max < min) throw new Error('invalid range')
    return prand.unsafeUniformIntDistribution(min, max, this.engine)
  }

  bool(p = 0.5): boolean {
    return this.next() < p
  }
}


