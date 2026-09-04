import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { neon } from './neonClient'

interface AuthUser {
  id: string
  email: string
  name?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signUp: (params: { email: string; password: string; name: string }) => Promise<{ error: string | null }>
  signIn: (params: { email: string; password: string }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthContextValue['status']>('loading')

  const refresh = useCallback(async () => {
    try {
      const { data } = await neon.auth.getSession()
      const sessionUser = data?.user as AuthUser | undefined
      if (sessionUser) {
        setUser(sessionUser)
        setStatus('authenticated')
        return
      }
    } catch {
      // No session yet, or the auth server is unreachable — either way the
      // user is treated as signed out rather than stuck on a loading screen.
    }
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const signUp: AuthContextValue['signUp'] = useCallback(async ({ email, password, name }) => {
    try {
      const { error } = await neon.auth.signUp.email({ email, password, name })
      if (error) return { error: error.message ?? 'Could not create account.' }
      await refresh()
      return { error: null }
    } catch {
      return { error: 'Could not reach the authentication service. Please try again.' }
    }
  }, [refresh])

  const signIn: AuthContextValue['signIn'] = useCallback(async ({ email, password }) => {
    try {
      const { error } = await neon.auth.signIn.email({ email, password })
      if (error) return { error: error.message ?? 'Invalid email or password.' }
      await refresh()
      return { error: null }
    } catch {
      return { error: 'Could not reach the authentication service. Please try again.' }
    }
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await neon.auth.signOut()
    } catch {
      // Best-effort — the client-side session is cleared below regardless.
    }
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({ user, status, signUp, signIn, signOut }),
    [user, status, signUp, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
