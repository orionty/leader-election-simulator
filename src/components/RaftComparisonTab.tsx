"use client";
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts'
import { Zap, Network, Clock, Play, Settings, TrendingUp, Activity } from 'lucide-react'

export function RaftComparisonTab() {
  const [nodes, setNodes] = useState(5)
  const [networkDelay, setNetworkDelay] = useState([50])
  const [dropRate, setDropRate] = useState([5])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  // Mock comparison data
  const comparisonData = [
    { metric: 'Average Latency (ms)', gameTheoretic: 45, raft: 120 },
    { metric: 'P95 Latency (ms)', gameTheoretic: 78, raft: 250 },
    { metric: 'P99 Latency (ms)', gameTheoretic: 95, raft: 450 },
    { metric: 'Throughput (elections/sec)', gameTheoretic: 22, raft: 8 },
    { metric: 'Network Messages', gameTheoretic: 12, raft: 35 }
  ]

  const latencyDistribution = Array.from({ length: 100 }, (_, i) => ({
    latency: i * 5,
    gameTheoretic: Math.max(0, 100 * Math.exp(-Math.pow((i * 5 - 45) / 20, 2))),
    raft: Math.max(0, 80 * Math.exp(-Math.pow((i * 5 - 120) / 40, 2)))
  }))

  const timeSeriesData = Array.from({ length: 50 }, (_, i) => ({
    time: i,
    gameTheoreticLatency: 35 + 15 * Math.sin(i / 5) + Math.random() * 10,
    raftLatency: 100 + 30 * Math.sin(i / 8) + Math.random() * 25
  }))

  const runComparison = async () => {
    setRunning(true)
    setProgress(0)
    
    // Simulate running comparison
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 100))
      setProgress(i)
    }
    
    setRunning(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                RAFT Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Number of Nodes</Label>
                  <Input 
                    type="number" 
                    value={nodes} 
                    onChange={(e) => setNodes(parseInt(e.target.value) || 5)}
                    min="3"
                    max="15"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum 3 nodes required for consensus
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Network Delay: {networkDelay[0]}ms
                  </Label>
                  <Slider 
                    value={networkDelay} 
                    onValueChange={setNetworkDelay}
                    max={200}
                    min={1}
                    step={1}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Packet Drop Rate: {dropRate[0]}%
                  </Label>
                  <Slider 
                    value={dropRate} 
                    onValueChange={setDropRate}
                    max={20}
                    min={0}
                    step={0.5}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Network Conditions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">LAN</Button>
                    <Button variant="outline" size="sm">WAN</Button>
                    <Button variant="outline" size="sm">Mobile</Button>
                    <Button variant="outline" size="sm">Satellite</Button>
                  </div>
                </div>

                <Button 
                  onClick={runComparison}
                  disabled={running}
                  className="w-full"
                  size="lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Run Comparison
                </Button>

                {running && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Running simulation...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={comparisonData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    type="category" 
                    dataKey="metric" 
                    width={150}
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Bar dataKey="gameTheoretic" fill="#10b981" name="Game-Theoretic" />
                  <Bar dataKey="raft" fill="#6366f1" name="RAFT" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Latency Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={latencyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="latency" label={{ value: 'Latency (ms)', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'Frequency', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="gameTheoretic" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Game-Theoretic"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="raft" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    name="RAFT"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time Series Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Latency Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" label={{ value: 'Time (s)', position: 'insideBottom', offset: -10 }} />
                  <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="gameTheoreticLatency" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Game-Theoretic"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="raftLatency" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    name="RAFT"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Summary Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Key Insights & Trade-offs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  Game-Theoretic Approach
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm">Lower Latency</span>
                    <Badge variant="default" className="bg-green-600">+62% faster</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm">Higher Throughput</span>
                    <Badge variant="default" className="bg-green-600">+175% more</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm">Fewer Messages</span>
                    <Badge variant="default" className="bg-green-600">-66% network</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <span className="text-sm">Trust Dependency</span>
                    <Badge variant="secondary">Moderate</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  RAFT Consensus
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm">Byzantine Fault Tolerance</span>
                    <Badge variant="default" className="bg-blue-600">Strong</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm">Proven Correctness</span>
                    <Badge variant="default" className="bg-blue-600">Formal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm">Network Resilience</span>
                    <Badge variant="default" className="bg-blue-600">High</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <span className="text-sm">Message Overhead</span>
                    <Badge variant="destructive">Higher</Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-6 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-600" />
                Recommendation
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The game-theoretic approach shows significant performance advantages in trusted environments 
                with cooperative participants. However, RAFT provides stronger guarantees against malicious 
                actors and network partitions. Consider the game-theoretic approach for private networks 
                with known participants, and RAFT for public or adversarial environments.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
