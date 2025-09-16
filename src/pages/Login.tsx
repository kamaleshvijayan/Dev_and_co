import { useState } from 'react'
import Button from '../components/Button'

type Props = {
  onLogin: (u: string, p: string, c: string) => boolean
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = onLogin(username.trim(), password.trim(), category)
    if (!ok) setError('Invalid credentials')
    else window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white">⛏️ Mining Monitor</h1>
          <p className="text-gray-300 mt-2">Secure access to monitoring dashboard</p>
        </div>
        <form onSubmit={submit} className="bg-slate-800 rounded-2xl p-8 space-y-4 border border-slate-700">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Password"
              required
            />
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" disabled className="text-gray-400 bg-slate-700">Category</option>
              <option value="employee" className="text-white bg-slate-700">Employee</option>
              <option value="manager" className="text-white bg-slate-700">Manager</option>
              <option value="higher_official" className="text-white bg-slate-700">Higher Official</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
