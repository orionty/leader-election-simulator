import type { Player } from '@/types'

export interface IncentiveOutcome {
  updatedPlayers: Player[]
  payoutByLeader: Record<string, number>
}

export interface IncentiveConfig {
  allocatedLeaderIncentive: number
  dishonestyEvent: boolean
}

export function applyIncentives(
  players: Player[],
  leaderId: string,
  config: IncentiveConfig
): IncentiveOutcome {
  const updatedPlayers = players.map((p) => ({ ...p }))
  const payoutByLeader: Record<string, number> = {}

  const leader = updatedPlayers.find((p) => p.id === leaderId)
  if (leader) {
    if (config.dishonestyEvent) {
      leader.trust = 0
      leader.trustLife = Math.max(0, leader.trustLife - 1)
      if (leader.trustLife === 0) leader.blacklisted = true
    } else {
      leader.trust = Math.min(10, leader.trust + 0.001)
    }
    payoutByLeader[leader.id] = leader.trust * config.allocatedLeaderIncentive
  }

  return { updatedPlayers, payoutByLeader }
}


