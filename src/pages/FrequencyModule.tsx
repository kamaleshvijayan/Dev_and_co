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
  // Assign random lat/lng to each sensor (India bounding box)
  const [sensorLocations] = useState(() =>
    initialSensors.map((s) => ({
      ...s,
      lat: 8 + Math.random() * 20, // 8 to 28
      lng: 68 + Math.random() * 25 // 68 to 93
    }))
  )
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
              <CardHeader title="Risk Map" subtitle="Open Pit Mine Layout" />
              <div style={{ position: 'relative', width: '100%', height: 400, borderRadius: 12, overflow: 'hidden', background: '#222' }}>
                {/* SVG 3D Open Pit Mine Layout */}
                <svg viewBox="0 0 600 400" width="100%" height="100%" style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>
                  <defs>
                    <radialGradient id="pitGradient" cx="50%" cy="60%" r="80%">
                      <stop offset="0%" stopColor="#222" />
                      <stop offset="100%" stopColor="#666" />
                    </radialGradient>
                  </defs>
                  {/* Draw benches with perspective */}
                  <ellipse cx="300" cy="220" rx="250" ry="90" fill="url(#pitGradient)" stroke="#888" strokeWidth="5" />
                  <ellipse cx="300" cy="240" rx="200" ry="70" fill="none" stroke="#aaa" strokeWidth="3" />
                  <ellipse cx="300" cy="260" rx="140" ry="45" fill="none" stroke="#bbb" strokeWidth="2" />
                  <ellipse cx="300" cy="280" rx="80" ry="22" fill="none" stroke="#ccc" strokeWidth="2" />
                  <ellipse cx="300" cy="295" rx="30" ry="8" fill="#181818" stroke="#eee" strokeWidth="2" />
                  <text x="300" y="60" textAnchor="middle" fill="#aaa" fontSize="22" fontWeight="bold" style={{textShadow:'0 2px 8px #000'}}>Open Pit Mine</text>
                </svg>
                {/* Arrange sensors randomly inside the main mine ellipse */}
                {(() => {
                  // Main ellipse: cx=300, cy=220, rx=250, ry=90
                  // Generate random (x, y) inside ellipse for each sensor (fixed for session)
                  // Strictly constrain sensors inside the main ellipse (cx=300, cy=220, rx=250, ry=90)
                  // Generate random points strictly inside the SVG ellipse (cx=300, cy=220, rx=250, ry=90)
                  // Persist sensor positions in localStorage
                  const [randomPositions] = useState(() => {
                    const key = 'sensorPositions-v1';
                    const saved = localStorage.getItem(key);
                    if (saved) {
                      try {
                        const arr = JSON.parse(saved);
                        if (Array.isArray(arr) && arr.length === sensors.length) return arr;
                      } catch {}
                    }
                    // Generate new positions if not found or invalid
                    const arr = sensors.map(() => {
                      let cx, cy;
                      while (true) {
                        const theta = Math.random() * 2 * Math.PI;
                        const r = Math.sqrt(Math.random());
                        cx = 300 + r * 250 * Math.cos(theta);
                        cy = 220 + r * 90 * Math.sin(theta);
                        const dx = (cx - 300) / 250;
                        const dy = (cy - 220) / 90;
                        if (dx * dx + dy * dy <= 0.96) break;
                      }
                      return { cx, cy };
                    });
                    localStorage.setItem(key, JSON.stringify(arr));
                    return arr;
                  });
                  return sensors.map((s, i) => {
                    const { cx, cy } = randomPositions[i];
                    const tone = toneBy(s.value);
                    let color = tone === 'ok' ? 'green' : tone === 'warn' ? 'orange' : 'red';
                    let className = tone === 'crit' ? 'blinking-marker' : '';
                    return (
                      <div
                        key={s.id}
                        className={className}
                        style={{
                          position: 'absolute',
                          left: cx - 5,
                          top: cy - 5,
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: color,
                          border: '1.5px solid #fff',
                          boxShadow: '0 0 4px #000a',
                          zIndex: 2,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 8,
                          transition: 'background 0.3s',
                        }}
                        title={`${s.name}\nValue: ${s.value}\nStatus: ${tone === 'ok' ? 'OK' : tone === 'warn' ? 'Warning' : 'Critical'}`}
                      >
                      </div>
                    );
                  });
                })()}
              </div>
              <style>{`
                .blinking-marker {
                  animation: blink 1s steps(2, start) infinite;
                }
                @keyframes blink {
                  to { opacity: 0.2; }
                }
              `}</style>
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
