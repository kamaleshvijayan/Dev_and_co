import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'light') html.classList.add('theme-light')
    else html.classList.remove('theme-light')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <button
      aria-label="Toggle theme"
      className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm"
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
    >
      {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  )
}



