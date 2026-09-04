import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './lib/AuthProvider'
import { SignIn } from './routes/SignIn'
import { SignUp } from './routes/SignUp'
import { Contacts } from './routes/Contacts'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status } = useAuth()
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted-foreground)]">
        Loading…
      </div>
    )
  }
  if (status === 'unauthenticated') return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route
        path="/contacts"
        element={
          <RequireAuth>
            <Contacts />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/contacts" replace />} />
    </Routes>
  )
}

export default App
