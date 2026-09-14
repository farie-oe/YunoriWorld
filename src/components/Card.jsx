import './Card.css'

function Card({ children, hoverable = false, className = '', as: Tag = 'div', ...rest }) {
  const hoverClass = hoverable ? 'ya-card--hoverable' : ''
  return (
    <Tag className={`ya-card ${hoverClass} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  )
}

export default Card
