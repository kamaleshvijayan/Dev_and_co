import { useMemo, useState } from 'react'
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
    </Layout>
  )
}