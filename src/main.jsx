import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import './styles/themes.css'
import './styles/forms.css'
import { ThemeProvider } from './context/ThemeProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { ProfileProvider } from './context/ProfileProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  </StrictMode>,
)
