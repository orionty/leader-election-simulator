"use client";
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { BookOpen, Github, ExternalLink, Users, Target, Zap, Shield, Trophy, Clock } from 'lucide-react'

export function AboutTab() {
  const features = [
    {
      icon: Users,
      title: "9 Classic Strategies",
      description: "Implements all major IPD strategies from Axelrod's tournaments including Tit-for-Tat, Grudger, and Pavlov."
    },
    {
      icon: Target,
      title: "Deterministic Simulation",
      description: "Seeded random number generation ensures reproducible results for scientific research."
    },
    {
      icon: Zap,
      title: "VRF-based Election",
      description: "Uses cryptographic hash functions to simulate verifiable random functions for tie-breaking."
    },
    {
      icon: Shield,
      title: "Trust & Incentives",
      description: "Models trust scores and blacklisting mechanisms inspired by blockchain consensus."
    },
    {
      icon: Trophy,
      title: "Tournament Analysis",
      description: "Comprehensive analytics with cooperation rates, score distributions, and strategy performance."
    },
    {
      icon: Clock,
      title: "RAFT Comparison",
      description: "Side-by-side latency analysis comparing game-theoretic vs traditional consensus algorithms."
    }
  ]

  const strategies = [
    { name: "Tit For Tat", type: "Nice, Forgiving", description: "Cooperates first, then mirrors opponent's last move" },
    { name: "Tit For Two Tats", type: "Nice, Forgiving", description: "Defects only after opponent defects twice in a row" },
    { name: "Always Cooperate", type: "Nice, Forgiving", description: "Always cooperates regardless of opponent" },
    { name: "Always Defect", type: "Nasty, Unforgiving", description: "Always defects regardless of opponent" },
    { name: "Random", type: "Nasty, Forgiving", description: "Randomly cooperates or defects each round" },
    { name: "Joss", type: "Nasty, Unforgiving", description: "Tit-for-Tat with 10% random defection" },
    { name: "Pavlov", type: "Nice, Forgiving", description: "Win-Stay, Lose-Shift strategy" },
    { name: "Grudger", type: "Nice, Unforgiving", description: "Cooperates until opponent defects once, then defects forever" },
    { name: "Friedman", type: "Nice, Unforgiving", description: "Cooperates until opponent defects, then permanent retaliation" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Game-Theoretic Leader Election Simulator
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A research-grade simulation platform combining Axelrod-style Iterated Prisoner's Dilemma 
          tournaments with blockchain-inspired leader election and incentive mechanisms.
        </p>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex flex-col items-start space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <feature.icon className="w-8 h-8 text-blue-600" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Methodology
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Tournament Phase</h4>
                  <p className="text-sm text-muted-foreground">
                    Players are assigned strategies and compete in round-robin Iterated Prisoner's Dilemma 
                    matches with configurable horizon H, continuation probability w, and noise level ε.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">2. Leader Election</h4>
                  <p className="text-sm text-muted-foreground">
                    The player with the highest total score becomes leader. Ties are broken using a 
                    simulated Verifiable Random Function (VRF) based on cryptographic hashing.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">3. Trust & Incentives</h4>
                  <p className="text-sm text-muted-foreground">
                    Leaders earn trust (+0.001 per honest completion, capped at 10.0). Dishonest behavior 
                    resets trust and decrements trustLife. When trustLife reaches 0, the player is blacklisted.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">4. Payoff Calculation</h4>
                  <p className="text-sm text-muted-foreground">
                    Leader incentive = trust × allocated_leader_incentive. This creates economic incentives 
                    for honest behavior and long-term cooperation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-lg h-full">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6" />
                Payoff Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The simulation uses the standard Prisoner's Dilemma payoff structure:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div></div>
                    <div className="font-semibold text-green-600">Cooperate</div>
                    <div className="font-semibold text-red-600">Defect</div>
                    <div className="font-semibold text-blue-600">Cooperate</div>
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded font-bold">R, R (3, 3)</div>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded font-bold">S, T (0, 5)</div>
                    <div className="font-semibold text-blue-600">Defect</div>
                    <div className="bg-yellow-100 dark:bg-yellow-900 p-2 rounded font-bold">T, S (5, 0)</div>
                    <div className="bg-red-100 dark:bg-red-900 p-2 rounded font-bold">P, P (1, 1)</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><strong>T (Temptation):</strong> 5 points - Reward for defecting against a cooperator</p>
                  <p><strong>R (Reward):</strong> 3 points - Mutual cooperation payoff</p>
                  <p><strong>P (Punishment):</strong> 1 point - Mutual defection payoff</p>
                  <p><strong>S (Sucker):</strong> 0 points - Penalty for cooperating against a defector</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm font-medium">Constraints:</p>
                  <p className="text-xs text-muted-foreground">T &gt; R &gt; P &gt; S and 2R &gt; T + S</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Strategy Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Strategy Reference
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {strategies.map((strategy, index) => (
                <motion.div
                  key={strategy.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{strategy.name}</h4>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                  <Badge variant={strategy.type.includes('Nice') ? 'default' : 'destructive'}>
                    {strategy.type}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Research & References */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
            <CardTitle className="flex items-center gap-2">
              <Github className="w-6 h-6" />
              Research & Development
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Key References</h4>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium">Axelrod, R. (1984)</h5>
                    <p className="text-sm text-muted-foreground">
                      "The Evolution of Cooperation" - Foundational work on IPD tournaments
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium">Ongaro & Ousterhout (2014)</h5>
                    <p className="text-sm text-muted-foreground">
                      "In Search of an Understandable Consensus Algorithm" - RAFT consensus
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium">Micali et al. (1999)</h5>
                    <p className="text-sm text-muted-foreground">
                      "Verifiable Random Functions" - Cryptographic foundations
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Technical Implementation</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm">Framework</span>
                    <Badge>Next.js 14</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm">UI Components</span>
                    <Badge>shadcn/ui</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm">Charts</span>
                    <Badge>Recharts</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm">Animations</span>
                    <Badge>Framer Motion</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <span className="text-sm">RNG</span>
                    <Badge>pure-rand</Badge>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Github className="w-4 h-4" />
                    View Source
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-8"
      >
        <Separator className="mb-6" />
        <p className="text-sm text-muted-foreground">
          Built for research and educational purposes. All simulations use deterministic, 
          reproducible algorithms to ensure scientific validity.
        </p>
      </motion.div>
    </motion.div>
  )
}
