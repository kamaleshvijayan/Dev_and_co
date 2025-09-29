import Button from './Button'
import ThemeToggle from './ThemeToggle'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Fixed top bar */}
      <div className="fixed top-0 inset-x-0 z-20 backdrop-blur border-b border-white/10 bg-black/30">
        <div className="container-page py-2 flex items-center justify-between">
          <a href="/" className="text-sm font-semibold">MineGuard 360  </a>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a href="/Dashboard" className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm">Dashboard</a>
            <a href="/drone" className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm">Drone</a>
            
            <a href="/frequency" className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm">Frequency</a>
            <a href="/calculator" className="px-3 py-1.5 rounded bg-white/5 border border-white/10 text-sm">Calculator</a>
            <Button variant="ghost" size="sm" onClick={()=>{ localStorage.removeItem('auth_token'); window.location.href='/login'; }}>Logout</Button>
          </div>
        </div>
      </div>

      {/* Page content with top padding to avoid overlap */}
      <div className="pt-16">
        <div className="container-page py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
