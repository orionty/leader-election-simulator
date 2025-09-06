import { sha256 } from '@noble/hashes/sha2'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils'

export interface VrfEntry {
  id: string
  score: number
}

export function vrfDraw(seed: string, candidates: VrfEntry[], roundIndex: number): { winnerId: string; proof: string } {
  // Deterministic: hash seed + round + sorted candidates with scores
  const sorted = [...candidates].sort((a, b) => (a.id < b.id ? -1 : 1))
  const payload = JSON.stringify({ seed, roundIndex, candidates: sorted })
  const digest = sha256(utf8ToBytes(payload))
  const proof = bytesToHex(digest)

  // Map each candidate to a sub-hash using proof + id for pseudo-VRF ticket
  let bestId = sorted[0]?.id ?? ''
  let bestVal = ''
  for (const c of sorted) {
    const ticket = sha256(utf8ToBytes(proof + '|' + c.id))
    const asHex = bytesToHex(ticket)
    // Lower hex value wins for fairness
    if (bestVal === '' || asHex < bestVal) {
      bestVal = asHex
      bestId = c.id
    }
  }
  return { winnerId: bestId, proof }
}


