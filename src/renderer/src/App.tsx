import { useEffect } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from './components/layout/Layout'
import { Home } from './pages/Home'
import { Profiles } from './pages/Profiles'
import { Settings } from './pages/Settings'
import { About } from './pages/About'
import { Welcome } from './components/onboarding/Welcome'
import { useTheme } from './hooks/useTheme'
import { useSettingsStore } from './store/settingsStore'
import { useUiStore } from './store/uiStore'

function AppShell(): JSX.Element {
  useTheme()
  const { settings, loaded } = useSettingsStore()
  const { showOnboarding, setShowOnboarding } = useUiStore()

  useEffect(() => {
    if (loaded && settings.showOnboarding) {
      setShowOnboarding(true)
    }
  }, [loaded, settings.showOnboarding, setShowOnboarding])

  return (
    <>
      {showOnboarding && <Welcome onClose={() => setShowOnboarding(false)} />}
      <Layout />
    </>
  )
}

const router = createHashRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/profiles', element: <Profiles /> },
      { path: '/settings', element: <Settings /> },
      { path: '/about', element: <About /> }
    ]
  }
])

export default function App(): JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '12px',
            fontSize: '13px'
          }
        }}
      />
    </>
  )
}
