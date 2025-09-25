import { useMemo, useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import Button from '../components/Button'

type CalculationMethod = 'standard' | 'advanced' | 'custom'

export default function Calculator() {
  const [calculationMethod, setCalculationMethod] = useState<CalculationMethod>('standard')
  const [height, setHeight] = useState<string>('')
  const [breadth, setBreadth] = useState<string>('')
  const [safeDepthFactor, setSafeDepthFactor] = useState<string>('0.6')
  const [rockDensity, setRockDensity] = useState<string>('2.7') // g/cm³
  const [safetyMargin, setSafetyMargin] = useState<string>('1.5')
  const [customFormula, setCustomFormula] = useState<string>('0.6 * Math.sqrt(height * breadth)')
  const [calculationHistory, setCalculationHistory] = useState<Array<{id: string, inputs: any, result: number}>>([])

  const computedDepth = useMemo(() => {
    try {
      const h = parseFloat(height)
      const b = parseFloat(breadth)
      const f = parseFloat(safeDepthFactor)
      const d = parseFloat(rockDensity)
      const m = parseFloat(safetyMargin)
      
      if (isNaN(h) || isNaN(b)) return null
      
      let depth = 0
      
      switch(calculationMethod) {
        case 'standard':
          if (isNaN(f)) return null
          depth = f * Math.sqrt(h * b)
          break
          
        case 'advanced':
          if (isNaN(f) || isNaN(d) || isNaN(m)) return null
          // More complex formula considering rock density and safety margin
          depth = f * Math.sqrt(h * b) * (1 / d) * m
          break
          
        case 'custom':
          try {
            // Warning: Using eval can be dangerous in real applications
            // In production, consider a formula parser library instead
            depth = eval(customFormula.replace(/height/g, h.toString())
                                      .replace(/breadth/g, b.toString())
                                      .replace(/factor/g, f.toString())
                                      .replace(/density/g, d.toString())
                                      .replace(/margin/g, m.toString()))
          } catch (error) {
            console.error('Custom formula error:', error)
            return null
          }
          break
      }
      
      return Number.isFinite(depth) ? depth : null
    } catch (error) {
      return null
    }
  }, [height, breadth, safeDepthFactor, rockDensity, safetyMargin, customFormula, calculationMethod])

  const saveCalculation = () => {
    if (computedDepth === null) return
    
    const calculation = {
      id: crypto.randomUUID(),
      inputs: {
        method: calculationMethod,
        height: parseFloat(height),
        breadth: parseFloat(breadth),
        factor: parseFloat(safeDepthFactor),
        density: parseFloat(rockDensity),
        margin: parseFloat(safetyMargin),
        formula: calculationMethod === 'custom' ? customFormula : undefined
      },
      result: computedDepth
    }
    
    setCalculationHistory(prev => [calculation, ...prev.slice(0, 9)]) // Keep last 10
  }

  const clearHistory = () => {
    setCalculationHistory([])
  }

  const exportData = () => {
    const dataStr = JSON.stringify(calculationHistory, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'mining-calculations.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">📊 Mining Calculator</h1>
          <p className="subtle">Advanced calculations for mine area safety and depth analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Calculator" subtitle="Configure your parameters" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm subtle mb-2">Calculation Method</label>
                <div className="flex gap-2">
                  {(['standard', 'advanced', 'custom'] as CalculationMethod[]).map(method => (
                    <button
                      key={method}
                      onClick={() => setCalculationMethod(method)}
                      className={`px-3 py-2 rounded text-sm transition-colors ${
                        calculationMethod === method 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs subtle mb-1">Height (m)</label>
                  <input 
                    value={height} 
                    onChange={(e) => setHeight(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="e.g. 120" 
                    className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                  />
                </div>
                <div>
                  <label className="block text-xs subtle mb-1">Breadth (m)</label>
                  <input 
                    value={breadth} 
                    onChange={(e) => setBreadth(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="e.g. 80" 
                    className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                  />
                </div>
                <div>
                  <label className="block text-xs subtle mb-1">Safety Factor (0-1)</label>
                  <input 
                    value={safeDepthFactor} 
                    onChange={(e) => setSafeDepthFactor(e.target.value.replace(/[^0-9.]/g, ''))}
                    placeholder="0.6" 
                    className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                  />
                </div>
                
                {(calculationMethod === 'advanced' || calculationMethod === 'custom') && (
                  <>
                    <div>
                      <label className="block text-xs subtle mb-1">Rock Density (g/cm³)</label>
                      <input 
                        value={rockDensity} 
                        onChange={(e) => setRockDensity(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="2.7" 
                        className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs subtle mb-1">Safety Margin</label>
                      <input 
                        value={safetyMargin} 
                        onChange={(e) => setSafetyMargin(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="1.5" 
                        className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                      />
                    </div>
                  </>
                )}
                
                {calculationMethod === 'custom' && (
                  <div className="col-span-2">
                    <label className="block text-xs subtle mb-1">Custom Formula</label>
                    <input 
                      value={customFormula} 
                      onChange={(e) => setCustomFormula(e.target.value)}
                      placeholder="e.g., 0.6 * Math.sqrt(height * breadth)" 
                      className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5" 
                    />
                    <p className="text-xs text-white/50 mt-1">
                      Available variables: height, breadth, factor, density, margin
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-white/10">
                {computedDepth === null ? (
                  <p className="subtle text-sm">Enter valid parameters to compute depth.</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">
                      Estimated safe depth: <span className="text-indigo-400">{computedDepth.toFixed(2)} m</span>
                    </p>
                    <Button 
                      onClick={saveCalculation}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Save Calculation
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader 
              title="History" 
              subtitle="Recent calculations"
              right={
                calculationHistory.length > 0 && (
                  <div className="flex gap-2">
                    <button 
                      onClick={exportData}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      Export
                    </button>
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear
                    </button>
                  </div>
                )
              }
            />
            <div className="space-y-3 max-h-[400px] overflow-auto">
              {calculationHistory.length === 0 ? (
                <p className="subtle text-sm">No calculations yet</p>
              ) : (
                calculationHistory.map((calc) => (
                  <div key={calc.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{calc.result.toFixed(2)} m</p>
                        <p className="text-xs text-white/60">
                          H: {calc.inputs.height}m × B: {calc.inputs.breadth}m
                          {calc.inputs.method !== 'standard' && ` × D: ${calc.inputs.density}g/cm³`}
                        </p>
                        <p className="text-xs text-white/40 mt-1">
                          {new Date().toLocaleString()} • {calc.inputs.method}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      {/* Mining Explosive Interactive Box */}
      <div className="mt-8">
        <Card>
          <CardHeader title="Mining Explosive Manual" subtitle="Select Surface and Ore to see Explosive" />
          <MiningExplosiveSelector />
        </Card>
      </div>
    </Layout>
  )
}

// Data for mining explosive reference
const miningExplosiveData = [
  {
    surface: 'Lateritic soil / laterite crust',
    ores: [
      'bauxite',
      'iron ores',
      'manganese',
      'nickel',
      'cobalt',
      'chromite',
      'gold',
      'platinum group elements',
      'rare earth elements',
      'aluminum',
      'copper',
      'zinc',
      'lead',
      'tin',
      'titanium',
      'other lateritic minerals'
    ],
    explosive: 'bulk emulsion / ANFO',
  },
  {
    surface: 'Red / ferruginous soils',
    ores: ['iron (hematite, magnetite)', 'sometimes Mn'],
    explosive: 'bulk emulsion / ANFO',
  },
  {
    surface: 'Alluvial / placer (riverbeds, gravels)',
    ores: ['placer gold', 'tin', 'gemstones'],
    explosive: 'prefer non-explosive methods or very low-energy controlled blasting',
  },
  {
    surface: 'Black cotton / regur over basalt',
    ores: ['base metals (Cu, Mn)', 'lateritic Ni in some regions'],
    explosive: 'bulk emulsion / higher-energy bulk products',
  },
  {
    surface: 'Calcareous / carbonate surfaces (limestone/marl)',
    ores: ['lead-zinc', 'barite', 'fluorspar'],
    explosive: 'packaged products or bulk emulsion',
  },
  {
    surface: 'Saprolite / deeply weathered profiles',
    ores: ['supergene concentrations (Ni laterite, enriched Cu zones)'],
    explosive: 'bulk emulsion / low-energy approaches',
  },
  {
    surface: 'Gravelly colluvium / talus',
    ores: [
      'secondary metal concentrations (variable)',
      'gold nuggets',
      'rare earth minerals',
      'tin',
      'tungsten',
      'platinum group elements',
      'gemstones',
      'heavy mineral sands',
      'copper',
      'lead',
      'zinc',
      'nickel',
      'iron',
      'manganese',
      'chromite',
      'bauxite',
      'other placer minerals'
    ],
    explosive: 'non-explosive or specialist controlled blasting',
  },
  {
    surface: 'Glacial till / moraines',
    ores: ['scattered heavy minerals / variable concentrations'],
    explosive: 'non-explosive / specialist approach',
  },
  {
    surface: 'Hard igneous outcrops (granite, gabbro, basalt)',
    ores: [
      'iron (Fe)',
      'copper (Cu)',
      'nickel (Ni)',
      'platinum group elements (PGE)'
    ],
    explosive: 'high-energy bulk products or packaged dynamite/emulsions',
  },
  {
    surface: 'Shales / weak sediments (mudstone)',
    ores: ['stratiform deposits', 'coal seams (site dependent)'],
    explosive: 'low-energy packaged products or engineered emulsions',
  },
];


// Interactive selector component for mining explosives
function MiningExplosiveSelector() {


  const [selectedSurface, setSelectedSurface] = useState('');
  const [selectedOre, setSelectedOre] = useState('');
  const oresForSurface = selectedSurface
    ? miningExplosiveData.find(d => d.surface === selectedSurface)?.ores || []
    : [];

  // When surface changes, reset ore selection
  useEffect(() => {
    setSelectedOre('');
  }, [selectedSurface]);

  // Find the matching explosive
  const matching = miningExplosiveData.find(d => d.surface === selectedSurface && d.ores.includes(selectedOre));
  const explosive = matching ? matching.explosive : '—';

  return (
    <div className="p-4">
      {/* Custom dark styles for select dropdowns */}
      <style>{`
        .mining-explosive-select, .mining-explosive-select option {
          background-color: #23263a !important;
          color: #f3f4f6 !important;
        }
        .mining-explosive-select:focus {
          outline: 2px solid #6366f1;
        }
      `}</style>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Surface selector */}
        <div>
          <label className="block text-xs subtle mb-1">Surface</label>
          <select
            className="mining-explosive-select w-full max-w-xs rounded bg-white/10 border border-white/20 px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ minWidth: 0 }}
            value={selectedSurface}
            onChange={e => setSelectedSurface(e.target.value)}
          >
            <option value="" disabled>Select surface</option>
            {miningExplosiveData.map(d => (
              <option key={d.surface} value={d.surface}>{d.surface}</option>
            ))}
          </select>
        </div>
        {/* Ore selector */}
        <div>
          <label className="block text-xs subtle mb-1">Type of Ore</label>
          <select
            className="mining-explosive-select w-full max-w-xs rounded bg-white/10 border border-white/20 px-2 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            style={{ minWidth: 0 }}
            value={selectedOre}
            onChange={e => setSelectedOre(e.target.value)}
            disabled={!selectedSurface || oresForSurface.length === 0}
          >
            <option value="" disabled>Select ore</option>
            {oresForSurface.map(ore => (
              <option key={ore} value={ore}>{ore}</option>
            ))}
          </select>
        </div>
        {/* Explosive display */}
        <div>
          <label className="block text-xs subtle mb-1">Type of Explosive</label>
          <div className="rounded bg-white/5 border border-white/20 px-2 py-2 min-h-[40px] text-white flex items-center max-w-xs" style={{ minWidth: 0 }}>
            {selectedSurface && selectedOre ? explosive : '—'}
          </div>
        </div>
      </div>
      <div className="text-xs text-yellow-300 mt-4">
        ⚠ Reminder: these are high-level, non-actionable planning hints only. Final explosive family, blast design and all operational details must be chosen and signed off by a licensed blasting engineer in compliance with local laws, permits, magazine rules and environmental limits.
      </div>
    </div>
  );
}