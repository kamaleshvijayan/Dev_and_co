type Props = {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
}

export default function Button({ children, onClick, type = 'button', variant = 'primary', size = 'md', className = '', disabled }: Props) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed'
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
  const variants = variant === 'ghost'
    ? 'bg-white/5 hover:bg-white/10 border border-white/15'
    : variant === 'danger'
    ? 'bg-gradient-to-br from-rose-500 to-red-600 hover:brightness-110 text-white'
    : 'bg-gradient-to-br from-indigo-500 to-blue-600 hover:brightness-110 text-white'
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes} ${variants} ${className}`} disabled={disabled}>
      {children}
    </button>
  )
}
