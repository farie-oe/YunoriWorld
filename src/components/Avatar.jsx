import { useEffect, useState } from 'react'
import { UserCircle } from 'lucide-react'
import { getBuiltInAvatar } from '../lib/avatars'
import { getAvatarSignedUrl } from '../services/avatarStorage'
import './Avatar.css'

/**
 * Renders the user's selected avatar — built-in Yunori artwork, an
 * uploaded photo, or the neutral placeholder icon when none is set — from
 * profiles.avatar_type / profiles.avatar_value. This is the single place
 * that resolves those two fields into something on screen, so Sidebar and
 * Profile (and anywhere else an avatar appears later) never maintain their
 * own separate idea of what the user's avatar is.
 */
function Avatar({ avatarType, avatarValue, size = 40, className = '' }) {
  // Keyed by the avatarValue it was fetched for, so a stale signed URL from
  // a previous avatar is never rendered while the new one is still loading
  // — no separate "reset to null" branch needed when avatarValue changes.
  const [signedUrl, setSignedUrl] = useState(null)

  useEffect(() => {
    if (avatarType !== 'uploaded' || !avatarValue) return

    let cancelled = false

    getAvatarSignedUrl(avatarValue).then((url) => {
      if (!cancelled && url) setSignedUrl({ forValue: avatarValue, url })
    })

    return () => {
      cancelled = true
    }
  }, [avatarType, avatarValue])

  const uploadedUrl = signedUrl && signedUrl.forValue === avatarValue ? signedUrl.url : null

  const style = { width: size, height: size }

  if (avatarType === 'builtin') {
    const builtIn = getBuiltInAvatar(avatarValue)
    if (builtIn) {
      return (
        <span className={`ya-avatar ${className}`.trim()} style={style}>
          <img src={builtIn.image} alt="" className="ya-avatar__image" />
        </span>
      )
    }
  }

  if (avatarType === 'uploaded' && uploadedUrl) {
    return (
      <span className={`ya-avatar ${className}`.trim()} style={style}>
        <img src={uploadedUrl} alt="" className="ya-avatar__image" />
      </span>
    )
  }

  return (
    <span
      className={`ya-avatar ya-avatar--placeholder ${className}`.trim()}
      style={style}
      aria-hidden="true"
    >
      <UserCircle size={Math.round(size * 0.55)} strokeWidth={1.5} />
    </span>
  )
}

export default Avatar
