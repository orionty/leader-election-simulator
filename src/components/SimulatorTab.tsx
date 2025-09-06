"use client";
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { useSimStore } from '@/state/useSimStore'
import type { StrategyId } from '@/types'

const strategyInfo = {
  TitForTat: { 
    name: 'Tit For Tat', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and then copies what the opponent did in the last move'
  },
  TitForTwoTat: { 
    name: 'Tit For Two Tats', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and defects only after the opponent has defected twice in a row'
  },
  AlwaysCooperate: { 
    name: 'Always Cooperate', 
    nice: true, 
    forgiving: true,
    description: 'Always cooperates regardless of what the opponent does'
  },
  AlwaysDefect: { 
    name: 'Always Defect', 
    nice: false, 
    forgiving: false,
    description: 'Always defects regardless of what the opponent does'
  },
  Random: { 
    name: 'Random', 
    nice: false, 
    forgiving: true,
    description: 'Randomly cooperates or defects in each round'
  },
  Joss: { 
    name: 'Joss', 
    nice: false, 
    forgiving: false,
    description: 'Starts by cooperating and then starts copying what the other player did on the last move. 10% of the time defects regardless'
  },
  Pavlov: { 
    name: 'Pavlov', 
    nice: true, 
    forgiving: true,
    description: 'Win-Stay, Lose-Shift strategy'
  },
  Grudger: { 
    name: 'Grudger', 
    nice: true, 
    forgiving: false,
    description: 'Cooperates until the opponent defects, then defects forever'
  },
  Friedman: { 
    name: 'Friedman', 
    nice: true, 
    forgiving: false,
    description: 'Starts by cooperating but if the opponent defects just once, it will keep defecting for the remainder of the game'
  },
}

export function SimulatorTab() {
  const { config, running, progress, setProgress, setRunning, pushResult, results } = useSimStore()
  const workerRef = useRef<Worker | null>(null)
  const [supportsWorker, setSupportsWorker] = useState(false)
  const [selectedPlayer1, setSelectedPlayer1] = useState<StrategyId>('Joss')
  const [selectedPlayer2, setSelectedPlayer2] = useState<StrategyId>('Grudger')
  const [rounds, setRounds] = useState(100)

  useEffect(() => {
    setSupportsWorker(typeof window !== 'undefined' && 'Worker' in window)
  }, [])

  const start = () => {
    if (!supportsWorker) return
    setRunning(true)
    setProgress(0)
    const w = new Worker(new URL('../workers/simWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = w
    w.onmessage = (ev: MessageEvent) => {
      const data = ev.data
      if (data?.type === 'tick') {
        setProgress(data.progress)
      } else if (data?.type === 'done') {
        pushResult(data.result)
        setRunning(false)
      }
    }
    w.postMessage({ type: 'run', config })
  }

  const stop = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    setRunning(false)
  }

  const reset = () => {
    // Reset simulation state
    setProgress(0)
  }

  // Mock history data for visualization (deterministic for consistency)
  const mockHistory = Array.from({ length: rounds }, (_, i) => {
    const p1Action = (i + selectedPlayer1.length) % 3 === 0 ? 'D' : 'C'
    const p2Action = (i + selectedPlayer2.length) % 4 === 0 ? 'D' : 'C'
    return { p1: p1Action, p2: p2Action }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Strategies */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(strategyInfo).map(([key, info]) => (
              <div key={key} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{info.name}</span>
                  <div className="flex gap-1">
                    <Badge variant={info.nice ? "default" : "destructive"} className="text-xs">
                      {info.nice ? "Nice" : "Nasty"}
                    </Badge>
                    <Badge variant={info.forgiving ? "default" : "secondary"} className="text-xs">
                      {info.forgiving ? "Forgiving" : "Unforgiving"}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Matchup and Controls */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Matchup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="space-y-2">
                <label className="text-sm font-medium">Player 1 - Score: 123</label>
                <Select value={selectedPlayer1} onValueChange={(value) => setSelectedPlayer1(value as StrategyId)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(strategyInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>{info.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-center text-muted-foreground text-lg font-medium">
                vs.
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Player 2 - Score: 123</label>
                <Select value={selectedPlayer2} onValueChange={(value) => setSelectedPlayer2(value as StrategyId)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(strategyInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key}>{info.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Number of Rounds */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of rounds</label>
              <Input 
                type="number" 
                value={rounds} 
                onChange={(e) => setRounds(parseInt(e.target.value) || 100)}
                className="w-32"
              />
            </div>

            {/* Delay Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Delay</label>
              <Slider defaultValue={[50]} max={100} step={1} className="w-full" />
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button onClick={start} disabled={running || !supportsWorker}>
                Start
              </Button>
              <Button variant="secondary" onClick={reset}>
                Reset
              </Button>
            </div>

            {/* Progress */}
            {running && (
              <div className="text-sm text-muted-foreground">
                Progress: {(progress * 100).toFixed(0)}%
              </div>
            )}

            {/* Game History Visualization */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Player 1:</span>
                <div className="flex flex-wrap gap-1">
                  {mockHistory.slice(0, 30).map((round, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                        round.p1 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    >
                      {round.p1}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Player 2:</span>
                <div className="flex flex-wrap gap-1">
                  {mockHistory.slice(0, 30).map((round, i) => (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                        round.p2 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    >
                      {round.p2}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional rows */}
              <div className="flex flex-wrap gap-1">
                {mockHistory.slice(30, 60).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p1 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p1 === 'C' ? 'C' : 'D'}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {mockHistory.slice(30, 60).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p2 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p2 === 'C' ? 'C' : 'D'}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {mockHistory.slice(60, 90).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p1 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p1}
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {mockHistory.slice(60, 90).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p2 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p2}
                  </div>
                ))}
              </div>

              <div className="flex gap-1">
                {mockHistory.slice(90, 105).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p1 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p1}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-1">
                {mockHistory.slice(90, 105).map((round, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                      round.p2 === 'C' ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                  >
                    {round.p2}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
