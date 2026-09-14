import Card from './Card'
import './EmptyState.css'

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <Card className="ya-empty-state">
      {Icon && (
        <div className="ya-empty-state__icon" aria-hidden="true">
          <Icon size={28} />
        </div>
      )}
      <h3 className="ya-section-heading">{title}</h3>
      {description && <p className="ya-text-muted ya-empty-state__description">{description}</p>}
      {action && <div className="ya-empty-state__action">{action}</div>}
    </Card>
  )
}

export default EmptyState
