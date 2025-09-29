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
  const [showPassword, setShowPassword] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = onLogin(username.trim(), password.trim(), category)
    if (!ok) setError("Invalid credentials")
    else window.location.href = "/"
  }

  return (
  <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-700 animate-gradient">
  <div className="w-full max-w-md px-4">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center mb-2 shadow-lg animate-bounce-slow">
              <span className="text-5xl">⛏️</span>
            </div>
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg tracking-tight font-mono">
              MineGuard <span className="text-indigo-400">360</span>
            </h1>
          </div>
          <div className="w-20 mx-auto border-b-2 border-indigo-500/60 my-4" />
          <p className="text-gray-300 text-base italic">
            Secure access to your mining dashboard
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={submit}
          className="rounded-2xl p-8 space-y-7 border border-indigo-500/30 backdrop-blur-xl bg-white/10 shadow-2xl hover:shadow-indigo-700/40 transition-shadow duration-300"
        >
          <div className="space-y-4">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-white/10 border border-indigo-400/40 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow"
              placeholder="Username"
              required
              autoFocus
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-white/10 border border-indigo-400/40 px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 012.197-6.263m1.414-1.414A9.96 9.96 0 0112 3c5.523 0 10 4.477 10 10a9.96 9.96 0 01-1.197 4.263m-1.414 1.414A10.05 10.05 0 0112 19c-1.02 0-2.01-.153-2.925-.438m-1.414-1.414A9.96 9.96 0 012 13c0-5.523 4.477-10 10-10a9.96 9.96 0 016.263 2.197m1.414 1.414A9.96 9.96 0 0122 13c0 5.523-4.477 10-10 10a9.96 9.96 0 01-4.263-1.197m-1.414-1.414A10.05 10.05 0 013 12c0-1.02.153-2.01.438-2.925" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-indigo-400/40 px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition hover:bg-slate-700 cursor-pointer appearance-none shadow"
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
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
            className="w-full py-3 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white font-semibold shadow-lg transition transform hover:scale-[1.03] mt-2"
          >
            Sign in
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-gray-400 text-xs tracking-wide">
          © 2025 <span className="text-indigo-400">MineGuard 360</span>. All rights reserved.
        </p>
      </div>
    </div>
  )
}
