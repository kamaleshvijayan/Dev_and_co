import { useEffect, useMemo, useRef, useState } from 'react'
import Layout from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import Badge from '../components/Badge'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

type Sensor = { id: string; name: string; value: number }

type Props = { onLogout: () => void }

const initialSensors: Sensor[] = Array.from({ length: 16 }).map((_, i) => ({
  id: `S-${(i + 1).toString().padStart(2, '0')}`,
  name: `Sensor ${(i + 1)}`,
  value: Math.round(20 + Math.random() * 70),
}))

export default function FrequencyModule({ onLogout }: Props) {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors)
  const [selected, setSelected] = useState<Sensor>(initialSensors[0])
  const [live, setLive] = useState<boolean>(true)
  const [activity, setActivity] = useState<string[]>([])

  // Editable thresholds
  const [okMax, setOkMax] = useState<number>(40)
  const [warnMax, setWarnMax] = useState<number>(70)

  useEffect(() => {
    if (!live) return
    const t = setInterval(() => {
      setSensors((prev) => prev.map((s) => ({ ...s, value: Math.max(0, Math.min(100, s.value + Math.round((Math.random() - 0.5) * 10))) })))
    }, 1500)
    return () => clearInterval(t)
  }, [live])

  useEffect(() => {
    setSelected((sel) => sensors.find((s) => s.id === sel.id) || sensors[0])
  }, [sensors])

  const trendRef = useRef<number[]>(Array.from({ length: 20 }).map(() => selected.value))
  useEffect(() => {
    trendRef.current = [...trendRef.current.slice(-19), selected.value]
  }, [selected.value])

  const highest = useMemo(() => sensors.reduce((a, b) => (a.value > b.value ? a : b), sensors[0]), [sensors])

  const toneBy = (v: number) => (v <= okMax ? 'ok' : v <= warnMax ? 'warn' : 'crit' as const)
  const labelBy = (v: number) => (v <= okMax ? 'OK' : v <= warnMax ? 'Warning' : 'Critical')

  const envFactors = useMemo(() => {
    const temp = 15 + Math.random() * 20
    const wind = 2 + Math.random() * 8
    const vib = selected.value
    const state = labelBy(vib)
    return { temp: temp.toFixed(1), wind: wind.toFixed(1), vib, state }
  }, [selected.value, okMax, warnMax])

  useEffect(() => {
    setActivity((a) => [`${new Date().toLocaleTimeString()} ${selected.id} → ${selected.value}`, ...a].slice(0, 50))
  }, [selected.value, selected.id])

  const data = useMemo(() => ({
    labels: Array.from({ length: trendRef.current.length }).map((_, i) => `${i}`),
    datasets: [
      { label: 'Avg Frequency', data: trendRef.current, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.2)', tension: 0.3, fill: true },
    ],
  }), [selected.value])

  const options = useMemo(() => ({ responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100 }, x: { display: false } } }), [])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Frequency Detect</h1>
            <p className="subtle">Live sensor frequencies with thresholds and risk map</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm subtle flex items-center gap-2">
              <input type="checkbox" checked={live} onChange={(e)=>setLive(e.target.checked)} /> Live
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className="subtle">OK ≤</span>
              <input type="number" value={okMax} onChange={(e)=>setOkMax(Number(e.target.value))} className="w-16 rounded bg-white/10 border border-white/20 px-2 py-1" />
              <span className="subtle">Warning ≤</span>
              <input type="number" value={warnMax} onChange={(e)=>setWarnMax(Number(e.target.value))} className="w-16 rounded bg-white/10 border border-white/20 px-2 py-1" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[340px,1fr] gap-6">
          <div className="space-y-4">
            <Card>
              <CardHeader title="Sensors" subtitle="Tap to select" />
              <div className="grid grid-cols-4 gap-2">
                {sensors.map((s) => (
                  <button key={s.id} onClick={()=>setSelected(s)} className={`rounded-xl p-2 text-center glass border border-white/15 ${selected.id===s.id ? 'outline outline-2 outline-indigo-500' : ''}`}>
                    <div className="text-xs subtle">{s.id}</div>
                    <div className="text-sm font-semibold">{s.value}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader title="Activity" subtitle="Recent changes" />
              <ul className="space-y-2 max-h-[300px] overflow-auto pr-2 text-sm">
                {activity.map((line, i) => (
                  <li key={i} className="subtle">{line}</li>
                ))}
                {activity.length === 0 && <p className="subtle">No activity yet</p>}
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader title={`${selected.name} (${selected.id})`} right={<Badge tone={toneBy(selected.value)}>{labelBy(selected.value)}</Badge>} />
              <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
                <div className="absolute inset-y-0 left-0 badge-ok opacity-30" style={{ width: `${okMax}%` }} />
                <div className="absolute inset-y-0 left-[var(--ok)] badge-warn opacity-30" style={{ width: `${warnMax - okMax}%`, left: `${okMax}%` }} />
                <div className="absolute inset-y-0 right-0 badge-crit opacity-30" style={{ width: `${100 - warnMax}%` }} />
                <div className={`${toneBy(selected.value) === 'ok' ? 'badge-ok' : toneBy(selected.value) === 'warn' ? 'badge-warn' : 'badge-crit'} h-full`} style={{ width: `${selected.value}%` }} />
              </div>
              <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                <div className="glass rounded p-2">
                  <div className="subtle">Temperature</div>
                  <div className="font-semibold">{envFactors.temp} °C</div>
                </div>
                <div className="glass rounded p-2">
                  <div className="subtle">Wind Speed</div>
                  <div className="font-semibold">{envFactors.wind} m/s</div>
                </div>
                <div className="glass rounded p-2">
                  <div className="subtle">Vibration</div>
                  <div className="font-semibold">{envFactors.vib}</div>
                </div>
              </div>
              <p className="subtle text-sm mt-2">Environment: {envFactors.state}</p>
            </Card>

            <Card>
              <CardHeader title="Risk Map" subtitle="Safe vs critical zones" />
              <div className="grid grid-cols-6 gap-2">
                {sensors.map((s) => (
                  <div key={s.id} className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-medium ${toneBy(s.value) === 'ok' ? 'bg-green-600/80' : toneBy(s.value) === 'warn' ? 'bg-amber-500/80' : 'bg-red-600/80'}`}>
                    {s.id}
                  </div>
                ))}
              </div>
              <p className="subtle text-xs mt-2">Highest reading: <span className="text-white/90 font-semibold">{highest.id}</span> ({highest.value})</p>
            </Card>

            <Card>
              <CardHeader title="Average Frequency Trend" />
              <Line data={data} options={options} />
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
