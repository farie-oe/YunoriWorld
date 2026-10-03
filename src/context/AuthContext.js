import { createContext } from 'react'

export const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  // Lets a page (e.g. Login, during its post-login transition) tell
  // PublicOnlyRoute to hold off on its usual "session exists, redirect to
  // /dashboard" behaviour, so that page can play a brief animation and
  // navigate on its own terms instead of being yanked away the instant
  // Supabase's session updates.
  holdPublicRedirect: false,
  setHoldPublicRedirect: () => {},
  isRecovery: false,
  recoveryLinkFailed: false,
  acknowledgeRecoveryLinkFailed: () => {},
})
