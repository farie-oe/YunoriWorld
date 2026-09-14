import './Badge.css'

const TONE_CLASS = {
  neutral: 'ya-badge--neutral',
  primary: 'ya-badge--primary',
  secondary: 'ya-badge--secondary',
  accent: 'ya-badge--accent',
}

function Badge({ children, tone = 'neutral', className = '' }) {
  const toneClass = TONE_CLASS[tone] ?? TONE_CLASS.neutral
  return <span className={`ya-badge ${toneClass} ${className}`.trim()}>{children}</span>
}

export default Badge
