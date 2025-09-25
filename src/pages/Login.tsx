import { useState } from "react"
import Button from "../components/Button"

type Props = {
  onLogin: (u: string, p: string, c: string) => boolean
}

export default function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [category, setCategory] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = onLogin(username.trim(), password.trim(), category)
    if (!ok) setError("Invalid credentials")
    else window.location.href = "/"
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md px-4">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-2">
              <span className="text-4xl">⛏️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-tight">
              Mining Monitor
            </h1>
          </div>
          <div className="w-16 mx-auto border-b-2 border-indigo-500/60 my-4" />
          <p className="text-gray-300 text-base">
            Secure access to monitoring dashboard
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={submit}
          className="rounded-2xl p-8 space-y-7 border border-white/10 backdrop-blur-xl bg-white/10 shadow-2xl"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Username"
              required
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Password"
              required
            />
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-white/20 px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition hover:bg-slate-700 cursor-pointer appearance-none"
                required
                style={{ colorScheme: 'dark' }}
              >
                <option value="" disabled className="bg-slate-800 text-gray-400">
                  Select Category
                </option>
                <option value="employee" className="bg-slate-800 text-white">Employee</option>
                <option value="manager" className="bg-slate-800 text-white">Manager</option>
                <option value="higher_official" className="bg-slate-800 text-white">Higher Official</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center mt-2">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg transition transform hover:scale-[1.02] mt-2"
          >
            Sign in
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-400 text-xs tracking-wide">
          © 2025 Mining Monitor. All rights reserved.
        </p>
      </div>
    </div>
  )
}
