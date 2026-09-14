import { Clapperboard, PlayCircle, CheckCircle2, Bookmark } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { Sparkle } from '../components/Decorative'
import './Dashboard.css'

const STATS = [
  { label: 'Total Anime', icon: Clapperboard },
  { label: 'Watching', icon: PlayCircle },
  { label: 'Completed', icon: CheckCircle2 },
  { label: 'Want to Watch', icon: Bookmark },
]

function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Welcome back!"
        description={
          <span className="ya-dashboard__tagline">
            <Sparkle /> Your anime. Your journey. Your way. &hearts;
          </span>
        }
      />

      <section className="ya-dashboard__section">
        <h2 className="ya-section-heading">Your Anime Journey</h2>
        <p className="ya-text-muted ya-dashboard__section-sub">
          A quick snapshot of your collection. Add anime to start filling these in.
        </p>

        <div className="ya-dashboard__stats">
          {STATS.map(({ label, icon: Icon }) => (
            <Card key={label} hoverable className="ya-stat-card">
              <div className="ya-stat-card__icon" aria-hidden="true">
                <Icon size={22} />
              </div>
              <span className="ya-stat-card__value">—</span>
              <span className="ya-text-muted ya-stat-card__label">{label}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Dashboard
