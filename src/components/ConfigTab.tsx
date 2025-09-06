"use client";
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Save, Upload, Download, Trash2, Settings, Copy, Edit, Plus, FileText } from 'lucide-react'
import { useSimStore } from '@/state/useSimStore'

interface Preset {
  id: string
  name: string
  description: string
  config: any
  created: string
  tags: string[]
}

export function ConfigTab() {
  const { config, setConfig } = useSimStore()
  const [presets, setPresets] = useState<Preset[]>([
    {
      id: '1',
      name: 'Classic Tournament',
      description: 'Traditional Axelrod tournament with 8 strategies',
      config: { players: 16, rounds: 200, noise: 0.01 },
      created: '2024-01-15',
      tags: ['classic', 'research']
    },
    {
      id: '2',
      name: 'High Noise Environment',
      description: 'Test strategies under high noise conditions',
      config: { players: 12, rounds: 150, noise: 0.15 },
      created: '2024-01-14',
      tags: ['noise', 'stress-test']
    },
    {
      id: '3',
      name: 'Quick Test',
      description: 'Fast configuration for testing',
      config: { players: 8, rounds: 50, noise: 0.05 },
      created: '2024-01-13',
      tags: ['quick', 'debug']
    }
  ])
  
  const [newPresetName, setNewPresetName] = useState('')
  const [newPresetDescription, setNewPresetDescription] = useState('')
  const [editingPreset, setEditingPreset] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState('system')

  const savePreset = () => {
    if (!newPresetName.trim()) return
    
    const newPreset: Preset = {
      id: Date.now().toString(),
      name: newPresetName,
      description: newPresetDescription,
      config: { ...config },
      created: new Date().toISOString().split('T')[0],
      tags: ['custom']
    }
    
    setPresets([newPreset, ...presets])
    setNewPresetName('')
    setNewPresetDescription('')
  }

  const loadPreset = (preset: Preset) => {
    setConfig(preset.config)
  }

  const deletePreset = (id: string) => {
    setPresets(presets.filter(p => p.id !== id))
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify({ config, timestamp: new Date().toISOString() }, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `simulation-config-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        if (imported.config) {
          setConfig(imported.config)
        }
      } catch (error) {
        console.error('Failed to import config:', error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={exportConfig} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Config
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <input
            type="file"
            accept=".json"
            onChange={importConfig}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          Import Config
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(config, null, 2))
              .then(() => alert('Configuration copied to clipboard!'))
              .catch(() => alert('Failed to copy configuration'))
          }}
        >
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Simulation Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Basic Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Basic Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Players</Label>
                    <Input 
                      type="number" 
                      value={config.players}
                      onChange={(e) => setConfig({ players: parseInt(e.target.value) || 16 })}
                      min="2"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tournament Rounds (H)</Label>
                    <Input 
                      type="number" 
                      value={config.H}
                      onChange={(e) => setConfig({ H: parseInt(e.target.value) || 200 })}
                      min="1"
                      max="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Continuation Probability (w)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={config.w}
                      onChange={(e) => setConfig({ w: parseFloat(e.target.value) || 0.98 })}
                      min="0"
                      max="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Noise Level (ε)</Label>
                    <Input 
                      type="number" 
                      step="0.001"
                      value={config.noise}
                      onChange={(e) => setConfig({ noise: parseFloat(e.target.value) || 0.01 })}
                      min="0"
                      max="0.5"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payoff Matrix */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Payoff Matrix</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Temptation (T)</Label>
                    <Input 
                      type="number" 
                      value={config.payoffs.T}
                      onChange={(e) => setConfig({ 
                        payoffs: { ...config.payoffs, T: parseInt(e.target.value) || 5 } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reward (R)</Label>
                    <Input 
                      type="number" 
                      value={config.payoffs.R}
                      onChange={(e) => setConfig({ 
                        payoffs: { ...config.payoffs, R: parseInt(e.target.value) || 3 } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Punishment (P)</Label>
                    <Input 
                      type="number" 
                      value={config.payoffs.P}
                      onChange={(e) => setConfig({ 
                        payoffs: { ...config.payoffs, P: parseInt(e.target.value) || 1 } 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sucker (S)</Label>
                    <Input 
                      type="number" 
                      value={config.payoffs.S}
                      onChange={(e) => setConfig({ 
                        payoffs: { ...config.payoffs, S: parseInt(e.target.value) || 0 } 
                      })}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Must satisfy: T &gt; R &gt; P &gt; S and 2R &gt; T + S
                </p>
              </div>

              <Separator />

              {/* Leader Election Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Leader Election & Incentives</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Allocated Leader Incentive</Label>
                    <Input 
                      type="number" 
                      value={config.allocatedLeaderIncentive}
                      onChange={(e) => setConfig({ 
                        allocatedLeaderIncentive: parseInt(e.target.value) || 100 
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Random Seed</Label>
                    <Input 
                      value={config.seed}
                      onChange={(e) => setConfig({ seed: e.target.value })}
                      placeholder="Enter seed for reproducibility"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label>Dishonesty Probability: {(config.dishonesty.p || 0) * 100}%</Label>
                  <Slider 
                    value={[(config.dishonesty.p || 0) * 100]} 
                    onValueChange={(value) => setConfig({ 
                      dishonesty: { ...config.dishonesty, p: value[0] / 100 } 
                    })}
                    max={20}
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>

              <Separator />

              {/* Application Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Application Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label>Theme</Label>
                    <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="auto-save" />
                      <Label htmlFor="auto-save">Auto-save configurations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="animations" defaultChecked />
                      <Label htmlFor="animations">Enable animations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="sound" />
                      <Label htmlFor="sound">Sound effects</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Presets Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Configuration Presets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {/* Save New Preset */}
              <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Save Current Config
                </h4>
                <Input 
                  placeholder="Preset name"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                />
                <Textarea 
                  placeholder="Description (optional)"
                  value={newPresetDescription}
                  onChange={(e) => setNewPresetDescription(e.target.value)}
                  rows={2}
                />
                <Button onClick={savePreset} size="sm" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preset
                </Button>
              </div>

              <Separator />

              {/* Preset List */}
              <div className="space-y-3">
                {presets.map((preset) => (
                  <motion.div
                    key={preset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{preset.name}</h5>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setEditingPreset(preset.id)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Preset</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{preset.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deletePreset(preset.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {preset.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {preset.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {preset.created}
                      </span>
                      <Button 
                        size="sm" 
                        onClick={() => loadPreset(preset)}
                      >
                        Load
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
