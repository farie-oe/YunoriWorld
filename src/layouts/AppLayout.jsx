import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ThemeTransitionOverlay from './ThemeTransitionOverlay'
import OnboardingTutorial from '../components/OnboardingTutorial'
import { useAuth } from '../hooks/useAuth'
import { useOnboarding } from '../hooks/useOnboarding'
import './AppLayout.css'

function AppLayout() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const onboarding = useOnboarding(user?.id)

  function handleFinish() {
    onboarding.finish()
    // Per the tutorial's design, finishing always leaves the user on the
    // Dashboard, regardless of which protected page they happened to be on.
    navigate('/dashboard')
  }

  return (
    <div className="ya-app-layout">
      <ThemeTransitionOverlay />
      <Sidebar />
      <main className="ya-app-layout__main">
        <div className="ya-app-layout__content">
          <Outlet />
        </div>
      </main>

      {onboarding.isActive && (
        <OnboardingTutorial
          step={onboarding.step}
          stepIndex={onboarding.stepIndex}
          totalSteps={onboarding.totalSteps}
          isFirst={onboarding.isFirst}
          isLast={onboarding.isLast}
          onNext={onboarding.next}
          onBack={onboarding.back}
          onSkip={onboarding.skip}
          onFinish={handleFinish}
        />
      )}
    </div>
  )
}

export default AppLayout
