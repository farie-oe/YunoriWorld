import { useCallback, useState } from 'react'
import { ONBOARDING_STEPS } from '../lib/onboardingSteps'

const STORAGE_PREFIX = 'yunori-onboarding-complete-'

/**
 * Onboarding completion is tracked in localStorage, keyed per user id — not
 * in profiles, so no database migration is needed for this feature. That
 * also means the tradeoff is real: it's remembered per browser, not per
 * account, so the tour would show again for the same user on a different
 * browser/device. If that ever matters, this is the one place to swap for
 * a `profiles.onboarding_completed` column instead.
 */
function storageKey(userId) {
  return `${STORAGE_PREFIX}${userId}`
}

function readCompleted(userId) {
  if (!userId || typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(storageKey(userId)) === 'true'
  } catch {
    // Storage unavailable (e.g. private browsing) — fail safe by treating
    // onboarding as already seen rather than risking a tour that can never
    // be permanently dismissed.
    return true
  }
}

function markCompleted(userId) {
  if (!userId) return
  try {
    window.localStorage.setItem(storageKey(userId), 'true')
  } catch {
    // Ignore storage errors — the tour simply won't persist as dismissed.
  }
}

/** Dev helper: `import { resetOnboarding } from './hooks/useOnboarding'` in
 * a console session, or just run
 * `localStorage.removeItem('yunori-onboarding-complete-<your-user-id>')`. */
export function resetOnboarding(userId) {
  if (!userId) return
  try {
    window.localStorage.removeItem(storageKey(userId))
  } catch {
    // Nothing to do if storage isn't available.
  }
}

/**
 * Drives the first-time onboarding tutorial: whether it should currently be
 * showing, which step is active, and step navigation. Pure state/logic —
 * OnboardingTutorial only renders whatever this returns.
 */
export function useOnboarding(userId) {
  const [stepIndex, setStepIndex] = useState(0)
  const [isActive, setIsActive] = useState(false)
  // Tracks which user id the state above was last computed for, so it can
  // be recomputed once when userId changes (e.g. auth resolving after
  // mount, or one user logging out and another logging in) — done during
  // render, per React's own pattern for resetting state on a prop change,
  // rather than an effect that would cause an extra render pass.
  const [seenUserId, setSeenUserId] = useState(undefined)

  if (userId !== seenUserId) {
    setSeenUserId(userId)
    setStepIndex(0)
    setIsActive(userId ? !readCompleted(userId) : false)
  }

  const close = useCallback(() => {
    markCompleted(userId)
    setIsActive(false)
  }, [userId])

  const next = useCallback(() => {
    setStepIndex((index) => Math.min(index + 1, ONBOARDING_STEPS.length - 1))
  }, [])

  const back = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0))
  }, [])

  return {
    isActive,
    step: ONBOARDING_STEPS[stepIndex],
    stepIndex,
    totalSteps: ONBOARDING_STEPS.length,
    isFirst: stepIndex === 0,
    isLast: stepIndex === ONBOARDING_STEPS.length - 1,
    next,
    back,
    skip: close,
    finish: close,
  }
}
