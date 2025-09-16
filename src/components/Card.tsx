export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`glass rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm subtle">{subtitle}</div>
        <h3 className="text-xl font-semibold text-white/95">{title}</h3>
      </div>
      {right}
    </div>
  )
}



