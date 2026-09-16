import './Badge.css'

const TONE_CLASS = {
  neutral: 'ya-badge--neutral',
  primary: 'ya-badge--primary',
  secondary: 'ya-badge--secondary',
  accent: 'ya-badge--accent',
  success: 'ya-badge--success',
  warning: 'ya-badge--warning',
  danger: 'ya-badge--danger',
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClass = TONE_CLASS[tone] ?? TONE_CLASS.neutral
  return <span className={`ya-badge ${toneClass} ${className}`.trim()}>{children}</span>
}

export default Badge
