"use client";
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdvancedSimulatorTab } from '@/components/AdvancedSimulatorTab'
import { ResultsTab } from '@/components/ResultsTab'
import { RaftComparisonTab } from '@/components/RaftComparisonTab'
import { ConfigTab } from '@/components/ConfigTab'
import { AboutTab } from '@/components/AboutTab'
import { Zap, BarChart3, Network, Settings, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gaming Background - Theme Aware */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
        {/* Animated Grid Pattern - Theme Aware */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(59,130,246,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.3)_1px,transparent_1px)] bg-[size:50px_50px] animate-pulse" />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => {
            // Use deterministic positioning based on index to avoid hydration mismatch
            const baseX = (i * 137) % 1200
            const baseY = (i * 211) % 800
            const baseDuration = 10 + (i * 0.5) % 20
            
            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400/20 dark:bg-blue-400/30 rounded-full"
                initial={{ 
                  x: baseX, 
                  y: baseY 
                }}
                animate={{
                  x: baseX + 200,
                  y: baseY + 150,
                }}
                transition={{
                  duration: baseDuration,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }}
              />
            )
          })}
        </div>

        {/* Glowing Orbs - Theme Aware */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-6">
        {/* Gaming-Style Header */}
        <motion.div
          className="mb-8 relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center space-y-6">
            {/* Futuristic Title with Glow Effect */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 blur-3xl opacity-20 dark:opacity-30 animate-pulse" />
              <h1 className="relative text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 dark:from-blue-400 dark:via-purple-400 dark:to-cyan-400 bg-clip-text text-transparent tracking-wider">
                GAME-THEORETIC
                <br />
                <span className="text-3xl md:text-5xl font-light">LEADER ELECTION</span>
                <br />
                <span className="text-2xl md:text-4xl font-medium text-slate-700 dark:text-white/80">SIMULATOR</span>
              </h1>
              
              {/* Gaming-style subtitle badge */}
              <motion.div
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 backdrop-blur-sm border border-blue-400/20 dark:border-blue-400/30 rounded-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-slate-700 dark:text-white/90">LIVE TOURNAMENT SYSTEM</span>
              </motion.div>
            </motion.div>

            <motion.p
              className="text-lg text-slate-600 dark:text-white/70 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Experience next-generation consensus algorithms through immersive game theory simulations.
              <br />
              <span className="text-blue-600 dark:text-blue-300">Battle-tested strategies • Real-time analytics • Professional esports interface</span>
            </motion.p>
          </div>
        </motion.div>

        {/* Gaming-Style Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Tabs defaultValue="simulator" className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-16 bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-blue-500/20 dark:border-blue-500/30 rounded-xl shadow-2xl">
              <TabsTrigger 
                value="simulator" 
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-purple-600/50 data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                <span className="hidden sm:inline">BATTLE ARENA</span>
                <span className="sm:hidden">ARENA</span>
              </TabsTrigger>
              <TabsTrigger 
                value="results" 
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600/50 data-[state=active]:to-emerald-600/50 data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">LEADERBOARD</span>
                <span className="sm:hidden">STATS</span>
              </TabsTrigger>
              <TabsTrigger 
                value="compare" 
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600/50 data-[state=active]:to-red-600/50 data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Network className="w-5 h-5" />
                <span className="hidden sm:inline">VS MODE</span>
                <span className="sm:hidden">VS</span>
              </TabsTrigger>
              <TabsTrigger 
                value="config" 
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600/50 data-[state=active]:to-pink-600/50 data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">SETTINGS</span>
                <span className="sm:hidden">CONFIG</span>
              </TabsTrigger>
              <TabsTrigger 
                value="about" 
                className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-white/70 data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600/50 data-[state=active]:to-blue-600/50 data-[state=active]:shadow-lg transition-all duration-300"
              >
                <BookOpen className="w-5 h-5" />
                <span className="hidden sm:inline">GUIDE</span>
                <span className="sm:hidden">INFO</span>
              </TabsTrigger>
            </TabsList>

            {/* Gaming-Style Content Area */}
            <div className="mt-8">
              <TabsContent value="simulator" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  {/* Gaming overlay effects for active tab */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-cyan-600/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-blue-500/10 dark:border-blue-500/20 rounded-2xl p-1">
                    <AdvancedSimulatorTab />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="results" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/10 via-emerald-600/10 to-teal-600/10 dark:from-green-600/20 dark:via-emerald-600/20 dark:to-teal-600/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-green-500/10 dark:border-green-500/20 rounded-2xl p-1">
                    <ResultsTab />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="compare" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/10 via-red-600/10 to-pink-600/10 dark:from-orange-600/20 dark:via-red-600/20 dark:to-pink-600/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-orange-500/10 dark:border-orange-500/20 rounded-2xl p-1">
                    <RaftComparisonTab />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="config" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-rose-600/10 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-rose-600/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-purple-500/10 dark:border-purple-500/20 rounded-2xl p-1">
                    <ConfigTab />
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600/10 via-blue-600/10 to-indigo-600/10 dark:from-cyan-600/20 dark:via-blue-600/20 dark:to-indigo-600/20 rounded-2xl blur-xl animate-pulse" />
                  <div className="relative bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-cyan-500/10 dark:border-cyan-500/20 rounded-2xl p-1">
                    <AboutTab />
                  </div>
                </motion.div>
              </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
