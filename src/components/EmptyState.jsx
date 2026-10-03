import Card from './Card'
import './EmptyState.css'

/**
 * `image` (a mascot/illustration URL) takes precedence over `icon` (a Lucide
 * component). `dashed` swaps the filled card for the lighter dashed-outline
 * look used inside the dashboard panels.
 */
function EmptyState({ icon: Icon, image, title, description, action, dashed = false }) {
  return (
    <Card className={`ya-empty-state ${dashed ? 'ya-empty-state--dashed' : ''}`.trim()}>
      {image ? (
        <img src={image} alt="" className="ya-empty-state__image" />
      ) : (
        Icon && (
          <div className="ya-empty-state__icon" aria-hidden="true">
            <Icon size={28} />
          </div>
        )
      )}
      <h3 className="ya-section-heading">{title}</h3>
      {description && <p className="ya-text-muted ya-empty-state__description">{description}</p>}
      {action && <div className="ya-empty-state__action">{action}</div>}
    </Card>
  )
}

export default EmptyState
