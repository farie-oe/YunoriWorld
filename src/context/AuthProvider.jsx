import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { supabase } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [holdPublicRedirect, setHoldPublicRedirect] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
    holdPublicRedirect,
    setHoldPublicRedirect,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
