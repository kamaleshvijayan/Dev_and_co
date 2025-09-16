import Layout from '../components/Layout'
import { Card, CardHeader } from '../components/Card'
import Badge from '../components/Badge'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const now = new Date().toLocaleString()
  return (
    <Layout>
      <div className="space-y-8">
        <div className="rounded-2xl p-6 glass">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="subtle">System check: {now}</p>
            </div>
            <div className="flex gap-2">
              <a href="/drone" className="px-4 py-2 rounded-lg badge-warn">Open Drone Module</a>
              <a href="/frequency" className="px-4 py-2 rounded-lg badge-ok">Open Frequency Module</a>
              <a href="/calculator" className="px-4 py-2 rounded-lg badge-ok">Open Calculator</a>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛰️</div>
              <div>
                <p className="subtle">Drone Status</p>
                <div className="mt-1 flex items-center gap-2"><Badge>OK</Badge><span>Ready</span></div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="text-2xl">📡</div>
              <div>
                <p className="subtle">Active Sensors</p>
                <p className="mt-1 text-2xl font-semibold">24</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <p className="subtle">Alerts (24h)</p>
                <p className="mt-1 text-2xl font-semibold">3</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <a href="/drone" className="block">
            <Card className="card-hover">
              <CardHeader title="Drone Image Detect" subtitle="Module" right={<Badge>Ready</Badge>} />
              <p className="subtle text-sm">Upload images and detect crack severity.</p>
            </Card>
          </a>
          <a href="/frequency" className="block">
            <Card className="card-hover">
              <CardHeader title="Frequency Detect" subtitle="Module" right={<Badge tone="warn">Monitoring</Badge>} />
              <p className="subtle text-sm">Monitor sensor readings and risk map.</p>
            </Card>
          </a>
        </div>

        <Card>
          <CardHeader title="Activity Log" />
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="subtle">Frequency spike detected at S-12</span><Badge tone="warn">Warning</Badge></li>
            <li className="flex justify-between"><span className="subtle">Drone analysis completed (No Crack)</span><Badge>OK</Badge></li>
            <li className="flex justify-between"><span className="subtle">Critical reading at S-07</span><Badge tone="crit">Critical</Badge></li>
          </ul>
        </Card>
      </div>
    </Layout>
  )
}
