import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Button from './Button'
import './OnboardingTutorial.css'

const VIEWPORT_MARGIN = 12
// Matches the app's own mobile breakpoint (Sidebar.css/AppLayout.css) where
// the sidebar switches from a vertical rail to a horizontal top bar.
const MOBILE_BREAKPOINT = 767

function getTargetRect(targetId) {
  if (!targetId) return null
  const el = document.querySelector(`[data-tour-id="${targetId}"]`)
  return el ? el.getBoundingClientRect() : null
}

function computeCardPosition(targetRect, cardSize) {
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const maxTop = Math.max(VIEWPORT_MARGIN, viewportHeight - cardSize.height - VIEWPORT_MARGIN)
  const maxLeft = Math.max(VIEWPORT_MARGIN, viewportWidth - cardSize.width - VIEWPORT_MARGIN)

  if (!targetRect) {
    return {
      top: Math.min(maxTop, Math.max(VIEWPORT_MARGIN, (viewportHeight - cardSize.height) / 2)),
      left: Math.min(maxLeft, Math.max(VIEWPORT_MARGIN, (viewportWidth - cardSize.width) / 2)),
    }
  }

  let top
  let left

  if (viewportWidth <= MOBILE_BREAKPOINT) {
    // The sidebar is a horizontal top bar here, so the card goes below the
    // highlighted item — or above it, if there isn't enough room below.
    const spaceBelow = viewportHeight - targetRect.bottom
    if (spaceBelow >= cardSize.height + VIEWPORT_MARGIN * 2) {
      top = targetRect.bottom + VIEWPORT_MARGIN
    } else {
      top = targetRect.top - cardSize.height - VIEWPORT_MARGIN
    }
    left = (viewportWidth - cardSize.width) / 2
  } else {
    // The sidebar is a vertical rail/panel — place the card to its right,
    // vertically centred on the highlighted item.
    top = targetRect.top + targetRect.height / 2 - cardSize.height / 2
    left = targetRect.right + VIEWPORT_MARGIN
  }

  top = Math.min(Math.max(top, VIEWPORT_MARGIN), maxTop)
  left = Math.min(Math.max(left, VIEWPORT_MARGIN), maxLeft)

  return { top, left }
}

/**
 * A lightweight, first-run guided tour: a dimmed backdrop, an optional
 * spotlight ring around the real UI element a step is talking about, and a
 * small floating card with the step's copy and controls. Purely
 * presentational — see src/hooks/useOnboarding.js for the step/state logic
 * and src/lib/onboardingSteps.js for the step content.
 */
function OnboardingTutorial({ step, stepIndex, totalSteps, isFirst, isLast, onNext, onBack, onSkip, onFinish }) {
  const cardRef = useRef(null)
  const [position, setPosition] = useState(null)
  const [highlightRect, setHighlightRect] = useState(null)

  useLayoutEffect(() => {
    function reposition() {
      const targetRect = getTargetRect(step.targetId)
      setHighlightRect(targetRect)

      const card = cardRef.current
      if (!card) return
      setPosition(computeCardPosition(targetRect, { width: card.offsetWidth, height: card.offsetHeight }))
    }

    reposition()
    window.addEventListener('resize', reposition)
    return () => window.removeEventListener('resize', reposition)
  }, [step])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onSkip()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSkip])

  function handlePrimary() {
    if (isLast) onFinish()
    else onNext()
  }

  return (
    <div className="ya-onboarding" role="dialog" aria-modal="true" aria-labelledby="ya-onboarding-heading">
      <div className="ya-onboarding__scrim" aria-hidden="true" />

      {highlightRect && (
        <div
          className="ya-onboarding__highlight"
          aria-hidden="true"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
          }}
        />
      )}

      <div
        ref={cardRef}
        className="ya-onboarding__card"
        style={position ? { top: position.top, left: position.left } : { top: 0, left: 0, visibility: 'hidden' }}
      >
        <span className="ya-onboarding__step-count">
          {stepIndex + 1} of {totalSteps}
        </span>
        <h2 id="ya-onboarding-heading" className="ya-section-heading ya-onboarding__heading">
          {step.heading}
        </h2>
        <p className="ya-text-muted ya-onboarding__text">{step.text}</p>

        <div className="ya-onboarding__actions">
          <button type="button" className="ya-onboarding__skip" onClick={onSkip}>
            Skip tutorial
          </button>

          <div className="ya-onboarding__nav-buttons">
            {!isFirst && (
              <Button type="button" variant="outline" onClick={onBack} aria-label="Previous step">
                Back
              </Button>
            )}
            <Button type="button" onClick={handlePrimary} aria-label={isLast ? 'Finish tutorial' : 'Next step'}>
              {step.primaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingTutorial
