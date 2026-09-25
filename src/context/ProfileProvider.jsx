import { useEffect, useState } from 'react'
import { ProfileContext } from './ProfileContext'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profiles'

/**
 * Fetches the signed-in user's profile row once and shares it across the
 * app (Sidebar, Profile page, …) so a change made in one place — such as
 * picking a new avatar — is reflected everywhere immediately, instead of
 * each consumer keeping its own separate copy that only updates on its
 * next mount.
 */
export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    let cancelled = false

    getProfile(user.id)
      .then((result) => {
        if (!cancelled) setProfile(result)
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <ProfileContext.Provider value={{ profile, loading, setProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}
