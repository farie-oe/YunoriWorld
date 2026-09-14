import './PageHeader.css'

function PageHeader({ title, description, action }) {
  return (
    <header className="ya-page-header">
      <div>
        <h1 className="ya-page-title">{title}</h1>
        {description && <p className="ya-text-muted ya-page-header__description">{description}</p>}
      </div>
      {action && <div className="ya-page-header__action">{action}</div>}
    </header>
  )
}

export default PageHeader
