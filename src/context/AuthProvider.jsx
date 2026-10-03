import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { supabase, startedInRecovery, startedWithFailedRecoveryLink } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [holdPublicRedirect, setHoldPublicRedirect] = useState(false)
  // True while the session came from a password-recovery link and the
  // password hasn't been changed yet; route guards send the user to
  // /reset-password instead of the dashboard.
  const [isRecovery, setIsRecovery] = useState(startedInRecovery)
  // True when the user arrived via a reset link that Supabase rejected.
  const [recoveryLinkFailed, setRecoveryLinkFailed] = useState(startedWithFailedRecoveryLink)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true)
      if (event === 'SIGNED_OUT') setIsRecovery(false)
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
    isRecovery,
    recoveryLinkFailed,
    acknowledgeRecoveryLinkFailed: () => setRecoveryLinkFailed(false),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
