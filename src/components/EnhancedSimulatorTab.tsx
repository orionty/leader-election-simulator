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
import { Play, Square, RotateCcw, Settings, Trophy, Users, Target } from 'lucide-react'
import { useSimStore } from '@/state/useSimStore'
import type { StrategyId } from '@/types'

const strategyInfo = {
  TitForTat: { 
    name: 'Tit For Tat', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and then copies what the opponent did in the last move',
    color: 'bg-blue-500'
  },
  TitForTwoTat: { 
    name: 'Tit For Two Tats', 
    nice: true, 
    forgiving: true,
    description: 'Starts by cooperating and defects only after the opponent has defected twice in a row',
    color: 'bg-indigo-500'
  },
  AlwaysCooperate: { 
    name: 'Always Cooperate', 
    nice: true, 
    forgiving: true,
    description: 'Always cooperates regardless of what the opponent does',
    color: 'bg-green-500'
  },
  AlwaysDefect: { 
    name: 'Always Defect', 
    nice: false, 
    forgiving: false,
    description: 'Always defects regardless of what the opponent does',
    color: 'bg-red-500'
  },
  Random: { 
    name: 'Random', 
    nice: false, 
    forgiving: true,
    description: 'Randomly cooperates or defects in each round',
    color: 'bg-purple-500'
  },
  Joss: { 
    name: 'Joss', 
    nice: false, 
    forgiving: false,
    description: 'Starts by cooperating and then starts copying what the other player did on the last move. 10% of the time defects regardless',
    color: 'bg-orange-500'
  },
  Pavlov: { 
    name: 'Pavlov', 
    nice: true, 
    forgiving: true,
    description: 'Win-Stay, Lose-Shift strategy',
    color: 'bg-cyan-500'
  },
  Grudger: { 
    name: 'Grudger', 
    nice: true, 
    forgiving: false,
    description: 'Cooperates until the opponent defects, then defects forever',
    color: 'bg-yellow-600'
  },
  Friedman: { 
    name: 'Friedman', 
    nice: true, 
    forgiving: false,
    description: 'Starts by cooperating but if the opponent defects just once, it will keep defecting for the remainder of the game',
    color: 'bg-pink-500'
  },
}

export function EnhancedSimulatorTab() {
  const { config, running, progress, setProgress, setRunning, pushResult, results, clearResults } = useSimStore()
  const workerRef = useRef<Worker | null>(null)
  const [supportsWorker, setSupportsWorker] = useState(false)
  const [selectedPlayer1, setSelectedPlayer1] = useState<StrategyId>('Joss')
  const [selectedPlayer2, setSelectedPlayer2] = useState<StrategyId>('Grudger')
  const [rounds, setRounds] = useState(100)
  const [delay, setDelay] = useState([50])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [currentRound, setCurrentRound] = useState(0)
  const [gameHistory, setGameHistory] = useState<Array<{p1: string, p2: string}>>([])
  const [scores, setScores] = useState({p1: 0, p2: 0})
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setSupportsWorker(typeof window !== 'undefined' && 'Worker' in window)
  }, [])

  const start = async () => {
    if (!supportsWorker) return
    clearResults()
    setRunning(true)
    setProgress(0)
    setCurrentRound(0)
    setGameHistory([])
    setScores({p1: 0, p2: 0})
    setIsAnimating(true)

    // Create a proper tournament configuration
    const tournamentConfig = {
      ...config,
      H: rounds,
      strategies: {
        [selectedPlayer1]: 0.5,
        [selectedPlayer2]: 0.5,
      },
      players: 2,
    }

    // Use Web Worker for actual simulation
    const w = new Worker(new URL('../workers/simWorker.ts', import.meta.url), { type: 'module' })
    workerRef.current = w
    
    w.onmessage = (ev: MessageEvent) => {
      const data = ev.data
      if (data?.type === 'tick') {
        setProgress(data.progress)
        setCurrentRound(Math.floor(data.progress * rounds))
      } else if (data?.type === 'done') {
        pushResult(data.result)
        setRunning(false)
        setIsAnimating(false)
        
        // Extract match data for visualization
        if (data.result.matches && data.result.matches.length > 0) {
          const match = data.result.matches[0]
          setScores({
            p1: match.scoreA,
            p2: match.scoreB
          })
        }
      }
    }

    // Simulate the game with animations while worker runs
    const history = []
    let p1Score = 0
    let p2Score = 0
    
    for (let i = 0; i < rounds && running; i++) {
      await new Promise(resolve => setTimeout(resolve, Math.max(50, 1000 / animationSpeed)))
      
      const p1Action = (i + selectedPlayer1.length) % 3 === 0 ? 'D' : 'C'
      const p2Action = (i + selectedPlayer2.length) % 4 === 0 ? 'D' : 'C'
      
      // Calculate scores based on payoff matrix
      if (p1Action === 'C' && p2Action === 'C') {
        p1Score += 3; p2Score += 3
      } else if (p1Action === 'C' && p2Action === 'D') {
        p1Score += 0; p2Score += 5
      } else if (p1Action === 'D' && p2Action === 'C') {
        p1Score += 5; p2Score += 0
      } else {
        p1Score += 1; p2Score += 1
      }
      
      history.push({p1: p1Action, p2: p2Action})
      setGameHistory([...history])
      setCurrentRound(i + 1)
      
      if (!running) break
    }

    // Send to worker
    w.postMessage({ type: 'run', config: tournamentConfig })
  }

  const stop = () => {
    workerRef.current?.terminate()
    workerRef.current = null
    setRunning(false)
    setIsAnimating(false)
  }

  const reset = () => {
    setProgress(0)
    setCurrentRound(0)
    setGameHistory([])
    setScores({p1: 0, p2: 0})
    clearResults()
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Left Panel - Strategies */}
      <motion.div className="space-y-6" variants={itemVariants}>
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <AnimatePresence>
              {Object.entries(strategyInfo).map(([key, info], index) => (
                <motion.div 
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    (selectedPlayer1 === key || selectedPlayer2 === key) 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-4 h-4 rounded-full ${info.color}`} />
                    <span className="font-semibold text-lg">{info.name}</span>
                    <div className="flex gap-2 ml-auto">
                      <Badge variant={info.nice ? "default" : "destructive"} className="text-xs">
                        {info.nice ? "Nice" : "Nasty"}
                      </Badge>
                      <Badge variant={info.forgiving ? "default" : "secondary"} className="text-xs">
                        {info.forgiving ? "Forgiving" : "Unforgiving"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Payoff Matrix */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Payoff Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div></div>
                <div className="font-semibold bg-green-100 p-2 rounded">Cooperate</div>
                <div className="font-semibold bg-red-100 p-2 rounded">Defect</div>
                <div className="font-semibold bg-blue-100 p-2 rounded">Cooperate</div>
                <div className="bg-green-200 p-3 rounded font-bold">3, 3</div>
                <div className="bg-yellow-200 p-3 rounded font-bold">0, 5</div>
                <div className="font-semibold bg-blue-100 p-2 rounded">Defect</div>
                <div className="bg-yellow-200 p-3 rounded font-bold">5, 0</div>
                <div className="bg-red-200 p-3 rounded font-bold">1, 1</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Right Panel - Matchup and Controls */}
      <motion.div className="lg:col-span-2 space-y-6" variants={itemVariants}>
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Tournament Matchup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {/* Player Selection with Animation */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  Player 1 - Score: {scores.p1}
                  {scores.p1 > scores.p2 && currentRound > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-yellow-500"
                    >
                      👑
                    </motion.div>
                  )}
                </Label>
                <Select value={selectedPlayer1} onValueChange={(value) => setSelectedPlayer1(value as StrategyId)}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(strategyInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-lg py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${info.color}`} />
                          {info.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-center">
                <motion.div 
                  className="text-3xl font-bold text-muted-foreground"
                  animate={{ rotate: isAnimating ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isAnimating ? Infinity : 0, ease: "linear" }}
                >
                  VS
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  Player 2 - Score: {scores.p2}
                  {scores.p2 > scores.p1 && currentRound > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-yellow-500"
                    >
                      👑
                    </motion.div>
                  )}
                </Label>
                <Select value={selectedPlayer2} onValueChange={(value) => setSelectedPlayer2(value as StrategyId)}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(strategyInfo).map(([key, info]) => (
                      <SelectItem key={key} value={key} className="text-lg py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${info.color}`} />
                          {info.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            <Separator />

            {/* Game Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of rounds</Label>
                  <Input 
                    type="number" 
                    value={rounds} 
                    onChange={(e) => setRounds(parseInt(e.target.value) || 100)}
                    className="w-full"
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Animation Speed: {animationSpeed}x</Label>
                  <Slider 
                    value={[animationSpeed]} 
                    onValueChange={(value) => setAnimationSpeed(value[0])}
                    max={5}
                    min={0.5}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="advanced-mode" 
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                  <Label htmlFor="advanced-mode">Advanced Settings</Label>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
                    >
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Noise Level</Label>
                        <Slider defaultValue={[1]} max={10} step={1} />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Continuation Probability</Label>
                        <Slider defaultValue={[98]} max={100} step={1} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Progress and Controls */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button 
                  onClick={start} 
                  disabled={running || !supportsWorker}
                  className="flex items-center gap-2 px-6 py-3 text-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5" />
                  Start Tournament
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={stop} 
                  disabled={!running}
                  className="flex items-center gap-2 px-6 py-3 text-lg"
                  size="lg"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </Button>
                <Button 
                  variant="outline" 
                  onClick={reset}
                  className="flex items-center gap-2 px-6 py-3 text-lg"
                  size="lg"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reset
                </Button>
              </div>

              {running && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between text-sm font-medium">
                    <span>Round {currentRound} of {rounds}</span>
                    <span>{(progress * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={progress * 100} className="h-3" />
                </motion.div>
              )}
            </div>

            {/* Game History Visualization */}
            <AnimatePresence>
              {gameHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <Separator />
                  <h3 className="text-lg font-semibold">Game History</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-20">Player 1:</span>
                      <div className="flex flex-wrap gap-1">
                        {gameHistory.slice(-30).map((round, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`w-8 h-8 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-md ${
                              round.p1 === 'C' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {round.p1}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium w-20">Player 2:</span>
                      <div className="flex flex-wrap gap-1">
                        {gameHistory.slice(-30).map((round, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={`w-8 h-8 rounded-full text-xs flex items-center justify-center text-white font-bold shadow-md ${
                              round.p2 === 'C' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          >
                            {round.p2}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {gameHistory.length > 30 && (
                    <p className="text-sm text-muted-foreground">
                      Showing last 30 rounds of {gameHistory.length} total
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
