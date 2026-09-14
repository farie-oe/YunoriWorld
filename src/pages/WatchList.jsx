import { Bookmark } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'

function WatchList() {
  return (
    <div>
      <PageHeader
        title="Watch List"
        description="Anime you're planning to watch next."
      />

      <EmptyState
        icon={Bookmark}
        title="Nothing on your watch list yet"
        description="Anime you mark as “Want to Watch” from My Anime will appear here, ready for whenever you're ready to start."
      />
    </div>
  )
}

export default WatchList
