"use client";
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Play, Square, RotateCcw, Settings, Trophy, Users, Target, Crown, 
  Zap, Volume2, VolumeX, Sparkles, TrendingUp, Activity, Timer
} from 'lucide-react'
import { useSimStore } from '@/state/useSimStore'
import type { StrategyId } from '@/types'

const strategyInfo = {
  TitForTat: { 
    name: 'Tit For Tat', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and then copies what the opponent did in the last move',
    color: 'bg-blue-500',
    emoji: '🤝'
  },
  TitForTwoTat: { 
    name: 'Tit For Two Tats', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and defects only after the opponent has defected twice in a row',
    color: 'bg-indigo-500',
    emoji: '🤝🤝'
  },
  AlwaysCooperate: { 
    name: 'Always Cooperate', 
    nice: true, 
    forgiving: true,
    description: 'Always cooperates regardless of what the opponent does',
    color: 'bg-green-500',
    emoji: '😇'
  },
  AlwaysDefect: { 
    name: 'Always Defect', 
    nice: false, 
    forgiving: false,
    description: 'Always defects regardless of what the opponent does',
    color: 'bg-red-500',
    emoji: '😈'
  },
  Random: { 
    name: 'Random', 
    nice: false, 
    forgiving: true,
    description: 'Randomly cooperates or defects in each round',
    color: 'bg-purple-500',
    emoji: '🎲'
  },
  Joss: { 
    name: 'Joss', 
    nice: false, 
    forgiving: false,
    description: 'Starts by cooperating and then starts copying what the other player did on the last move. 10% of the time defects regardless',
    color: 'bg-orange-500',
    emoji: '🃏'
  },
  Pavlov: { 
    name: 'Pavlov', 
    nice: true, 
    forgiving: true,
    description: 'Win-Stay, Lose-Shift strategy',
    color: 'bg-cyan-500',
    emoji: '🧠'
  },
  Grudger: { 
    name: 'Grudger', 
    nice: true, 
    forgiving: false,
    description: 'Cooperates until the opponent defects, then defects forever',
    color: 'bg-yellow-600',
    emoji: '😤'
  },
  Friedman: { 
    name: 'Friedman', 
    nice: true, 
    forgiving: false,
    description: 'Starts by cooperating but if the opponent defects just once, it will keep defecting for the remainder of the game',
    color: 'bg-pink-500',
    emoji: '⚖️'
  },
}

interface Player {
  id: string
  name: string
  strategy: StrategyId
  score: number
  wins: number
  losses: number
  cooperations: number
  defections: number
  trust: number
  trustLife: number
  isLeader: boolean
}

export function AdvancedSimulatorTab() {
  const { config, running, progress, setProgress, setRunning, pushResult, results, clearResults } = useSimStore()
  const workerRef = useRef<Worker | null>(null)
  const runningRef = useRef(false)
  const [supportsWorker, setSupportsWorker] = useState(false)
  
  // Tournament Settings
  const [tournamentMode, setTournamentMode] = useState<'single' | 'tournament'>('single')
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayer1, setSelectedPlayer1] = useState<StrategyId>('TitForTat')
  const [selectedPlayer2, setSelectedPlayer2] = useState<StrategyId>('Joss')
  const [rounds, setRounds] = useState(100)
  const [animationSpeed, setAnimationSpeed] = useState(2)
  const [soundEnabled, setSoundEnabled] = useState(false)
  
  // Game State
  const [currentRound, setCurrentRound] = useState(0)
  const [gameHistory, setGameHistory] = useState<Array<{p1: string, p2: string}>>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [leaderboard, setLeaderboard] = useState<Player[]>([])
  
  // Advanced Settings
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [pauseBetweenRounds, setPauseBetweenRounds] = useState(false)

  useEffect(() => {
    setSupportsWorker(typeof window !== 'undefined' && 'Worker' in window)
    initializePlayers()
  }, [])

  const initializePlayers = () => {
    if (tournamentMode === 'single') {
      const p1: Player = {
        id: 'P1',
        name: strategyInfo[selectedPlayer1].name,
        strategy: selectedPlayer1,
        score: 0,
        wins: 0,
        losses: 0,
        cooperations: 0,
        defections: 0,
        trust: 0,
        trustLife: 3,
        isLeader: false
      }
      const p2: Player = {
        id: 'P2',
        name: strategyInfo[selectedPlayer2].name,
        strategy: selectedPlayer2,
        score: 0,
        wins: 0,
        losses: 0,
        cooperations: 0,
        defections: 0,
        trust: 0,
        trustLife: 3,
        isLeader: false
      }
      setPlayers([p1, p2])
    } else {
      // Tournament mode - create multiple players
      const tournamentPlayers: Player[] = Object.keys(strategyInfo).map((strategyKey, index) => ({
        id: `P${index + 1}`,
        name: strategyInfo[strategyKey as StrategyId].name,
        strategy: strategyKey as StrategyId,
        score: 0,
        wins: 0,
        losses: 0,
        cooperations: 0,
        defections: 0,
        trust: 0,
        trustLife: 3,
        isLeader: false
      }))
      setPlayers(tournamentPlayers)
    }
  }

  useEffect(() => {
    initializePlayers()
  }, [tournamentMode, selectedPlayer1, selectedPlayer2])

  const playSound = (type: 'cooperate' | 'defect' | 'win' | 'start') => {
    if (!soundEnabled) return
    // Placeholder for sound effects
    console.log(`Playing sound: ${type}`)
  }

  const start = async () => {
    if (!supportsWorker) return
    clearResults()
    setRunning(true)
    runningRef.current = true
    setProgress(0)
    setCurrentRound(0)
    setGameHistory([])
    setIsAnimating(true)
    playSound('start')

    // Create tournament configuration
    const tournamentConfig = {
      ...config,
      H: rounds,
      strategies: tournamentMode === 'single' 
        ? { [selectedPlayer1]: 0.5, [selectedPlayer2]: 0.5 }
        : Object.keys(strategyInfo).reduce((acc, key) => ({ ...acc, [key]: 1/Object.keys(strategyInfo).length }), {}),
      players: tournamentMode === 'single' ? 2 : Object.keys(strategyInfo).length,
      batches: 1
    }

    // Start visual simulation immediately
    simulateVisualGame()

    // Use Web Worker for actual simulation
    const w = new Worker(new URL('../workers/simWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = w
    
    w.onmessage = (ev: MessageEvent) => {
      const data = ev.data
      if (data?.type === 'tick') {
        // Worker progress updates - don't interfere with visual simulation
        console.log('Worker progress:', data.progress)
      } else if (data?.type === 'done') {
        console.log('Worker completed, but visual simulation should continue running')
        pushResult(data.result)
        
        // Don't stop the visual simulation here - let it complete naturally
        // The visual simulation will handle its own completion
        
        // Process results for leaderboard
        if (data.result.roundResults && data.result.roundResults.length > 0) {
          const leaderboardData = data.result.roundResults[0].leaderboard.map((player: any, index: number) => ({
            ...players.find(p => p.id === player.id) || players[index],
            score: player.score,
            trust: player.trust,
            trustLife: player.trustLife,
            isLeader: player.id === data.result.roundResults[0].leaderId
          }))
          setLeaderboard(leaderboardData.sort((a: any, b: any) => b.score - a.score))
          
          // Update player scores from Web Worker results (source of truth)
          setPlayers(prev => prev.map((player, index) => {
            const workerPlayer = data.result.roundResults[0].leaderboard.find((p: any) => p.id === player.id)
            return workerPlayer ? { 
              ...player, 
              score: workerPlayer.score,
              name: workerPlayer.label || workerPlayer.strategy,
              strategy: workerPlayer.strategy
            } : player
          }))
        }
      }
    }

    w.postMessage({ type: 'run', config: tournamentConfig })
  }

  const simulateVisualGame = async () => {
    console.log('Starting visual simulation for', rounds, 'rounds')
    const history: Array<{p1: string, p2: string}> = []
    let p1Score = 0
    let p2Score = 0
    
    // Update initial player scores
    setPlayers(prev => [
      { ...prev[0], score: 0 },
      { ...prev[1], score: 0 }
    ])
    
    // Use the same seed as the Web Worker for consistency
    const seed = config.seed + '#0' // Same seed format as Web Worker
    const rng = new (await import('../lib/rng')).SeededRng(seed)
    
    // Use a deterministic approach to ensure all rounds complete
    for (let i = 0; i < rounds; i++) {
      console.log(`Round ${i + 1}/${rounds} - Running:`, runningRef.current)
      
      // Check if user stopped the simulation
      if (!runningRef.current) {
        console.log('Simulation stopped by user at round', i + 1)
        break
      }
      
      // Use the same strategy logic as Web Worker for consistency
      const p1Action = getStrategyActionWithRng(selectedPlayer1, i, history.map(h => h.p2), rng)
      const p2Action = getStrategyActionWithRng(selectedPlayer2, i, history.map(h => h.p1), rng)
      
      console.log(`Round ${i + 1}: P1(${selectedPlayer1})=${p1Action}, P2(${selectedPlayer2})=${p2Action}`)
      
      // Calculate scores based on payoff matrix
      const payoffs = config.payoffs
      let roundP1Score = 0
      let roundP2Score = 0
      
      if (p1Action === 'C' && p2Action === 'C') {
        roundP1Score = payoffs.R
        roundP2Score = payoffs.R
        playSound('cooperate')
      } else if (p1Action === 'C' && p2Action === 'D') {
        roundP1Score = payoffs.S
        roundP2Score = payoffs.T
        playSound('defect')
      } else if (p1Action === 'D' && p2Action === 'C') {
        roundP1Score = payoffs.T
        roundP2Score = payoffs.S
        playSound('defect')
      } else {
        roundP1Score = payoffs.P
        roundP2Score = payoffs.P
        playSound('defect')
      }
      
      p1Score += roundP1Score
      p2Score += roundP2Score
      
      console.log(`Scores after round ${i + 1}: P1=${p1Score}, P2=${p2Score} (this round: P1+${roundP1Score}, P2+${roundP2Score})`)
      
      history.push({p1: p1Action, p2: p2Action})
      setGameHistory([...history])
      setCurrentRound(i + 1)
      setProgress((i + 1) / rounds)
      
      // Update player scores in real-time
      setPlayers(prev => [
        { ...prev[0], score: p1Score },
        { ...prev[1], score: p2Score }
      ])
      
      // Add delay for animation
      await new Promise(resolve => setTimeout(resolve, Math.max(10, 200 / animationSpeed)))
    }
    
    // Ensure final state is set if simulation completed naturally
    if (runningRef.current && history.length === rounds) {
      console.log('Simulation completed all', rounds, 'rounds. Final scores: P1=', p1Score, 'P2=', p2Score)
      setRunning(false)
      runningRef.current = false
      setIsAnimating(false)
      playSound('win')
    }
  }

  const getStrategyAction = (strategy: StrategyId, round: number, opponentHistory: string[]): string => {
    // Use round number as seed for pseudo-random decisions to ensure deterministic behavior
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
    
    switch (strategy) {
      case 'AlwaysCooperate':
        return 'C'
      case 'AlwaysDefect':
        return 'D'
      case 'TitForTat':
        return round === 0 ? 'C' : (opponentHistory[round - 1] || 'C')
      case 'TitForTwoTat':
        if (round < 2) return 'C'
        const lastTwo = opponentHistory.slice(-2)
        return lastTwo.filter(a => a === 'D').length >= 2 ? 'D' : 'C'
      case 'Joss':
        const tftAction = round === 0 ? 'C' : (opponentHistory[round - 1] || 'C')
        return pseudoRandom(round + 12345) < 0.1 ? 'D' : tftAction
      case 'Random':
        return pseudoRandom(round + 54321) < 0.5 ? 'C' : 'D'
      case 'Pavlov':
        if (round === 0) return 'C'
        const lastOpp = opponentHistory[round - 1]
        const lastSelf = round === 1 ? 'C' : (round % 2 === 0 ? 'C' : 'D') // Simplified
        return lastOpp === lastSelf ? lastSelf : (lastSelf === 'C' ? 'D' : 'C')
      case 'Grudger':
      case 'Friedman':
        return opponentHistory.includes('D') ? 'D' : 'C'
      default:
        return 'C'
    }
  }

  const getStrategyActionWithRng = (strategy: StrategyId, round: number, opponentHistory: string[], rng: any): string => {
    switch (strategy) {
      case 'AlwaysCooperate':
        return 'C'
      case 'AlwaysDefect':
        return 'D'
      case 'TitForTat':
        return round === 0 ? 'C' : (opponentHistory[round - 1] || 'C')
      case 'TitForTwoTat':
        if (round < 2) return 'C'
        const lastTwo = opponentHistory.slice(-2)
        return lastTwo.filter(a => a === 'D').length >= 2 ? 'D' : 'C'
      case 'Joss':
        const tftAction = round === 0 ? 'C' : (opponentHistory[round - 1] || 'C')
        return rng.next() < 0.1 ? 'D' : tftAction
      case 'Random':
        return rng.next() < 0.5 ? 'C' : 'D'
      case 'Pavlov':
        if (round === 0) return 'C'
        const lastOpp = opponentHistory[round - 1]
        const lastSelf = round === 1 ? 'C' : (round % 2 === 0 ? 'C' : 'D') // Simplified
        return lastOpp === lastSelf ? lastSelf : (lastSelf === 'C' ? 'D' : 'C')
      case 'Grudger':
      case 'Friedman':
        return opponentHistory.includes('D') ? 'D' : 'C'
      default:
        return 'C'
    }
  }

  const stop = () => {
    setRunning(false)
    runningRef.current = false
    setIsAnimating(false)
    workerRef.current?.terminate()
    workerRef.current = null
  }

  const reset = () => {
    setProgress(0)
    setCurrentRound(0)
    setGameHistory([])
    setLeaderboard([])
    clearResults()
    // Only reinitialize players if not currently running
    if (!runningRef.current) {
      initializePlayers()
    }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gaming-style battle effects during simulation */}
      {running && (
        <>
          {/* Pulsing battle aura */}
          <div className="absolute -inset-4 bg-gradient-to-r from-red-500/10 via-yellow-500/10 to-blue-500/10 rounded-3xl blur-2xl animate-pulse pointer-events-none" />
          
          {/* Animated corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-yellow-400 animate-pulse" />
          <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-yellow-400 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-yellow-400 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-yellow-400 animate-pulse" />
          
          {/* Energy particles */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                opacity: 0 
              }}
              animate={{
                x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </>
      )}
      {/* Left Panel - Tournament Control */}
      <motion.div 
        className="xl:col-span-1 space-y-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Card className="shadow-2xl border-2 border-blue-500/20 dark:border-blue-500/30 bg-gradient-to-br from-slate-50/90 via-blue-50/50 to-purple-50/90 dark:from-slate-900/90 dark:via-blue-900/50 dark:to-purple-900/90 backdrop-blur-xl">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-b border-blue-400/20 dark:border-blue-400/30">
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-white">
              <motion.div
                animate={running ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 2, repeat: running ? Infinity : 0, ease: "linear" }}
              >
                <Settings className="w-5 h-5 text-blue-400" />
              </motion.div>
              <span className="font-black tracking-wide">BATTLE CONTROL</span>
              {running && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-red-400">LIVE</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Tournament Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={tournamentMode === 'single' ? 'default' : 'outline'}
                  onClick={() => setTournamentMode('single')}
                  className="h-12"
                >
                  <Users className="w-4 h-4 mr-2" />
                  1v1 Match
                </Button>
                <Button
                  variant={tournamentMode === 'tournament' ? 'default' : 'outline'}
                  onClick={() => setTournamentMode('tournament')}
                  className="h-12"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Full Tournament
                </Button>
              </div>
            </div>

            <Separator />

            {/* Player Selection (Single Mode) */}
            {tournamentMode === 'single' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Player 1</Label>
                  <Select value={selectedPlayer1} onValueChange={(value) => setSelectedPlayer1(value as StrategyId)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(strategyInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{info.emoji}</span>
                            <div className={`w-3 h-3 rounded-full ${info.color}`} />
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Player 2</Label>
                  <Select value={selectedPlayer2} onValueChange={(value) => setSelectedPlayer2(value as StrategyId)}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(strategyInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{info.emoji}</span>
                            <div className={`w-3 h-3 rounded-full ${info.color}`} />
                            <span>{info.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            {/* Game Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Number of Rounds</Label>
                <Input 
                  type="number" 
                  value={rounds} 
                  onChange={(e) => setRounds(parseInt(e.target.value) || 100)}
                  min="10"
                  max="1000"
                  className="h-10"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold">
                  Animation Speed: {animationSpeed}x
                </Label>
                <Slider 
                  value={[animationSpeed]} 
                  onValueChange={(value) => setAnimationSpeed(value[0])}
                  max={10}
                  min={0.5}
                  step={0.5}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="text-sm font-semibold">Sound Effects</Label>
                <div className="flex items-center space-x-2">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <Switch 
                    id="sound"
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Control Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={start} 
                disabled={running || !supportsWorker}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                <Play className="w-5 h-5 mr-2" />
                {tournamentMode === 'single' ? 'Start Match' : 'Start Tournament'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="secondary" 
                  onClick={stop} 
                  disabled={!running}
                  className="h-10"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                <Button 
                  variant="outline" 
                  onClick={reset}
                  className="h-10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Progress */}
            <AnimatePresence>
              {running && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Round {currentRound} of {rounds}</span>
                    <span className="text-sm font-medium">{(progress * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={progress * 100} className="h-3" />
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Activity className="w-4 h-4 animate-pulse" />
                    {isAnimating ? 'Simulating...' : 'Processing results...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Panel - Game Visualization */}
      <motion.div 
        className="xl:col-span-2 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Game Arena */}
        <Card className="shadow-2xl border-2 border-orange-500/20 dark:border-orange-500/30 bg-gradient-to-br from-slate-50/90 via-orange-50/30 to-red-50/50 dark:from-slate-900/90 dark:via-orange-900/30 dark:to-red-900/50 backdrop-blur-xl relative overflow-hidden">
          {/* Dynamic battle background effects */}
          {running && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/3 via-red-500/5 to-yellow-500/3 dark:from-orange-500/5 dark:via-red-500/10 dark:to-yellow-500/5 animate-pulse" />
              <motion.div 
                className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </>
          )}
          
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border-b border-orange-400/20 dark:border-orange-400/30 relative">
            <CardTitle className="flex items-center justify-between text-slate-800 dark:text-white">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={running ? { 
                    rotate: [0, 15, -15, 0],
                    scale: [1, 1.1, 1] 
                  } : {}}
                  transition={{ duration: 1, repeat: running ? Infinity : 0 }}
                >
                  <Zap className="w-5 h-5 text-orange-400" />
                </motion.div>
                <span className="font-black tracking-wide">
                  {tournamentMode === 'single' ? 'BATTLE ARENA' : 'TOURNAMENT ARENA'}
                </span>
              </div>
              {running && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Badge variant="default" className="bg-red-600/80 text-white border border-red-400/50">
                    <Timer className="w-3 h-3 mr-1 animate-spin" />
                    LIVE BATTLE
                  </Badge>
                </motion.div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {tournamentMode === 'single' ? (
              // Single Match View
              <div className="space-y-8">
                {/* Players Display */}
                <div className="grid grid-cols-3 gap-8 items-center">
                  {/* Player 1 - Enhanced Gaming Style */}
                  <motion.div 
                    className="text-center space-y-3 relative"
                    animate={{ 
                      scale: players[0]?.score > players[1]?.score ? 1.05 : 1,
                      y: running ? [0, -2, 0] : 0
                    }}
                    transition={{ duration: 2, repeat: running ? Infinity : 0 }}
                  >
                    <div className="relative">
                      {/* Glowing aura when winning */}
                      {players[0]?.score > players[1]?.score && (
                        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl animate-pulse" />
                      )}
                      
                      {/* Player Avatar with Battle Effects */}
                      <motion.div 
                        className={`w-20 h-20 mx-auto rounded-full ${strategyInfo[selectedPlayer1].color} flex items-center justify-center text-white text-2xl font-bold shadow-2xl border-2 border-blue-300/50 relative overflow-hidden`}
                        animate={running ? { 
                          boxShadow: ['0 0 20px rgba(59,130,246,0.5)', '0 0 40px rgba(59,130,246,0.8)', '0 0 20px rgba(59,130,246,0.5)']
                        } : {}}
                        transition={{ duration: 1.5, repeat: running ? Infinity : 0 }}
                      >
                        {strategyInfo[selectedPlayer1].emoji}
                        
                        {/* Energy ripple effect */}
                        {running && (
                          <motion.div
                            className="absolute inset-0 border-2 border-blue-300 rounded-full"
                            animate={{ scale: [1, 1.3], opacity: [0.7, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </motion.div>
                      
                      {/* Winner Crown with Enhanced Animation */}
                      {players[0]?.score > players[1]?.score && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ 
                            scale: 1,
                            rotate: 360
                          }}
                          transition={{ 
                            scale: { duration: 0.3 },
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                          }}
                          className="absolute -top-2 -right-2"
                        >
                          <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                        </motion.div>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{strategyInfo[selectedPlayer1].name}</h3>
                    
                    {/* Enhanced Score Display */}
                    <motion.div 
                      className="space-y-1"
                      animate={running ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ duration: 0.5, repeat: running ? Infinity : 0 }}
                    >
                      <p className="text-3xl font-black text-blue-600 dark:text-blue-400 drop-shadow-lg">
                        {players[0]?.score || 0}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300 font-medium uppercase tracking-wider">POINTS</p>
                    </motion.div>
                  </motion.div>

                  {/* VS - Enhanced Gaming Style */}
                  <div className="text-center relative">
                    {/* Battle energy effects */}
                    {running && (
                      <>
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-yellow-500/30 to-red-500/20 rounded-full blur-xl"
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div 
                          className="absolute inset-0 border-2 border-yellow-400/50 rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </>
                    )}
                    
                    <motion.div 
                      className="relative text-5xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-orange-500 dark:from-red-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent drop-shadow-2xl"
                      animate={{ 
                        rotate: isAnimating ? 360 : 0,
                        scale: running ? [1, 1.1, 1] : 1
                      }}
                      transition={{ 
                        rotate: { duration: 2, repeat: isAnimating ? Infinity : 0, ease: "linear" },
                        scale: { duration: 1, repeat: running ? Infinity : 0 }
                      }}
                    >
                      VS
                    </motion.div>
                    
                    {/* Lightning bolts */}
                    {running && (
                      <>
                        <motion.div
                          className="absolute -top-2 -left-2 text-yellow-400 text-lg"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                        >
                          ⚡
                        </motion.div>
                        <motion.div
                          className="absolute -bottom-2 -right-2 text-yellow-400 text-lg"
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
                        >
                          ⚡
                        </motion.div>
                      </>
                    )}
                  </div>

                  {/* Player 2 */}
                  <motion.div 
                    className="text-center space-y-3"
                    animate={{ scale: players[1]?.score > players[0]?.score ? 1.05 : 1 }}
                  >
                    <div className="relative">
                      <div className={`w-20 h-20 mx-auto rounded-full ${strategyInfo[selectedPlayer2].color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {strategyInfo[selectedPlayer2].emoji}
                      </div>
                      {players[1]?.score > players[0]?.score && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2"
                        >
                          <Crown className="w-8 h-8 text-yellow-500" />
                        </motion.div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{strategyInfo[selectedPlayer2].name}</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-500">{players[1]?.score || 0}</p>
                      <p className="text-sm text-slate-600 dark:text-muted-foreground">points</p>
                    </div>
                  </motion.div>
                </div>

                <Separator />

                {/* Payoff Matrix */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Payoff Matrix
                  </h4>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {/* Header row */}
                      <div></div>
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg border-2 border-green-300 dark:border-green-700">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">C</div>
                          <span className="font-semibold text-green-700 dark:text-green-300">Cooperate</span>
                        </div>
                      </div>
                      <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg border-2 border-red-300 dark:border-red-700">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">D</div>
                          <span className="font-semibold text-red-700 dark:text-red-300">Defect</span>
                        </div>
                      </div>

                      {/* Cooperate row */}
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg border-2 border-green-300 dark:border-green-700">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">C</div>
                          <span className="font-semibold text-green-700 dark:text-green-300">Cooperate</span>
                        </div>
                      </div>
                      <motion.div 
                        className="bg-green-200 dark:bg-green-800 p-4 rounded-lg border-3 border-green-400 dark:border-green-600 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {config.payoffs.R}, {config.payoffs.R}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">Reward</div>
                      </motion.div>
                      <motion.div 
                        className="bg-yellow-200 dark:bg-yellow-800 p-4 rounded-lg border-3 border-yellow-400 dark:border-yellow-600 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                          {config.payoffs.S}, {config.payoffs.T}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Sucker, Temptation</div>
                      </motion.div>

                      {/* Defect row */}
                      <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg border-2 border-red-300 dark:border-red-700">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-bold">D</div>
                          <span className="font-semibold text-red-700 dark:text-red-300">Defect</span>
                        </div>
                      </div>
                      <motion.div 
                        className="bg-yellow-200 dark:bg-yellow-800 p-4 rounded-lg border-3 border-yellow-400 dark:border-yellow-600 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                          {config.payoffs.T}, {config.payoffs.S}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Temptation, Sucker</div>
                      </motion.div>
                      <motion.div 
                        className="bg-red-200 dark:bg-red-800 p-4 rounded-lg border-3 border-red-400 dark:border-red-600 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-bold text-red-800 dark:text-red-200">
                          {config.payoffs.P}, {config.payoffs.P}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">Punishment</div>
                      </motion.div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg border border-blue-300 dark:border-blue-700">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Payoff Legend:</h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-blue-700 dark:text-blue-300">
                          <strong>T:</strong> Temptation to defect ({config.payoffs.T})
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          <strong>R:</strong> Reward for cooperation ({config.payoffs.R})
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          <strong>P:</strong> Punishment for mutual defection ({config.payoffs.P})
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">
                          <strong>S:</strong> Sucker's payoff ({config.payoffs.S})
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                        Constraint: T &gt; R &gt; P &gt; S and 2R &gt; T + S
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Separator />

                {/* Game History */}
                <AnimatePresence>
                  {gameHistory.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Game History
                      </h4>
                      
                      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="space-y-4">
                          {/* Legend */}
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">All Rounds ({currentRound} / {rounds})</span>
                            <div className="flex gap-4 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Cooperate (C)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                                <span>Defect (D)</span>
                              </div>
                            </div>
                          </div>

                          {/* Player 1 Row */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
                              Player 1: {strategyInfo[selectedPlayer1].emoji} {strategyInfo[selectedPlayer1].name}
                            </div>
                            <div className="flex flex-wrap gap-1 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg min-h-[60px]">
                              {gameHistory.map((round, i) => (
                                <motion.div
                                  key={`p1-${i}`}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ 
                                    delay: i * 0.005,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                  }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                                    round.p1 === 'C' 
                                      ? 'bg-green-500' 
                                      : 'bg-orange-500'
                                  }`}
                                  title={`Round ${i + 1}: ${round.p1 === 'C' ? 'Cooperate' : 'Defect'}`}
                                >
                                  {round.p1}
                                </motion.div>
                              ))}
                              {/* Empty slots for remaining rounds */}
                              {Array.from({ length: rounds - gameHistory.length }, (_, i) => (
                                <div
                                  key={`p1-empty-${i}`}
                                  className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400"
                                >
                                  ?
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Player 2 Row */}
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2">
                              Player 2: {strategyInfo[selectedPlayer2].emoji} {strategyInfo[selectedPlayer2].name}
                            </div>
                            <div className="flex flex-wrap gap-1 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg min-h-[60px]">
                              {gameHistory.map((round, i) => (
                                <motion.div
                                  key={`p2-${i}`}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ 
                                    delay: i * 0.005,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                  }}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                                    round.p2 === 'C' 
                                      ? 'bg-green-500' 
                                      : 'bg-orange-500'
                                  }`}
                                  title={`Round ${i + 1}: ${round.p2 === 'C' ? 'Cooperate' : 'Defect'}`}
                                >
                                  {round.p2}
                                </motion.div>
                              ))}
                              {/* Empty slots for remaining rounds */}
                              {Array.from({ length: rounds - gameHistory.length }, (_, i) => (
                                <div
                                  key={`p2-empty-${i}`}
                                  className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs text-gray-400"
                                >
                                  ?
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Progress indicator */}
                          <div className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
                            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(gameHistory.length / rounds) * 100}%` }}
                              ></div>
                            </div>
                            <span>
                              {gameHistory.length} / {rounds} ({((gameHistory.length / rounds) * 100).toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Real-time Statistics */}
                      {gameHistory.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-lg border border-indigo-200 dark:border-indigo-800"
                        >
                          <h5 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Live Statistics
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-indigo-600 dark:text-indigo-400">P1 Cooperation:</span>
                                <span className="font-semibold">
                                  {((gameHistory.filter(h => h.p1 === 'C').length / gameHistory.length) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-indigo-600 dark:text-indigo-400">P2 Cooperation:</span>
                                <span className="font-semibold">
                                  {((gameHistory.filter(h => h.p2 === 'C').length / gameHistory.length) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-indigo-600 dark:text-indigo-400">Mutual Coop:</span>
                                <span className="font-semibold">
                                  {((gameHistory.filter(h => h.p1 === 'C' && h.p2 === 'C').length / gameHistory.length) * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-indigo-600 dark:text-indigo-400">Mutual Defect:</span>
                                <span className="font-semibold">
                                  {((gameHistory.filter(h => h.p1 === 'D' && h.p2 === 'D').length / gameHistory.length) * 100).toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              // Tournament View
              <div className="text-center space-y-6">
                <div className="text-6xl">🏆</div>
                <h3 className="text-2xl font-bold">Full Tournament Mode</h3>
                <p className="text-muted-foreground">
                  All {Object.keys(strategyInfo).length} strategies competing in a round-robin tournament
                </p>
                {isAnimating && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto border-4 border-blue-500 border-t-transparent rounded-full"
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Right Panel - Leaderboard */}
      <motion.div 
        className="xl:col-span-1 space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-xl border-2">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border-2 ${
                      index === 0 
                        ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300 dark:from-yellow-900 dark:to-orange-900' 
                        : index === 1
                        ? 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-300 dark:from-gray-900 dark:to-slate-900'
                        : index === 2
                        ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-300 dark:from-orange-900 dark:to-red-900'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`text-xl font-bold ${
                          index === 0 ? 'text-yellow-600' : 
                          index === 1 ? 'text-gray-600' :
                          index === 2 ? 'text-orange-600' : 'text-gray-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{strategyInfo[player.strategy].emoji}</span>
                            <span className="font-semibold text-sm">{player.name}</span>
                            {player.isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Score: {player.score} | Trust: {player.trust.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No results yet</p>
                <p className="text-sm">Start a simulation to see rankings</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Strategy Info */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Strategy Info
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {tournamentMode === 'single' ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{strategyInfo[selectedPlayer1].emoji}</span>
                    <span className="font-semibold">{strategyInfo[selectedPlayer1].name}</span>
                    <div className="flex gap-1">
                      <Badge variant={strategyInfo[selectedPlayer1].nice ? "default" : "destructive"} className="text-xs">
                        {strategyInfo[selectedPlayer1].nice ? "Nice" : "Nasty"}
                      </Badge>
                      <Badge variant={strategyInfo[selectedPlayer1].forgiving ? "default" : "secondary"} className="text-xs">
                        {strategyInfo[selectedPlayer1].forgiving ? "Forgiving" : "Unforgiving"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{strategyInfo[selectedPlayer1].description}</p>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{strategyInfo[selectedPlayer2].emoji}</span>
                    <span className="font-semibold">{strategyInfo[selectedPlayer2].name}</span>
                    <div className="flex gap-1">
                      <Badge variant={strategyInfo[selectedPlayer2].nice ? "default" : "destructive"} className="text-xs">
                        {strategyInfo[selectedPlayer2].nice ? "Nice" : "Nasty"}
                      </Badge>
                      <Badge variant={strategyInfo[selectedPlayer2].forgiving ? "default" : "secondary"} className="text-xs">
                        {strategyInfo[selectedPlayer2].forgiving ? "Forgiving" : "Unforgiving"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{strategyInfo[selectedPlayer2].description}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Tournament includes all {Object.keys(strategyInfo).length} strategies:
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {Object.entries(strategyInfo).map(([key, info]) => (
                    <div key={key} className="text-center p-1">
                      <div className="text-sm">{info.emoji}</div>
                      <div className="text-xs text-muted-foreground">{info.name.split(' ')[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
