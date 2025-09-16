type Props = { children: React.ReactNode; tone?: 'ok' | 'warn' | 'crit'; className?: string }
export default function Badge({ children, tone = 'ok', className = '' }: Props) {
  const t = tone === 'ok' ? 'badge-ok' : tone === 'warn' ? 'badge-warn' : 'badge-crit'
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs ${t} ${className}`}>{children}</span>
}



