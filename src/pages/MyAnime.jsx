import { Search, Plus, Clapperboard } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import './MyAnime.css'

function MyAnime() {
  return (
    <div>
      <PageHeader
        title="My Anime"
        description="Every anime you've added to your collection, in one place."
        action={<Button icon={Plus}>Add Anime</Button>}
      />

      <div className="ya-my-anime__toolbar">
        <div className="ya-my-anime__search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            className="ya-input ya-my-anime__search-input"
            placeholder="Search your anime..."
            aria-label="Search your anime"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <EmptyState
        icon={Clapperboard}
        title="Your collection is empty"
        description="Anime you add will show up here, ready to track and organise."
        action={<Button icon={Plus}>Add Your First Anime</Button>}
      />
    </div>
  )
}

export default MyAnime
